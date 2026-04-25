import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface InternalNotification {
  id: string;
  title: string;
  body: string;
  type: 'movie' | 'actor' | 'system';
  read: boolean;
  createdAt: any;
  link?: string;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async saveToFirestore(userId: string, title: string, body: string, type: string = 'system', link?: string) {
    try {
      const notificationsRef = collection(db, 'users', userId, 'notifications');
      await addDoc(notificationsRef, {
        title,
        body,
        type,
        read: false,
        createdAt: serverTimestamp(),
        link: link || null
      });
    } catch (error) {
      console.error('Error saving notification to Firestore:', error);
    }
  }

  async send(title: string, body: string, userId?: string, type: string = 'system', link?: string, icon = '/logo.png') {
    if (userId) {
      await this.saveToFirestore(userId, title, body, type, link);
    }

    console.log('Tentando enviar notificação nativa:', { title, body, status: Notification.permission });

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon,
          badge: icon,
          tag: 'the-cine-now-notification-' + Date.now(),
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.error('Erro ao criar notificação nativa:', err);
      }
    } else {
      console.warn('Permissão de notificação negada ou não solicitada. Status:', Notification.permission);
      // Fallback: Mostrar no console de forma destacada se o sistema bloquear
      console.log(`%c NOTIFICAÇÃO: ${title} - ${body} `, 'background: #2563eb; color: #fff; padding: 10px; border-radius: 5px;');
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações desktop');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Notificação de Novo Filme (TMDB Simulação)
  notifyNewMovie(movieName: string, userId?: string, movieId?: string) {
    this.send(
      '🌟 Novo Lançamento!',
      `"${movieName}" acaba de ser adicionado ao The Cine Now. Assista agora!`,
      userId,
      'movie',
      movieId ? `/movie/${movieId}` : undefined
    );
  }

  // Notificação de Ator Favorito
  notifyFavoriteActorNewMovie(actorName: string, movieName: string, userId?: string, movieId?: string) {
    this.send(
      '🔥 Alerta de Favorito!',
      `Seu ator favorito ${actorName} tem um novo filme: "${movieName}". Não perca!`,
      userId,
      'actor',
      movieId ? `/movie/${movieId}` : undefined
    );
  }

  // Notificação de Boas-vindas
  notifyEnabled(userId?: string) {
    this.send(
      '🔔 Notificações Ativadas!',
      'Você receberá alertas sobre novos lançamentos e seus atores favoritos.',
      userId,
      'system'
    );
  }
}

export const notificationService = NotificationService.getInstance();
