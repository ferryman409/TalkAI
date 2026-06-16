import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Character } from '../types';
import { getCharacter, deleteCharacter } from '../api/characters';
import { createConversation } from '../api/conversations';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';

export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCharacter(id)
      .then(setCharacter)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartChat = async () => {
    if (!character) return;
    setStartingChat(true);
    try {
      const conv = await createConversation(character.id);
      navigate(`/chat/${conv.id}`);
    } catch {
      setStartingChat(false);
    }
  };

  const handleDelete = async () => {
    if (!character) return;
    try {
      await deleteCharacter(character.id);
      navigate('/characters');
    } catch { /* ignore */ }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><Spinner /></div>;
  if (!character) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-mocha">角色不存在</p>
        <Link to="/characters" className="text-amber text-sm mt-2 inline-block">返回角色广场 →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-warm-white border border-tan/60 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber/20 to-rose-light/50
            flex items-center justify-center text-4xl shadow-sm shrink-0">
            {character.avatar_url || '✨'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-espresso">{character.name}</h1>
            <p className="text-sm text-mocha mt-1">
              {character.gender || '未知'} · {character.age ? `${character.age}岁` : '年龄未知'}
              {character.is_preset && ' · 预设角色'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {character.personality_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {character.personality_tags.map((tag) => (
              <Badge key={tag} variant="amber">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-4">
          {character.backstory && (
            <div>
              <h3 className="text-sm font-semibold text-espresso mb-1">背景故事</h3>
              <p className="text-sm text-mocha leading-relaxed">{character.backstory}</p>
            </div>
          )}
          {character.speaking_style && (
            <div>
              <h3 className="text-sm font-semibold text-espresso mb-1">说话风格</h3>
              <p className="text-sm text-mocha leading-relaxed">{character.speaking_style}</p>
            </div>
          )}
          {character.knowledge_boundaries && (
            <div>
              <h3 className="text-sm font-semibold text-espresso mb-1">知识边界</h3>
              <p className="text-sm text-mocha leading-relaxed">{character.knowledge_boundaries}</p>
            </div>
          )}
          {character.taboo_topics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-espresso mb-1">禁忌话题</h3>
              <div className="flex flex-wrap gap-1">
                {character.taboo_topics.map((t) => (
                  <Badge key={t} variant="rose">{t}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-tan/40">
          <Button onClick={handleStartChat} disabled={startingChat}>
            {startingChat ? '创建对话中...' : '开始对话'}
          </Button>
          {!character.is_preset && (
            <>
              <Link to={`/characters/${character.id}/edit`}>
                <Button variant="secondary">编辑角色</Button>
              </Link>
              <Button variant="ghost" onClick={() => setDeleteModal(true)}>删除</Button>
            </>
          )}
        </div>
      </div>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="确认删除">
        <p className="text-sm text-mocha mb-4">确定要删除角色「{character.name}」吗？此操作不可撤销。</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>取消</Button>
          <Button variant="danger" onClick={handleDelete}>确认删除</Button>
        </div>
      </Modal>
    </div>
  );
}
