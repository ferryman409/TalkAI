import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../types';
import { getPresetCharacters } from '../api/characters';
import { CharacterCard } from '../components/character/CharacterCard';
import { Spinner } from '../components/ui/Spinner';

export function HomePage() {
  const [presets, setPresets] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresetCharacters()
      .then(setPresets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 max-w-3xl mx-auto">
        <div className="text-6xl mb-6 animate-[fadeIn_0.8s_ease-out]">
          <span className="inline-block animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}>✦</span>
          {' '}
          <span className="inline-block animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>💫</span>
          {' '}
          <span className="inline-block animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>✨</span>
        </div>
        <h1 className="text-4xl font-bold text-espresso mb-4 tracking-tight">
          遇见属于你的<span className="text-amber">角色</span>
        </h1>
        <p className="text-mocha text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          与拥有独特人格的AI角色进行沉浸式对话。
          <br />他们记得你的故事，理解你的情绪，陪伴你的每一天。
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/characters"
            className="inline-flex items-center px-6 py-3 bg-amber text-warm-white rounded-xl
              font-medium shadow-sm hover:bg-amber-light hover:-translate-y-0.5
              transition-all duration-200 no-underline"
          >
            探索角色广场 →
          </Link>
          <Link
            to="/characters/create"
            className="inline-flex items-center px-6 py-3 bg-tan text-espresso rounded-xl
              font-medium hover:bg-tan-dark hover:-translate-y-0.5
              transition-all duration-200 no-underline"
          >
            创建角色
          </Link>
        </div>
      </section>

      {/* Preset Characters */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-espresso mb-6 text-center">预设角色</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {presets.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-warm-white/50 border-y border-tan/30 py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🎭', title: '丰富角色', desc: '从温柔学姐到幽默酒保，每个角色都有独特的性格与说话风格' },
            { icon: '🧠', title: '长期记忆', desc: '角色记得你告诉过他们的事，让对话更有连续性和温度' },
            { icon: '🔒', title: '安全隐私', desc: '对话内容加密存储，你随时可以导出或删除自己的数据' },
          ].map((f) => (
            <div key={f.title} className="text-center p-4">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-espresso mb-2">{f.title}</h3>
              <p className="text-sm text-mocha leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
