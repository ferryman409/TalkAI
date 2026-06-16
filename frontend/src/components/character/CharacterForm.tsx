import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character, CharacterCreate } from '../../types';
import { createCharacter, updateCharacter } from '../../api/characters';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { TagInput } from './TagInput';

interface CharacterFormProps {
  character?: Character;
}

export function CharacterForm({ character }: CharacterFormProps) {
  const navigate = useNavigate();
  const isEdit = !!character;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(character?.name || '');
  const [age, setAge] = useState(character?.age?.toString() || '');
  const [gender, setGender] = useState(character?.gender || '');
  const [personalityTags, setPersonalityTags] = useState<string[]>(character?.personality_tags || []);
  const [backstory, setBackstory] = useState(character?.backstory || '');
  const [speakingStyle, setSpeakingStyle] = useState(character?.speaking_style || '');
  const [tabooTopics, setTabooTopics] = useState<string[]>(character?.taboo_topics || []);
  const [knowledgeBoundaries, setKnowledgeBoundaries] = useState(character?.knowledge_boundaries || '');
  const [isPublic, setIsPublic] = useState(character?.is_public ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('角色名称不能为空');
      return;
    }
    setLoading(true);
    setError('');

    const data: CharacterCreate = {
      name: name.trim(),
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      personality_tags: personalityTags,
      backstory,
      speaking_style: speakingStyle,
      taboo_topics: tabooTopics,
      knowledge_boundaries: knowledgeBoundaries,
      is_public: isPublic,
    };

    try {
      if (isEdit && character) {
        await updateCharacter(character.id, data);
        navigate(`/characters/${character.id}`);
      } else {
        const created = await createCharacter(data);
        navigate(`/characters/${created.id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-light/50 border border-rose/30 rounded-xl text-sm text-rose">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="角色名称 *" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：温柔的学姐" />
        <Input label="年龄" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="22" />
        <div>
          <label className="block text-sm font-medium text-espresso mb-1.5">性别</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2.5 bg-warm-white border border-tan rounded-xl text-espresso
              focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-all"
          >
            <option value="">未指定</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </div>
      </div>

      <TagInput label="性格标签" tags={personalityTags} onChange={setPersonalityTags} placeholder="输入性格标签后按回车，如：温柔、体贴" />
      <Textarea label="背景故事" value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={3} placeholder="描述角色的背景、经历和世界观..." />
      <Textarea label="说话风格" value={speakingStyle} onChange={(e) => setSpeakingStyle(e.target.value)} rows={2} placeholder="例如：轻声细语，喜欢用温暖比喻，常用语气词..." />
      <TagInput label="禁忌话题" tags={tabooTopics} onChange={setTabooTopics} placeholder="输入需要避免的话题后按回车，如：暴力、色情" />
      <Textarea label="知识边界" value={knowledgeBoundaries} onChange={(e) => setKnowledgeBoundaries(e.target.value)} rows={2} placeholder="角色知道什么、不知道什么，超出知识边界的回避方式..." />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 accent-amber rounded"
        />
        <label htmlFor="isPublic" className="text-sm text-mocha">公开到角色广场</label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : isEdit ? '更新角色' : '创建角色'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          取消
        </Button>
      </div>
    </form>
  );
}
