import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export default function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder().setTitle('CSBC API').setVersion('1.0.0').addBearerAuth().build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      apisSorter: 'alpha',
      tagsSorter: 'alpha',
      // operationsSorter: 'alpha',
    },
  })
}
