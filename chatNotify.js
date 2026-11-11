const CHOICE_KEY = 'gamezone_chat_notify';

export function getChatNotifyChoice() {
  try {
    const choice = window.localStorage.getItem(CHOICE_KEY);
    return choice === 'aan' || choice === 'uit' ? choice : null;
  } catch {
    return null;
  }
}

export function setChatNotifyChoice(choice) {
  if (choice !== 'aan' && choice !== 'uit') return;
  try {
    window.localStorage.setItem(CHOICE_KEY, choice);
  } catch {
    // Browsers can disable storage; never prevent the chat from opening.
  }
}

export async function requestChatNotifyPermission() {
  if (!('Notification' in window)) return false;
  try {
    const permission = window.Notification.permission === 'default'
      ? await window.Notification.requestPermission()
      : window.Notification.permission;
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function showChatNotification(message) {
  if (getChatNotifyChoice() !== 'aan' || !('Notification' in window)) return null;
  if (window.Notification.permission !== 'granted') return null;
  try {
    return new window.Notification(message?.sender_name || 'Nieuw chatbericht', {
      body: message?.message || '',
      tag: 'gamezone-chat',
    });
  } catch {
    return null;
  }
}
