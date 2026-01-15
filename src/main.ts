import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as path from 'path'

async function bootstrap() {
  // 🔥 IMPORTANT: type the app correctly
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule)

  // ✅ ENABLE CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ✅ GLOBAL VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // ✅ STATIC FILE SERVING
  app.useStaticAssets(
    path.join(process.cwd(), 'uploads'),
    { prefix: '/uploads' },
  )

  await app.listen(9000)
  console.log(`🚀 API running on http://localhost:9000`)
}

bootstrap()
