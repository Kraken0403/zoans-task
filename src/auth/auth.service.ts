import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common'
  import { PrismaService } from '../prisma/prisma.service'
  import { JwtService } from '@nestjs/jwt'
  import * as bcrypt from 'bcrypt'
  import * as crypto from 'crypto'
  
  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwt: JwtService,
    ) {}
  
    /* ======================
       LOGIN
    ====================== */
  
    async login(identifier: string, password: string) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier },
          ],
        },
      })
    
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid credentials')
      }
    
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials')
      }
    
      const payload = { sub: user.id, role: user.role }
    
      return {
        accessToken: this.jwt.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      }
    }
    
  
    /* ======================
       FORGOT PASSWORD
    ====================== */
  
    async forgotPassword(email: string) {
      const user = await this.prisma.user.findUnique({ where: { email } })
  
      // Do NOT reveal whether user exists (security best practice)
      if (!user) {
        return { message: 'If email exists, reset link sent' }
      }
  
      const rawToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex')
  
      const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 mins
  
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: expiry,
        },
      })
  
      // TODO: send email here
      // reset link example:
      // https://your-frontend/reset-password?token=${rawToken}
  
      return {
        message: 'If email exists, reset link sent',
        // remove token in production, expose only for dev
        resetToken: rawToken,
      }
    }
  
    /* ======================
       RESET PASSWORD
    ====================== */
  
    async resetPassword(token: string, newPassword: string) {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
  
      const user = await this.prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      })
  
      if (!user) {
        throw new BadRequestException('Invalid or expired token')
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10)
  
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
  
      return { message: 'Password reset successful' }
    }
  }
  