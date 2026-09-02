'use client';

import { useState, useEffect } from 'react';
import { Todo } from '../lib/types';
import { getTodos, updateTodo, deleteTodo } from '../lib/api';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTodos();
        setTodos(data);
      } catch {
        setError('Failed to load tasks. Is the server running?');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  function handleAddTodo(todo: Todo) {
    setTodos((prev) => [todo, ...prev]);
  }

  async function handleToggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = await updateTodo(id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDeleteTodo(id: string) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Todo App
        </h1>

        <TodoInput onAdd={handleAddTodo} />

        <div className="mt-6">
          {isLoading && (
            <p className="text-center text-gray-400 py-12">Loading tasks…</p>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 flex items-center justify-between gap-2">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {!isLoading && (
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          )}
        </div>
      </div>
    </main>
  );
}
