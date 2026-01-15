import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    UploadedFile,
    UseInterceptors
  } from '@nestjs/common'
  import { AuthGuard } from '@nestjs/passport'
  import { MyCompaniesService } from './my-companies.service'
  import { FileInterceptor } from '@nestjs/platform-express'
  import { diskStorage } from 'multer'
  import * as fs from 'fs'
  import * as path from 'path'

  @UseGuards(AuthGuard('jwt')) // 🔥 THIS IS CRITICAL
  @Controller('my-companies')
  export class MyCompaniesController {
    constructor(private readonly svc: MyCompaniesService) {}
  
    // -----------------------
    // CREATE COMPANY
    // -----------------------
    @Post()
    create(@Req() req: any, @Body() dto: any) {
      return this.svc.create(req.user.id, dto)
    }
  
    // -----------------------
    // LIST MY COMPANIES
    // -----------------------
    @Get()
    findAll(@Req() req: any) {
      return this.svc.findAll(req.user.id)
    }
  
    // -----------------------
    // GET SINGLE COMPANY
    // -----------------------
    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
      return this.svc.findOne(req.user.id, Number(id))
    }
  
    // -----------------------
    // UPDATE COMPANY
    // -----------------------
    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
      return this.svc.update(req.user.id, Number(id), dto)
    }
  
    // -----------------------
    // DELETE COMPANY
    // -----------------------
    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
      return this.svc.remove(req.user.id, Number(id))
    }

    @Post(':id/seal')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const companyId = req.params.id
            const dir = path.join(
              process.cwd(),
              'uploads',
              'companies',
              companyId,
            )
    
            // auto-create folder
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }
    
            cb(null, dir)
          },
          filename: (req, file, cb) => {
            cb(null, 'seal.png') // 🔥 fixed name
          },
        }),
      }),
    )
    uploadSeal(
      @Req() req: any,
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
    ) {
      const url = `/uploads/companies/${id}/seal.png`
      return this.svc.update(req.user.id, Number(id), { sealUrl: url })
    }
    
    @Post(':id/signature')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req, file, cb) => {
            const companyId = req.params.id
            const dir = path.join(
              process.cwd(),
              'uploads',
              'companies',
              companyId,
            )
    
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }
    
            cb(null, dir)
          },
          filename: (req, file, cb) => {
            cb(null, 'signature.png')
          },
        }),
      }),
    )
    uploadSignature(
      @Req() req: any,
      @Param('id') id: string,
      @UploadedFile() file: Express.Multer.File,
    ) {
      const url = `/uploads/companies/${id}/signature.png`
      return this.svc.update(req.user.id, Number(id), { signatureUrl: url })
    }
    
  }
  