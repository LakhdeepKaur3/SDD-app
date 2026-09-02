import { Request, Response } from 'express';
import * as todosService from '../services/todosService';
import { ValidationError, NotFoundError } from '../services/todosService';

export async function getAll(req: Request, res: Response) {
  try {
    const todos = await todosService.getAll();
    res.json(todos);
  } catch {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const todo = await todosService.create(text);
    res.status(201).json(todo);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create todo' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    const todo = await todosService.update(id, { completed });
    res.json(todo);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update todo' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await todosService.remove(id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete todo' });
  }
}
