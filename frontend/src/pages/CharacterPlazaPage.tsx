import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { listCharacters, getPresetCharacters } from '../api/characters';
import { CharacterCard } from '../components/character/CharacterCard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function CharacterPlazaPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'presets'>('all');

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'presets') {
        const data = await getPresetCharacters();
        setCharacters(data);
      } else {
        const data = await listCharacters(search || undefined);
        setCharacters(data.items);
      }
    } catch {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => {
    const timer = setTimeout(fetchCharacters, 300);
    return () => clearTimeout(timer);
  }, [fetchCharacters]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-espresso">角色广场</h1>
        <Link to="/characters/create">
          <Button>+ 创建角色</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: '全部角色' },
          { key: 'presets', label: '预设角色' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'all' | 'presets')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer
              ${activeTab === tab.key
                ? 'bg-amber/15 text-amber'
                : 'text-mocha hover:bg-golden'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab === 'all' && (
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索角色名称..."
            className="w-full max-w-md px-4 py-2.5 bg-warm-white border border-tan rounded-xl
              text-espresso placeholder:text-mocha/50
              focus:outline-none focus:ring-2 focus:ring-amber/30 focus:border-amber transition-all"
          />
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : characters.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎭</div>
          <p className="text-mocha">还没有角色</p>
          <Link to="/characters/create" className="text-amber hover:text-amber-light text-sm mt-2 inline-block">
            创建第一个角色 →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      )}
    </div>
  );
}
