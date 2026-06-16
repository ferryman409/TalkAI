import { Link } from 'react-router-dom';
import type { Character } from '../../types';
import { useChatStore } from '../../store/chatStore';

interface ChatHeaderProps {
  character: Character | null;
}

export function ChatHeader({ character }: ChatHeaderProps) {
  const toggleMemoryPanel = useChatStore((s) => s.toggleMemoryPanel);
  const memoryPanelOpen = useChatStore((s) => s.memoryPanelOpen);

  if (!character) return null;

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-tan/50 bg-cream/50">
      <Link to={`/characters/${character.id}`} className="flex items-center gap-3 no-underline hover:opacity-80 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber/20 to-rose-light/50
          flex items-center justify-center text-lg shadow-sm">
          {character.avatar_url || '✨'}
        </div>
        <div>
          <div className="text-sm font-semibold text-espresso">{character.name}</div>
          <div className="text-xs text-mocha">
            {character.personality_tags.slice(0, 2).join(' · ')}
          </div>
        </div>
      </Link>
      <button
        onClick={toggleMemoryPanel}
        className={`p-2 rounded-lg transition-colors cursor-pointer text-sm
          ${memoryPanelOpen ? 'bg-amber/15 text-amber' : 'text-mocha hover:bg-golden'}`}
        title="记忆面板"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </button>
    </div>
  );
}
