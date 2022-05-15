import { GetLoggerResponseDto } from './get-logger-response.dto'
import { Expose } from 'class-transformer'
import { IsJSON } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class GetLoggerOneResponseDto extends GetLoggerResponseDto {
  @Expose()
  @IsJSON()
  @ApiProperty()
  before: any

  @Expose()
  @IsJSON()
  @ApiProperty()
  after: any
}
