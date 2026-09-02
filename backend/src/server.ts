import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todosRouter from './routes/todos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://sdd-app-1037941709465.asia-south1.run.app/"
];

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());

app.use('/api/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
