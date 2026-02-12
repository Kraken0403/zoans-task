import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskCategoryDto } from './dto/create-task-category.dto'
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto'

@Injectable()
export class TaskCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskCategoryDto) {
    const exists = await this.prisma.taskCategory.findUnique({
      where: { name: dto.name },
    })

    if (exists) {
      throw new BadRequestException('Category already exists')
    }

    return this.prisma.taskCategory.create({
      data: dto,
    })
  }

  async findAll() {
    return this.prisma.taskCategory.findMany({
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: number) {
    const category = await this.prisma.taskCategory.findUnique({
      where: { id },
    })
    if (!category) throw new NotFoundException('Category not found')
    return category
  }

  async update(id: number, dto: UpdateTaskCategoryDto) {
    await this.findOne(id)
    return this.prisma.taskCategory.update({
      where: { id },
      data: dto,
    })
  }
}
