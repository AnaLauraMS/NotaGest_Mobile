import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/mongoDb.js';
import setupSwagger from './config/swaggerConfig.js';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import uploadFileRoutes from './routes/uploadFileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { requestLogger } from "./middleware/requestLogger.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { logger } from './utils/logger.js';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ AVISO: GEMINI_API_KEY não encontrada no ambiente. As funções de IA (RAG e Extração) não funcionarão.');
} else {
  console.log('✅ IA: Chave do Gemini configurada.');
}

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

function sanitizeNoSql(payload: unknown): void {
  if (!payload || typeof payload !== 'object') {
    return;
  }
  for (const key of Object.keys(payload as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (payload as Record<string, unknown>)[key];
    } else {
      sanitizeNoSql((payload as Record<string, unknown>)[key]);
    }
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas de autenticação a partir deste IP. Tente novamente mais tarde." }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Limite de requisições de Inteligência Artificial atingido. Aguarde um minuto." }
});

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:8081',
    'http://localhost:8082',
    "http://3.94.218.162:3000",
    "http://3.94.218.162:4000",
    'https://nota-gest.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  if (req.body) {
    sanitizeNoSql(req.body);
  }
  if (req.params) {
    sanitizeNoSql(req.params);
  }
  next();
});

setupSwagger(app);

app.use(requestLogger);

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users', userRoutes);
app.use('/api/uploads', fileRoutes);
app.use('/api/imoveis', propertyRoutes);
app.use('/api/uploadfile', uploadFileRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(errorMiddleware);

app.use((req: Request, res: Response) => {
  logger.info("Rota não encontrada", {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ message: "Rota não encontrada" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
}

export default app;
