import { useState } from 'react';
import type { Message } from '../../types';
import { formatMessageContent } from '../../utils/formatMessage';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const attachments = message.attachments || [];
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {attachments.map((att) => (
              <div key={att.id}>
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="max-w-[240px] max-h-[240px] object-cover rounded-xl border border-tan/60
                      cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                    onClick={() => setFullscreenImg(att.url)}
                  />
                ) : att.type === 'audio' ? (
                  <div className="bg-warm-white border border-tan/60 rounded-xl px-3 py-2 shadow-sm">
                    <div className="text-xs text-mocha mb-1 truncate max-w-[200px]">{att.filename}</div>
                    <audio controls className="h-8 w-full max-w-[240px]">
                      <source src={att.url} type={att.mime_type} />
                    </audio>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              ${isUser
                ? 'bg-amber text-warm-white rounded-br-md shadow-sm'
                : 'bg-warm-white border border-tan/60 text-espresso rounded-bl-md shadow-sm'}`}
          >
            {formatMessageContent(message.content)}
          </div>
        )}

        <div className={`text-[10px] text-mocha/60 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Fullscreen image modal */}
      {fullscreenImg && (
        <div
          className="fixed inset-0 z-50 bg-espresso/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenImg(null)}
        >
          <img
            src={fullscreenImg}
            alt="预览"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
