export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
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

  send(title: string, body: string, icon = '/logo.png') {
    console.log('Tentando enviar notificação:', { title, body, status: Notification.permission });

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

  // Notificação de Novo Filme (TMDB Simulação)
  notifyNewMovie(movieName: string) {
    this.send(
      '🌟 Novo Lançamento!',
      `"${movieName}" acaba de ser adicionado ao The Cine Now. Assista agora!`
    );
  }

  // Notificação de Ator Favorito
  notifyFavoriteActorNewMovie(actorName: string, movieName: string) {
    this.send(
      '🔥 Alerta de Favorito!',
      `Seu ator favorito ${actorName} tem um novo filme: "${movieName}". Não perca!`
    );
  }

  // Notificação de Boas-vindas
  notifyEnabled() {
    this.send(
      '🔔 Notificações Ativadas!',
      'Você receberá alertas sobre novos lançamentos e seus atores favoritos.'
    );
  }
}

export const notificationService = NotificationService.getInstance();
