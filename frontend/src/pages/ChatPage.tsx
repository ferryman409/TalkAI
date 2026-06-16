import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Character, Message } from '../types';
import type { MessageAttachment } from '../types/message';
import { listConversations, createConversation, getMessages, streamMessage } from '../api/conversations';
import { getCharacter } from '../api/characters';
import { listMemories } from '../api/memories';
import { uploadFile } from '../api/uploads';
import { useChatStore } from '../store/chatStore';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { MemoryPanel } from '../components/memory/MemoryPanel';
import { Spinner } from '../components/ui/Spinner';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const store = useChatStore();
  const abortRef = useRef<AbortController | null>(null);

  const [character, setCharacter] = useState<Character | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const data = await listConversations();
      store.setConversations(data.items);
    } catch { /* ignore */ }
  }, [store]);

  // Load messages for current conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true);
    try {
      const data = await getMessages(convId);
      store.setMessages(data.items);
    } catch {
      store.setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [store]);

  // Load memories
  const loadMemories = useCallback(async (charId: string) => {
    try {
      const data = await listMemories(charId);
      store.setMemories(data.items);
    } catch { /* ignore */ }
  }, [store]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await loadConversations();

      if (conversationId) {
        store.setCurrentConversation(conversationId);
        await loadMessages(conversationId);

        // Load character
        const convs = useChatStore.getState().conversations;
        const current = convs.find((c) => c.id === conversationId);
        if (current) {
          try {
            const char = await getCharacter(current.character_id);
            setCharacter(char);
            await loadMemories(char.id);
          } catch { /* ignore */ }
        }
      }

      setPageLoading(false);
    };
    init();

    return () => {
      abortRef.current?.abort();
    };
  }, [conversationId]);

  const handleNewChat = useCallback(async () => {
    if (!character) {
      navigate('/characters');
      return;
    }
    try {
      const conv = await createConversation(character.id);
      store.addConversation(conv);
      navigate(`/chat/${conv.id}`);
    } catch { /* ignore */ }
  }, [character, navigate, store]);

  const handleSend = useCallback(async (content: string, remember: boolean, files: File[]) => {
    if (!conversationId) return;

    // Upload files first
    let uploadedAtts: MessageAttachment[] = [];
    if (files.length > 0) {
      store.setUploading(true);
      try {
        uploadedAtts = await Promise.all(files.map((f) => uploadFile(f)));
      } catch {
        store.setUploading(false);
        return;
      }
      store.setUploading(false);
    }

    // Build display content for the message bubble
    let displayContent = content;
    for (const att of uploadedAtts) {
      if (att.type === 'image') {
        displayContent += displayContent ? `\n[图片: ${att.filename}]` : `[图片: ${att.filename}]`;
      } else if (att.type === 'audio') {
        displayContent += displayContent ? `\n[音频: ${att.filename}]` : `[音频: ${att.filename}]`;
      }
    }

    // Add user message optimistically
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: displayContent,
      attachments: uploadedAtts.length > 0 ? uploadedAtts : undefined,
      created_at: new Date().toISOString(),
    };
    store.addMessage(userMsg);
    store.setStreaming(true);
    store.clearStream();

    const attachmentIds = uploadedAtts.map((a) => a.id);

    // Stream response
    const controller = streamMessage(
      conversationId,
      content,
      remember,
      attachmentIds,
      // onToken
      (token) => store.appendStreamToken(token),
      // onDone
      (messageId, tokenCount) => {
        store.setStreaming(false);
        const assistantMsg: Message = {
          id: messageId,
          conversation_id: conversationId,
          role: 'assistant',
          content: useChatStore.getState().streamingContent,
          token_count: tokenCount,
          created_at: new Date().toISOString(),
        };
        store.addMessage(assistantMsg);
        store.clearStream();

        if (remember && character) {
          loadMemories(character.id);
        }
      },
      // onError
      (error) => {
        store.setStreaming(false);
        store.clearStream();
        console.error('Stream error:', error);
      },
    );

    abortRef.current = controller;
  }, [conversationId, character, store, loadMemories]);

  const memoryPanelOpen = useChatStore((s) => s.memoryPanelOpen);

  if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // No conversation selected - show prompt
  if (!conversationId) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-[calc(100vh-56px)]">
          <div className="hidden lg:block border-r border-tan/50 bg-cream/30">
            <ConversationList
              conversations={store.conversations}
              currentId={null}
              onNew={() => navigate('/characters')}
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center px-6">
              <div className="text-6xl mb-6">💬</div>
              <h2 className="text-xl font-bold text-espresso mb-2">选择一个对话</h2>
              <p className="text-mocha mb-6">从左侧选择已有对话，或开始一段新的对话</p>
              <Link to="/characters" className="inline-flex px-5 py-2.5 bg-amber text-warm-white rounded-xl
                font-medium hover:bg-amber-light transition-colors no-underline">
                去角色广场 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full">
      <div className={`grid h-[calc(100vh-56px)]
        ${memoryPanelOpen
          ? 'grid-cols-1 lg:grid-cols-[260px_1fr_260px]'
          : 'grid-cols-1 lg:grid-cols-[260px_1fr]'}`}>
        {/* Left Sidebar - Conversations */}
        <div className="hidden lg:block border-r border-tan/50 bg-cream/30 overflow-hidden">
          <ConversationList
            conversations={store.conversations}
            currentId={conversationId}
            onNew={handleNewChat}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col overflow-hidden">
          <ChatHeader character={character} />
          <MessageList
            messages={store.messages}
            streamingContent={store.streamingContent}
            isStreaming={store.isStreaming}
            isLoading={loadingMessages}
          />
          <ChatInput onSend={handleSend} disabled={store.isStreaming} />
        </div>

        {/* Right Panel - Memories (toggleable) */}
        {memoryPanelOpen && (
          <div className="hidden lg:block border-l border-tan/50 overflow-hidden">
            <MemoryPanel memories={store.memories} />
          </div>
        )}
      </div>
    </div>
  );
}
