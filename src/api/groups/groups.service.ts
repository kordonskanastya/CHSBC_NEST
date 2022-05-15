import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { GROUP_REPOSITORY } from '../../constants'
import { Repository } from 'typeorm'
import { Group } from './entities/group.entity'
import { CreateGroupResponseDto } from './dto/create-group-response.dto'
import { plainToClass } from 'class-transformer'

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = await this.groupsRepository.create(createGroupDto).save()

    return plainToClass(CreateGroupResponseDto, group, {
      excludeExtraneousValues: true,
    })
  }

  findAll() {
    return `This action returns all groups`
  }

  findOne(id: number) {
    return `This action returns a #${id} group`
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`
  }

  remove(id: number) {
    return `This action removes a #${id} group`
  }
}
