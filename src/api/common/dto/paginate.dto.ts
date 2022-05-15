import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class Meta {
  @ApiProperty({ type: Number })
  totalItems: number

  @ApiProperty({ type: Number })
  itemCount: number

  @ApiProperty({ type: Number })
  itemsPerPage: number

  @ApiProperty({ type: Number })
  totalPages: number

  @ApiProperty({ type: Number })
  currentPage: number
}

class Links {
  @ApiProperty({ type: String, example: '/{name}?limit=10' })
  first: string

  @ApiProperty({ type: String, example: '/{name}?page=1&limit=10' })
  previous: string

  @ApiProperty({ type: String, example: '/{name}?page=2&limit=10' })
  next: string

  @ApiProperty({ type: String, example: '/{name}?page=9&limit=10' })
  last: string
}

export class PaginatedDto<TData> {
  items: TData[]

  @ApiProperty({ type: Meta })
  @Type(() => Meta)
  meta: Meta

  @ApiProperty({ type: Links })
  @Type(() => Links)
  links: Links
}
