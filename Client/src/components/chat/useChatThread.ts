import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../../services/chat';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { formatClock } from '../../utils/time';
import type { Conversation, Message } from '../../types/social';

export function useChatThread(conversation: Conversation) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number>();
  const initialCountRef = useRef(0);

  // Load message history from backend & mark seen
  useEffect(() => {
    let mounted = true;

    async function loadThread() {
      try {
        const { messages: history } = await chatService.getMessages(conversation.id);
        if (mounted) {
          setMessages(history);
          initialCountRef.current = history.length;
          // Mark seen on server
          chatService.markAsSeen(conversation.id).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to load thread messages:', err);
      }
    }

    loadThread();

    // Socket.io integration
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join_chat', conversation.id);
    socket.emit('mark_seen', { conversationId: conversation.id });

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === conversation.id) {
        const isOwn =
          (msg.senderId && String(msg.senderId) === String(currentUser?.id)) ||
          (msg.sender?.id && String(msg.sender.id) === String(currentUser?.id)) ||
          (typeof msg.sender === 'string' && msg.sender === String(currentUser?.id)) ||
          msg.from === 'me';

        setMessages((prev) => {
          // If this exact message ID is already in the list, ignore
          if (prev.some((m) => m.id === msg.id)) return prev;

          // If message is from current user, reconcile with matching optimistic message
          if (isOwn) {
            const tempIndex = prev.findIndex((m) => m.id.startsWith('temp-') && m.text === msg.text);
            if (tempIndex !== -1) {
              const updated = [...prev];
              updated[tempIndex] = {
                id: msg.id,
                from: 'me',
                text: msg.text,
                time: typeof msg.time === 'string' ? formatClock(new Date(msg.time)) : formatClock(new Date()),
                status: msg.status || 'delivered',
              };
              return updated;
            }
            // If already replaced or sent from another tab, append with from: 'me'
            return [
              ...prev,
              {
                id: msg.id,
                from: 'me',
                text: msg.text,
                time: typeof msg.time === 'string' ? formatClock(new Date(msg.time)) : formatClock(new Date()),
                status: msg.status || 'delivered',
              },
            ];
          }

          // Incoming message from them
          return [
            ...prev,
            {
              id: msg.id,
              from: 'them',
              text: msg.text,
              time: typeof msg.time === 'string' ? formatClock(new Date(msg.time)) : formatClock(new Date()),
              status: msg.status || 'delivered',
            },
          ];
        });

        // Mark seen if message is from them
        if (!isOwn) {
          chatService.markAsSeen(conversation.id).catch(() => {});
          socket.emit('mark_seen', { conversationId: conversation.id });
        }
      }
    };

    const handleUserTyping = (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversation.id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessagesSeen = (data: { conversationId: string }) => {
      if (data.conversationId === conversation.id) {
        setMessages((prev) =>
          prev.map((m) => (m.from === 'me' ? { ...m, status: 'read' } : m))
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      mounted = false;
      socket.emit('leave_chat', conversation.id);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_seen', handleMessagesSeen);
    };
  }, [conversation.id]);

  // Auto-scroll on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Emit typing indicator to socket
  const onTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing_start', { conversationId: conversation.id });

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', { conversationId: conversation.id });
    }, 1800);
  }, [conversation.id]);

  // Send message
  const send = useCallback(
    async (text: string, file?: File) => {
      const socket = getSocket();
      if (socket) {
        socket.emit('typing_stop', { conversationId: conversation.id });
      }

      // Optimistic message UI
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: Message = {
        id: tempId,
        from: 'me',
        text: text || (file ? 'Sent attachment' : ''),
        time: formatClock(new Date()),
        status: 'delivered',
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        // Send to backend via REST to ensure MongoDB persistence
        const realMsg = await chatService.sendMessage(conversation.id, {
          text,
          file,
          type: file ? 'image' : 'text',
        });

        // Replace temp optimistic message with real DB message
        setMessages((prev) => {
          if (prev.some((m) => m.id === realMsg.id)) {
            // Already reconciled by socket event
            return prev.filter((m) => m.id !== tempId);
          }
          return prev.map((m) => (m.id === tempId ? { ...realMsg, from: 'me' } : m));
        });
      } catch (err) {
        console.warn('Failed to send message:', err);
      }
    },
    [conversation.id]
  );

  return {
    messages,
    isTyping,
    send,
    onTyping,
    scrollRef,
    initialCount: initialCountRef.current,
  };
}
