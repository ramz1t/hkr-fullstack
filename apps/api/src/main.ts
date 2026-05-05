import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const configService = app.get(ConfigService);
  const isDevelopment = configService.get<string>("NODE_ENV") !== "production";
  const port = configService.get<number>("API_PORT") ?? 4000;
  const config = new DocumentBuilder()
    .setTitle("Casino API")
    .setDescription("Casino API documentation")
    .setVersion("1.0")
    .build();

  if (isDevelopment) {
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, documentFactory);
    console.log(`Swagger running at http://localhost:${port}/swagger`);
  }

  await app.listen(port);

  const url = `http://localhost:${port}`;
  console.log(`🚀 API running at: ${url}`);
}

bootstrap().catch(console.log);
