import { create } from 'zustand';
import type { Message, Conversation, Memory } from '../types';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  memories: Memory[];
  isStreaming: boolean;
  streamingContent: string;
  memoryPanelOpen: boolean;
  pendingAttachments: File[];
  uploading: boolean;

  setConversations: (convs: Conversation[]) => void;
  addConversation: (conv: Conversation) => void;
  removeConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setStreaming: (v: boolean) => void;
  appendStreamToken: (token: string) => void;
  clearStream: () => void;
  setMemories: (mems: Memory[]) => void;
  addMemory: (mem: Memory) => void;
  removeMemory: (id: string) => void;
  toggleMemoryPanel: () => void;
  addPendingAttachment: (file: File) => void;
  removePendingAttachment: (index: number) => void;
  clearPendingAttachments: () => void;
  setUploading: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  memories: [],
  isStreaming: false,
  streamingContent: '',
  memoryPanelOpen: true,
  pendingAttachments: [],
  uploading: false,

  setConversations: (convs) => set({ conversations: convs }),
  addConversation: (conv) =>
    set((s) => ({ conversations: [conv, ...s.conversations] })),
  removeConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
    })),
  setCurrentConversation: (id) =>
    set({ currentConversationId: id, messages: [], streamingContent: '' }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
  appendStreamToken: (token) =>
    set((s) => ({ streamingContent: s.streamingContent + token })),
  clearStream: () => set({ streamingContent: '' }),
  setMemories: (mems) => set({ memories: mems }),
  addMemory: (mem) =>
    set((s) => ({ memories: [mem, ...s.memories] })),
  removeMemory: (id) =>
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
  toggleMemoryPanel: () =>
    set((s) => ({ memoryPanelOpen: !s.memoryPanelOpen })),
  addPendingAttachment: (file) =>
    set((s) => ({ pendingAttachments: [...s.pendingAttachments, file] })),
  removePendingAttachment: (index) =>
    set((s) => ({
      pendingAttachments: s.pendingAttachments.filter((_, i) => i !== index),
    })),
  clearPendingAttachments: () => set({ pendingAttachments: [] }),
  setUploading: (v) => set({ uploading: v }),
}));
