import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, AlertCircle, Film } from 'lucide-react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

interface ReactPlayerProps {
  url?: string;
  playing?: boolean;
  loop?: boolean;
  controls?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  width?: string | number;
  height?: string | number;
  style?: object;
  progressInterval?: number;
  playsinline?: boolean;
  pip?: boolean;
  stopOnUnmount?: boolean;
  light?: boolean | string;
  playIcon?: React.ReactElement;
  previewTabIndex?: number;
  oEmbedConfig?: object;
  wrapper?: any;
  config?: any;
  onReady?: (player: any) => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onBuffer?: () => void;
  onBufferEnd?: () => void;
  onEnded?: () => void;
  onError?: (error: any, data?: any, hlsInstance?: any, hlsGlobal?: any) => void;
  onDuration?: (duration: number) => void;
  onSeek?: (seconds: number) => void;
  onPlaybackRateChange?: (speed: number) => void;
  onPlaybackQualityChange?: (quality: string) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onClickPreview?: (event: any) => void;
  onEnablePIP?: () => void;
  onDisablePIP?: () => void;
}

const Player = ReactPlayer as any;

export default function VideoPlayer({ videoKey, title, onClose }: VideoPlayerProps) {
  useEffect(() => {
    console.log('VideoPlayer mounted with key:', videoKey);
  }, [videoKey]);

  useEffect(() => {
    console.log('VideoPlayer - videoKey changed:', videoKey);
  }, [videoKey]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const playerRef = useRef<any>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // If unmuting, ensure we are playing
    if (isMuted) {
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    playerRef.current?.seekTo(newTime, 'seconds');
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timeout: any;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Safety timeout: if player doesn't load in 8 seconds, show it anyway or handle error
    const safetyTimeout = setTimeout(() => {
      if (!isReady && !hasError) {
        console.warn('ReactPlayer safety timeout reached');
        setIsReady(true);
      }
    }, 8000);

    return () => clearTimeout(safetyTimeout);
  }, [isReady, hasError]);

  const videoUrl = `https://youtu.be/${videoKey}`;
  console.log('VideoPlayer - Final Video URL:', videoUrl);

  useEffect(() => {
    console.log('VideoPlayer - State Update:', { isReady, isPlaying, isMuted, hasError, duration, currentTime });
  }, [isReady, isPlaying, isMuted, hasError, duration, currentTime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-obsidian flex items-center justify-center overflow-hidden"
    >
      {/* Always visible close button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-black/40 backdrop-blur-xl text-white hover:bg-white/10 active:scale-95 transition-all border border-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* ReactPlayer Container */}
      <div className="absolute inset-0 w-full h-full z-10 bg-black">
        <div className="w-full h-full">
          {videoKey ? (
            <Player
              key={videoKey}
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${videoKey}`}
              playing={isReady && isPlaying}
              muted={isMuted}
              controls={false}
              width="100%"
              height="100%"
              playsinline
              onReady={() => {
                console.log('ReactPlayer - onReady');
                setIsReady(true);
                if (playerRef.current) {
                  const d = playerRef.current.getDuration();
                  if (d > 0) setDuration(d);
                }
              }}
              onStart={() => {
                console.log('ReactPlayer - onStart');
                setIsReady(true);
              }}
              onError={(e: any) => {
                console.error('ReactPlayer Error:', e);
                setHasError(true);
              }}
              onProgress={(state: any) => {
                setCurrentTime(state.playedSeconds);
                if (duration === 0 && playerRef.current) {
                  const d = playerRef.current.getDuration();
                  if (d > 0) setDuration(d);
                }
              }}
              onPlay={() => {
                console.log('ReactPlayer - onPlay');
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log('ReactPlayer - onPause');
                if (isReady) setIsPlaying(false);
              }}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    disablekb: 1,
                    playsinline: 1
                  }
                } as any
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-obsidian text-center p-8 space-y-4">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                <Film className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold">Trailer Unavailable</h3>
              <p className="text-on-surface-variant max-w-xs">
                We couldn't find a trailer for this movie. Please try another one.
              </p>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-surface-high text-on-surface font-bold rounded-full hover:bg-white/10 transition-colors"
              >
                Close Player
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {!isReady && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-electric-indigo/20 rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-electric-indigo border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-headline font-bold tracking-widest uppercase text-xs">Preparing Cinema</p>
              <p className="text-white/40 font-headline font-medium tracking-widest uppercase text-[10px]">Lumina Stream Experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-headline text-2xl font-bold">Playback Error</h3>
              <p className="text-white/60 text-sm">This trailer is currently unavailable. It might be restricted or removed from YouTube.</p>
              <p className="text-white/40 text-[10px] font-mono">Video ID: {videoKey}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a 
                href={`https://www.youtube.com/watch?v=${videoKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full bg-electric-indigo text-obsidian font-bold hover:scale-105 active:scale-95 transition-all"
              >
                Watch on YouTube
              </a>
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-all border border-white/10"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mute Overlay */}
      <AnimatePresence>
        {isReady && isMuted && !hasError && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleToggleMute}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-electric-indigo text-obsidian font-bold flex items-center gap-2 shadow-2xl shadow-electric-indigo/40 hover:scale-105 active:scale-95 transition-all"
          >
            <VolumeX className="w-5 h-5" />
            Click to Unmute
          </motion.button>
        )}
      </AnimatePresence>

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && isReady && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col justify-between p-8 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-white font-headline font-medium text-lg tracking-tight opacity-80">{title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Maximize className="w-5 h-5 text-white opacity-60" />
                </button>
              </div>
            </div>

            {/* Center Play/Pause */}
            <div className="flex items-center justify-center">
              <button 
                onClick={handleTogglePlay}
                className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-current" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-6">
              {/* Progress Bar */}
              <div 
                ref={progressRef}
                onClick={handleSeek}
                className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden group cursor-pointer"
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-electric-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300" 
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button onClick={handleTogglePlay} className="text-white hover:text-electric-indigo transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                  </button>
                  <button onClick={() => playerRef.current?.seekTo(currentTime - 10, 'seconds')} className="text-white hover:text-electric-indigo transition-colors">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3 group">
                    <button onClick={handleToggleMute} className="text-white hover:text-electric-indigo transition-colors">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all" style={{ width: isMuted ? '0%' : '75%' }} />
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trailer Official</span>
                  <button className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest transition-colors border border-white/5">
                    Next Trailer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
