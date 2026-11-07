import Notification from '../models/Notification.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const sendNotification = async ({ userId, title, message, type, link }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'system',
      link: link || '/',
    });

    // Real-time broadcast via Socket.IO if recipient is connected
    if (ioInstance) {
      ioInstance.to(userId.toString()).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

