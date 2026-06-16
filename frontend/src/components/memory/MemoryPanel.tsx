import { Link } from 'react-router-dom';
import type { Memory } from '../../types';
import { deleteMemory } from '../../api/memories';
import { useChatStore } from '../../store/chatStore';

interface MemoryPanelProps {
  memories: Memory[];
}

export function MemoryPanel({ memories }: MemoryPanelProps) {
  const removeMemory = useChatStore((s) => s.removeMemory);

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory(id);
      removeMemory(id);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col h-full bg-cream/30">
      <div className="p-3 border-b border-tan/50">
        <h3 className="text-sm font-semibold text-espresso">关于你的记忆</h3>
        <p className="text-xs text-mocha mt-0.5">角色记得关于你的这些事</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {memories.length === 0 ? (
          <div className="p-4 text-center text-sm text-mocha">
            <p className="mb-2">📝</p>
            <p>还没有关于你的记忆</p>
            <p className="text-xs mt-1">在对话中点击"记住"来创建记忆</p>
          </div>
        ) : (
          memories.map((mem) => (
            <div
              key={mem.id}
              className="group p-3 mb-1.5 bg-warm-white rounded-xl border border-tan/40 text-sm
                hover:border-amber/30 transition-all"
            >
              <p className="text-espresso leading-relaxed">{mem.content}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-mocha">
                    {mem.is_manual ? '手动' : '自动'}
                  </span>
                  {mem.importance >= 0.8 && (
                    <span className="text-[10px] bg-rose-light/50 text-rose px-1.5 py-0.5 rounded-md">重要</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="text-xs text-mocha/40 hover:text-rose opacity-0 group-hover:opacity-100
                    transition-all cursor-pointer"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t border-tan/50">
        <Link
          to="/memories"
          className="block text-center text-xs text-amber hover:text-amber-light transition-colors no-underline py-1"
        >
          管理所有记忆 →
        </Link>
      </div>
    </div>
  );
}
