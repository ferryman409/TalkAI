import { useState } from 'react';
import { Badge } from '../ui/Badge';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, tags, onChange, placeholder = '输入标签后按回车...' }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-espresso mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-2 bg-warm-white border border-tan rounded-xl
        focus-within:ring-2 focus-within:ring-amber/30 focus-within:border-amber transition-all min-h-[42px]">
        {tags.map((tag) => (
          <Badge key={tag} variant="amber" onRemove={() => onChange(tags.filter((t) => t !== tag))}>
            {tag}
          </Badge>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-espresso
            placeholder:text-mocha/50 outline-none border-none py-0.5"
        />
      </div>
    </div>
  );
}
