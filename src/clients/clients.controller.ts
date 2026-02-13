import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe
  } from '@nestjs/common'
  import { FileInterceptor } from '@nestjs/platform-express'
  import { ClientsService } from './clients.service'
  import { CreateClientDto } from './dto/create-client.dto'
  import { UpdateClientDto } from './dto/update-client.dto'
  import * as path from 'path'
  import * as fs from 'fs'
  
  @Controller('clients')
  export class ClientsController {
    constructor(private clients: ClientsService) {}
  
    /* ========================
       CRUD
    ======================== */
  
    @Post()
    create(@Body() dto: CreateClientDto) {
      return this.clients.create(dto)
    }
  
    @Get()
    findAll() {
      return this.clients.findAll()
    }

    @Get('ungrouped')
    findUngrouped() {
      return this.clients.findUngrouped()
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.clients.findOne(id)
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() dto: UpdateClientDto,
    ) {
      return this.clients.update(+id, dto)
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.clients.remove(+id)
    }



  
    /* ========================
       EXCEL IMPORT
    ======================== */
  
    @Post('import/excel')
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(@UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new Error('No file uploaded')
      }
  
      const uploadDir = path.join(process.cwd(), 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir)
      }
  
      const filePath = path.join(uploadDir, file.originalname)
      fs.writeFileSync(filePath, file.buffer)
  
      return this.clients.importFromExcel(filePath)
    }
  }
  