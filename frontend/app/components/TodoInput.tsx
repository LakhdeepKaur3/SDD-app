'use client';

import { useState } from 'react';
import { createTodo } from '../../lib/api';
import { Todo } from '../../lib/types';

interface Props {
  onAdd: (todo: Todo) => void;
}

export default function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Task text cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const todo = await createTodo(trimmed);
      onAdd(todo);
      setText('');
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task…"
          disabled={isLoading}
          maxLength={500}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isLoading ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
