import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import httpStatus from 'http-status';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import routes from './app/routes';
import console from 'node:console';

const app: Application = express();


app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(helmet());


app.use(compression());
console.log(process.env.NEEDCORS)


if (process.env.NEEDCORS === '1') {
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = process.env.ALLOWORIGINS?.split(',').map(o => o.trim()) || [];
      console.log('CORS Request - Origin:', origin);
      console.log('Allowed Origins:', allowedOrigins);

      // Allow requests without origin (same-origin, Postman, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS BLOCKED - Origin not in allowed list');
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
}


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Health check endpoints
app.get('/health', async (req: Request, res: Response) => {
  try {

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),

    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});



// API routes
app.use('/api/v1', routes);


app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
});

export default app;