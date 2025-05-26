import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { BigIntSerializationInterceptor } from './libs/interceptors/bigint-serialization.interceptor';

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
}

function setupSwagger(nestApp: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('AI Face Attendance Documentation')
    .setDescription(
      'The Face Attendance documentation by with hexagonal architecture',
    )
    .setVersion('1.2')
    .addBearerAuth();

  const document = SwaggerModule.createDocument(nestApp, options.build());
  const serializedDocument = serializeBigInt(document);
  SwaggerModule.setup('docs', nestApp, serializedDocument, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      displayOperationId: true,
      displayRequestDuration: true,
      filter: true,
    },
  });
}

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://he-thong-cham-cong-admin.vercel.app',
  'https://face-attendance-be-production.up.railway.app',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Redis Adapter for Socket.IO
  // try {
  //   const redisIoAdapter = new RedisIoAdapter(app);
  //   await redisIoAdapter.connectToRedis();
  //   app.useWebSocketAdapter(redisIoAdapter);
  // } catch (error) {
  //   console.error('Error connecting to Redis:', error);
  // }

  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
  app.use(compression());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.enableShutdownHooks();

  setupSwagger(app);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
