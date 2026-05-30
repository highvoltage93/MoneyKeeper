import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>("CORS_ORIGIN") ?? "*";

  app.enableCors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((origin) => origin.trim()),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<number>("PORT") ?? 3001;
  await app.listen(port);
}

void bootstrap();
