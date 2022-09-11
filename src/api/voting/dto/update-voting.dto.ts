import { PartialType } from '@nestjs/mapped-types'
import { CreateVotingDto } from './create-voting.dto'
import { IsBoolean, IsOptional } from 'class-validator'

export class UpdateVotingDto extends PartialType(CreateVotingDto) {
  @IsOptional()
  @IsBoolean()
  isRevote?: boolean
}
