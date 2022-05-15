import { paginate as typeormPaginate } from 'nestjs-typeorm-paginate'
import { ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { PaginatedDto } from '../api/common/dto/paginate.dto'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator'
import { plainToClass } from 'class-transformer'
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination'

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel, props: ApiResponseOptions) => {
  return applyDecorators(
    ApiResponse({
      schema: createPaginateSchema(model),
      ...props,
    }),
  )
}

export const createPaginateSchema = <TModel extends Type<any>>(model: TModel) => ({
  allOf: [
    { $ref: getSchemaPath(PaginatedDto) },
    {
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        },
      },
    },
  ],
})

async function paginate(query, options, decorateData?: (data: any) => any): Promise<Pagination<unknown>> {
  let pagination = await typeormPaginate(query, options)
  const totalItems = await query.getCount()

  if (decorateData) {
    pagination = await decorateData(pagination)
  }

  const totalPages = Math.ceil(totalItems / pagination.meta.itemsPerPage)

  Object.assign(pagination.meta, {
    totalItems,
    totalPages,
  })

  Object.assign(pagination.links, {
    last: options.route + `?page=${totalPages}&limit=${pagination.meta.itemCount}`,
  })

  return pagination
}

export async function paginateAndPlainToClass(
  ResponseDto,
  query,
  options,
  decorateData?: (data: Pagination<unknown>) => Pagination<unknown> | Promise<Pagination<unknown>>,
) {
  return await paginate(query, options, async (data) => {
    const result = decorateData ? await decorateData(data) : data

    return {
      ...result,
      items: result.items.map((item) =>
        plainToClass(ResponseDto, item, {
          excludeExtraneousValues: true,
        }),
      ),
    }
  })
}

export default paginate
