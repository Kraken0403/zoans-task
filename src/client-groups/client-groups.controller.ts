import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common'
import { ClientGroupsService } from './client-groups.service'
import { CreateClientGroupDto } from './dto/create-client-group.dto'
import { UpdateClientGroupDto } from './dto/update-client-group.dto'

@Controller('client-groups')
export class ClientGroupsController {
  constructor(private readonly service: ClientGroupsService) {}

  /* ========================
     CREATE
  ======================== */

  @Post()
  create(@Body() dto: CreateClientGroupDto) {
    return this.service.create(dto)
  }

  /* ========================
     READ
  ======================== */

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  /* ========================
     UPDATE
  ======================== */

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientGroupDto,
  ) {
    return this.service.update(id, dto)
  }

  /* ========================
     DELETE GROUP
  ======================== */

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id)
  }

  /* ========================
     ASSIGN CLIENTS TO GROUP
  ======================== */

  @Patch(':id/assign-clients')
  assignClients(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clientIds?: number[] },
  ) {
    if (!body?.clientIds?.length) {
      throw new BadRequestException('No clients selected')
    }

    return this.service.assignClientsToGroup(
      id,
      body.clientIds,
    )
  }

  /* ========================
     REMOVE CLIENTS FROM GROUP
  ======================== */

  @Patch(':id/remove-clients')
  removeClients(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { clientIds?: number[] },
  ) {
    if (!body?.clientIds?.length) {
      throw new BadRequestException('No clients selected')
    }

    return this.service.removeClientsFromGroup(
      body.clientIds,
    )
  }
}
