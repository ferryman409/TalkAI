import { Link } from 'react-router-dom';
import type { Character } from '../../types';
import { Badge } from '../ui/Badge';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link
      to={`/characters/${character.id}`}
      className="block bg-warm-white rounded-2xl border border-tan/60 p-5
        hover:shadow-lg hover:border-amber/40 hover:-translate-y-1
        transition-all duration-300 no-underline group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber/20 to-rose-light/50
          flex items-center justify-center text-2xl shrink-0 shadow-sm">
          {character.avatar_url || '✨'}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-espresso truncate group-hover:text-amber transition-colors">
            {character.name}
          </h3>
          <p className="text-xs text-mocha">
            {character.gender || '未知'} · {character.age ? `${character.age}岁` : '年龄未知'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {character.personality_tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="amber">{tag}</Badge>
        ))}
        {character.personality_tags.length > 3 && (
          <Badge variant="default">+{character.personality_tags.length - 3}</Badge>
        )}
      </div>
      <p className="text-sm text-mocha line-clamp-2 leading-relaxed">
        {character.backstory || '暂无背景故事'}
      </p>
      {character.is_preset && (
        <div className="mt-3 pt-3 border-t border-tan/40">
          <span className="text-xs text-sage font-medium">✦ 预设角色</span>
        </div>
      )}
    </Link>
  );
}
