import { Todo } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/api/todos`);
  return handleResponse<Todo[]>(res);
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(id: string, data: { completed: boolean }): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `HTTP ${res.status}`);
  }
}
