import { configService } from '../config/config.service'

export const jwtConstants = {
  secret: configService.getJWT(),
}
