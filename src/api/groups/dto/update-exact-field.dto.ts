import { PartialType } from '@nestjs/swagger'
import { CreateGroupDto } from './create-group.dto'

export class UpdateExactFieldDto extends PartialType(CreateGroupDto) {}
