import { useEffect, useState, useCallback } from 'react';
import type { Memory } from '../types';
import { listMemories, deleteMemory } from '../api/memories';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export function MemoryManagerPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'recent' | 'importance'>('recent');
  const [total, setTotal] = useState(0);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMemories(undefined, sort);
      setMemories(data.items);
      setTotal(data.total);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setTotal((t) => t - 1);
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-espresso">记忆管理</h1>
          <p className="text-sm text-mocha mt-1">
            共 {total} 条记忆 · 角色记得关于你的这些事情
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'recent', label: '最新' },
            { key: 'importance', label: '重要性' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key as 'recent' | 'importance')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${sort === s.key ? 'bg-amber/15 text-amber' : 'text-mocha hover:bg-golden'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : memories.length === 0 ? (
        <div className="text-center py-16 bg-warm-white border border-tan/60 rounded-2xl">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-mocha">还没有任何记忆</p>
          <p className="text-sm text-mocha/60 mt-1">在对话中点击"记住"按钮来创建记忆</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="flex items-start gap-4 bg-warm-white border border-tan/60 rounded-xl p-4
                hover:border-amber/30 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-espresso leading-relaxed">{mem.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={mem.is_manual ? 'amber' : 'default'}>
                    {mem.is_manual ? '手动' : '自动'}
                  </Badge>
                  {mem.importance >= 0.8 && <Badge variant="rose">重要</Badge>}
                  <span className="text-xs text-mocha">
                    召回 {mem.recall_count} 次
                  </span>
                  <span className="text-xs text-mocha/60">
                    {new Date(mem.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(mem.id)}
                className="text-xs text-mocha/40 hover:text-rose opacity-0 group-hover:opacity-100
                  transition-all cursor-pointer shrink-0 mt-1"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
