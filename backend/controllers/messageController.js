import Message from '../models/Message.js';
import User from '../models/User.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, conversationId, message, messageType } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message content are required' });
    }

    // Standardized conversationId if not provided: sorted IDs
    const convId =
      conversationId || [req.user.id, receiverId].sort().join('_');

    const newMsg = await Message.create({
      senderId: req.user.id,
      receiverId,
      conversationId: convId,
      message,
      messageType: messageType || 'text',
    });

    // Notify receiver
    await sendNotification({
      userId: receiverId,
      title: `New Message from ${req.user.name}`,
      message: message.slice(0, 80) + (message.length > 80 ? '...' : ''),
      type: 'message',
      link: `/messages?conv=${convId}`,
    });

    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history of a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessagesByConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name profileImage role')
      .populate('receiverId', 'name profileImage role')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId, receiverId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for currently logged in user
// @route   GET /api/messages
// @access  Private
export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate unique conversation threads
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name profileImage role')
      .populate('receiverId', 'name profileImage role')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();

    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        const partner =
          msg.senderId._id.toString() === userId.toString()
            ? msg.receiverId
            : msg.senderId;

        conversationsMap.set(msg.conversationId, {
          id: msg.conversationId,
          conversationId: msg.conversationId,
          partner,
          lastMessage: msg.message,
          lastUpdated: msg.createdAt,
          unreadCount: 0,
        });
      }

      if (
        msg.receiverId._id.toString() === userId.toString() &&
        !msg.isRead
      ) {
        const conv = conversationsMap.get(msg.conversationId);
        conv.unreadCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: Array.from(conversationsMap.values()),
    });
  } catch (error) {
    next(error);
  }
};

