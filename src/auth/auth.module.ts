import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy, // 👈 REQUIRED for JwtAuthGuard
  ],

  exports: [
    JwtModule,
    PassportModule, // 👈 REQUIRED so guards work in other modules
  ],
})
export class AuthModule {}
