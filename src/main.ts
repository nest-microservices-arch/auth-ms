import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const logger = new Logger('auth-microservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS,
      },
    },
  );

  app.useGlobalPipes(  
    new ValidationPipe({ 
  whitelist: true, 
  forbidNonWhitelisted: true, 
    }) 
  );
  await app.listen();
  logger.log(`auth-microservice is running on port ${envs.PORT}`);
}
bootstrap();
