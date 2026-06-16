import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Character } from '../types';
import { getCharacter } from '../api/characters';
import { CharacterForm } from '../components/character/CharacterForm';
import { Spinner } from '../components/ui/Spinner';

export function CharacterCreatePage() {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      getCharacter(id)
        .then(setCharacter)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-espresso mb-6">
        {isEdit ? '编辑角色' : '创建新角色'}
      </h1>
      {loading ? (
        <Spinner />
      ) : (
        <CharacterForm character={character} />
      )}
    </div>
  );
}
