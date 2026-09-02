'use client';

import { useState } from 'react';
import { Todo } from '../../lib/types';

interface Props {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setIsToggling(true);
    setError(null);
    try {
      await onToggle(todo.id);
    } catch {
      setError('Failed to update task');
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(todo.id);
    } catch {
      setError('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  }

  const isBusy = isToggling || isDeleting;

  return (
    <li className="flex items-center gap-3 px-4 py-3 group">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isBusy}
        className="w-5 h-5 cursor-pointer accent-blue-600 disabled:cursor-not-allowed flex-shrink-0"
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      />
      <span
        className={`flex-1 text-gray-800 break-words ${
          todo.completed ? 'line-through text-gray-400' : ''
        }`}
      >
        {todo.text}
      </span>
      {isBusy && (
        <span className="text-xs text-gray-400 flex-shrink-0">saving…</span>
      )}
      {error && !isBusy && (
        <span className="text-xs text-red-500 flex-shrink-0">{error}</span>
      )}
      <button
        onClick={handleDelete}
        disabled={isBusy}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 disabled:cursor-not-allowed transition-opacity text-xl leading-none flex-shrink-0"
        aria-label="Delete task"
      >
        ×
      </button>
    </li>
  );
}
