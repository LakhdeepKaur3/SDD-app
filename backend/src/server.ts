import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todosRouter from './routes/todos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/health', (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is working!"
  });
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json());

app.use('/api/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
