import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: string | null;
  onNew: () => void;
}

export function ConversationList({ conversations, currentId, onNew }: ConversationListProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-tan/50">
        <button
          onClick={onNew}
          className="w-full py-2 px-3 bg-amber text-warm-white rounded-xl text-sm font-medium
            hover:bg-amber-light transition-colors cursor-pointer shadow-sm"
        >
          + 新对话
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-mocha">
            暂无对话记录<br />选择一个角色开始聊天吧
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className={`w-full text-left px-3 py-3 border-b border-tan/30 transition-colors cursor-pointer
                ${conv.id === currentId
                  ? 'bg-amber/10 border-l-2 border-l-amber'
                  : 'hover:bg-golden/50 border-l-2 border-l-transparent'}`}
            >
              <div className="text-sm font-medium text-espresso truncate">
                {conv.character_name || conv.title || '对话'}
              </div>
              <div className="text-xs text-mocha mt-0.5 truncate">
                {conv.title || `${conv.message_count} 条消息`}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
