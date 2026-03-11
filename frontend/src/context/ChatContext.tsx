import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  Conversation,
  DisplayMessage,
  generateId,
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
} from '../services/storage';

interface ChatContextState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  createConversation: () => Conversation;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateMessages: (id: string, messages: DisplayMessage[]) => void;
}

const ChatContext = createContext<ChatContextState>({
  conversations: [],
  activeConversation: null,
  createConversation: () => ({ id: '', title: '', messages: [], createdAt: 0, updatedAt: 0 }),
  switchConversation: () => {},
  deleteConversation: () => {},
  updateMessages: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveConversationId());
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Persist conversations with debounce
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveConversations(conversations);
    }, 300);
    return () => clearTimeout(saveTimer.current);
  }, [conversations]);

  // Persist active id immediately
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const createConversation = useCallback(() => {
    const now = Date.now();
    const conv: Conversation = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations(prev => [conv, ...prev]);
    setActiveId(conv.id);
    return conv;
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setActiveId(prev => prev === id ? null : prev);
  }, []);

  const updateMessages = useCallback((id: string, messages: DisplayMessage[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== id) return c;
      const title = c.title === 'New chat' && messages.length > 0
        ? messages.find(m => m.role === 'user')?.content.slice(0, 50) || c.title
        : c.title;
      return { ...c, messages, title, updatedAt: Date.now() };
    }));
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      createConversation,
      switchConversation,
      deleteConversation,
      updateMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
