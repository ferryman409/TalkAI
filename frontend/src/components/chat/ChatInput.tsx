import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import { useChatStore } from '../../store/chatStore';

interface ChatInputProps {
  onSend: (content: string, remember: boolean, attachments: File[]) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [remember, setRemember] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const pendingAttachments = useChatStore((s) => s.pendingAttachments);
  const uploading = useChatStore((s) => s.uploading);
  const addPending = useChatStore((s) => s.addPendingAttachment);
  const removePending = useChatStore((s) => s.removePendingAttachment);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [content]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        addPending(files[i]);
      }
    }
    e.target.value = '';
  };

  const handleAudioSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        addPending(files[i]);
      }
    }
    e.target.value = '';
  };

  const handleSend = () => {
    const trimmed = content.trim();
    const hasAttachments = pendingAttachments.length > 0;
    if ((!trimmed && !hasAttachments) || disabled || uploading) return;
    onSend(trimmed, remember, [...pendingAttachments]);
    setContent('');
    setRemember(false);
    useChatStore.getState().clearPendingAttachments();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-tan/50 p-3 bg-cream/50">
      {/* Attachment previews */}
      {pendingAttachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {pendingAttachments.map((file, i) => (
            <div key={i} className="relative group">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg border border-tan"
                />
              ) : (
                <div className="w-16 h-16 bg-golden rounded-lg border border-tan flex items-center justify-center text-xs text-mocha px-1 text-center">
                  {file.name.length > 8 ? file.name.slice(0, 8) + '...' : file.name}
                </div>
              )}
              <button
                onClick={() => {
                  removePending(i);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose text-white rounded-full
                  text-xs flex items-center justify-center opacity-0 group-hover:opacity-100
                  transition-opacity cursor-pointer shadow-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-warm-white border border-tan rounded-2xl px-3 py-2
        focus-within:ring-2 focus-within:ring-amber/30 focus-within:border-amber transition-all">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingAttachments.length > 0 ? '添加文字说明（可选）...' : '输入消息...（Enter 发送，Shift+Enter 换行）'}
          rows={1}
          disabled={disabled || uploading}
          className="flex-1 bg-transparent text-sm text-espresso placeholder:text-mocha/50
            outline-none border-none resize-none py-1 max-h-[120px]"
        />
        <div className="flex items-center gap-1 shrink-0">
          {/* Image upload */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-1.5 rounded-lg text-mocha hover:bg-golden hover:text-amber
              disabled:opacity-40 transition-colors cursor-pointer"
            title="上传图片"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Audio upload */}
          <button
            onClick={() => audioInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-1.5 rounded-lg text-mocha hover:bg-golden hover:text-rose
              disabled:opacity-40 transition-colors cursor-pointer"
            title="上传音频"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleAudioSelect}
          />

          <button
            onClick={() => setRemember(!remember)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer
              ${remember ? 'bg-rose-light text-rose' : 'bg-tan/50 text-mocha hover:bg-tan'}`}
            title="记住这条消息"
          >
            {remember ? '✓ 记住' : '记住'}
          </button>
          <button
            onClick={handleSend}
            disabled={disabled || uploading || (!content.trim() && pendingAttachments.length === 0)}
            className="p-2 rounded-xl bg-amber text-warm-white hover:bg-amber-light
              disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
