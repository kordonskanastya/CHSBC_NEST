import { BadRequestException } from '@nestjs/common'
import { getManager } from 'typeorm'
import * as moment from 'moment'
import { Image } from '../api/images/entities/image.entity'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export type EnumToArray = string[]

export function enumToArray(data): EnumToArray {
  return Object.values(data)
}

export type EnumToObject = {
  key: string
  value: string
}[]

export function enumToObject(data): EnumToObject {
  return Object.keys(data).map((key) => ({
    key,
    value: data[key],
  }))
}

export function checkColumnExist(list, column, message = `Can't sort by column: `) {
  if (list.indexOf(column) === -1) {
    throw new BadRequestException(`${message}${column}`)
  }
}

export async function getDatabaseCurrentTimestamp() {
  const [{ current_timestamp }] = await getManager().query(`SELECT CURRENT_TIMESTAMP`)

  return moment(current_timestamp)
}

export const removeOldImage = async (oldImages: (number | string)[] = undefined, images: Image[]): Promise<Image[]> => {
  if (oldImages) {
    const removeImages = images.filter(({ id }) => !oldImages.find((oldId) => +oldId === +id))

    for (const id in removeImages) {
      await Image.remove(removeImages[id])
    }

    return images.filter(({ id }) => oldImages.find((oldId) => +oldId === +id))
  }

  return images
}
