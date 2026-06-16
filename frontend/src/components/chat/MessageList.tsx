import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  isLoading: boolean;
}

export function MessageList({ messages, streamingContent, isStreaming, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-mocha">
          <div className="w-8 h-8 border-2 border-tan border-t-amber rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">加载消息中...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-mocha px-6">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-base font-medium text-espresso mb-1">开始你的对话</p>
          <p className="text-sm">发送一条消息，角色会以温暖的方式回应你</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && streamingContent && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[80%]">
            <div className="px-4 py-2.5 rounded-2xl bg-warm-white border border-tan/60 text-espresso rounded-bl-md shadow-sm text-sm leading-relaxed">
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-amber ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
