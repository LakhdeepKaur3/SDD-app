import prisma from '../lib/prisma';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function getAll() {
  return prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function create(text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new ValidationError('Text cannot be empty');
  if (trimmed.length > 500) throw new ValidationError('Text must be 500 characters or fewerr');
  return prisma.todo.create({ data: { text: trimmed } });
}

export async function update(id: string, data: { completed?: boolean }) {
  try {
    return await prisma.todo.update({ where: { id }, data });
  } catch (err: any) {
    if (err?.code === 'P2025') throw new NotFoundError('Todo not found');
    throw err;
  }
}

export async function remove(id: string) {
  try {
    await prisma.todo.delete({ where: { id } });
  } catch (err: any) {
    if (err?.code === 'P2025') throw new NotFoundError('Todo not found');
    throw err;
  }
}
