import { Router } from 'express';
import * as todosController from '../controllers/todosController';

const router = Router();

router.get('/', todosController.getAll);
router.post('/', todosController.create);
router.put('/:id', todosController.update);
router.delete('/:id', todosController.remove);

export default router;
