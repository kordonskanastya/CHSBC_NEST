import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { extname } from 'path'
// import { DocumentTypeList } from '../common/enums'
import * as nodeGeocoder from 'node-geocoder'
import { State } from 'country-state-city'

const geocoder = nodeGeocoder({
  provider: 'openstreetmap',
})

export function getStateName(stateCode: string, countryCode: string): string {
  const state = State.getStateByCodeAndCountry(stateCode, countryCode)

  if (state) {
    return state.name
  }

  return ''
}

export async function predictLocation(query: string): Promise<{ latitude: number; longitude: number }> {
  const locations: nodeGeocoder.Entry[] = await geocoder.geocode(query.replace('  ', ' '))

  if (locations.length && locations[0].city) {
    return {
      latitude: locations[0].latitude,
      longitude: locations[0].longitude,
    }
  }

  return { latitude: null, longitude: null }
}

export const audioFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(wav|mp3|ogg|wma)$/)) {
    return callback(
      new HttpException(
        `Only audio files are allowed! Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    )
  }
  callback(null, true)
}

export const imageFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        `Only image files are allowed! Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    )
  }
  callback(null, true)
}

export const csvFileFilter = (_req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(
      new HttpException(
        `Only csv files are allowed! Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      ),
      false,
    )
  }
  callback(null, true)
}

// export const docsFileFilter = (_req, file, callback) => {
//   if (!file.originalname.match(new RegExp(`\\.(${DocumentTypeList.join('|')})$`))) {
//     return callback(
//       new HttpException(
//         `Only documents are allowed! Unsupported file type ${extname(file.originalname)}`,
//         HttpStatus.UNSUPPORTED_MEDIA_TYPE,
//       ),
//       false,
//     )
//   }
//   callback(null, true)
// }

export const editFileName = (_req, file, callback) => {
  const name = file.originalname.split('.')[0]
  const fileExtName = extname(file.originalname)
  const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('')
  callback(null, `${name}-${randomName}${fileExtName}`)
}

export const ApiFile =
  (fileName = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor)
  }

export const ApiDocumentFile =
  (fileName = 'file'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
          category: {
            type: 'string',
            format: 'string',
          },
          title: {
            type: 'string',
            format: 'string',
          },
        },
      },
    })(target, propertyKey, descriptor)
  }

export const ApiMultiFile =
  (fileName = 'files'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })(target, propertyKey, descriptor)
  }
