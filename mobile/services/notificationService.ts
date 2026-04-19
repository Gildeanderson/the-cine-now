import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Comportamento default no topo da tela para Foreground Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Padrão',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#a3a6ff',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações Negada!');
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '70a74708-111a-42c1-82b1-e328427ee85f', 
      })).data;
    } catch (e) {
      console.log('Expo Push Token bypassado para testes locais.', e);
    }
  } else {
    console.log('Use um dispositivo físico ou emulador moderno para testes precisos de Push');
  }

  return token;
}

/**
 * Envia uma notificação local com suporte a imagem (poster do filme ou foto do ator).
 * @param payload - Conteúdo opcional: título, corpo e URL da imagem
 */
export async function scheduleTestNotification(payload?: {
  title?: string;
  body?: string;
  imageUrl?: string;
}) {
  try {
    const title = payload?.title || '🎬 Cine Now: Lançamento Fresquinho!';
    const body = payload?.body || 'O trailer do filme mais aguardado acaba de ser publicado. Venha conferir!';

    // Usa 'any' para suportar campos plataforma-específicos sem conflito de tipos
    const content: any = {
      title,
      body,
      sound: true,
      data: { imageUrl: payload?.imageUrl },
    };

    // iOS: exibe miniatura da imagem na notificação via attachment
    if (Platform.OS === 'ios' && payload?.imageUrl) {
      content.attachments = [
        {
          url: payload.imageUrl,
          identifier: 'media-thumb',
          hideThumbnail: false,
        },
      ];
    }

    // Android: ícone grande e imagem expandida
    if (Platform.OS === 'android' && payload?.imageUrl) {
      content.android = {
        largeIcon: payload.imageUrl,
        bigPicture: payload.imageUrl,
      };
    }

    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null,
    });
  } catch (error) {
    console.error('Erro na notificação local:', error);
  }
}
