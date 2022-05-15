// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string): string {
    if (typeof this.env[key] === 'undefined') {
      console.warn(`.env value: ${key} undefined`)
    }

    return this.env[key]
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k))
    return this
  }

  public getMailAuthPassword(): string {
    return this.getValue('MAIL_AUTH_PASSWORD')
  }

  public getMailAuthUser(): string {
    return this.getValue('MAIL_AUTH_USER')
  }

  public getMailService(): string {
    return this.getValue('MAIL_SERVICE')
  }

  public getEnvName(): string {
    return this.getValue('ENV_NAME')
  }

  public getMailFrom() {
    return this.getValue('MAIL_FROM')
  }

  public getMailTransport() {
    return this.getValue('MAIL_TRANSPORT')
  }

  public getPort() {
    return this.getValue('PORT')
  }

  public getUploadPath() {
    return this.getValue('MULTER_DEST')
  }

  public getJWT() {
    return this.getValue('JWT_SECRET')
  }

  public getJWTTokenLifetime() {
    return this.getValue('JWT_TOKEN_LIFETIME')
  }

  public getJWTRefreshTokenLifetime() {
    return this.getValue('JWT_REFRESH_TOKEN_LIFETIME')
  }

  public getMailHost(): string | undefined {
    return this.getValue('MAIL_HOST') || undefined
  }

  public getMailPort(): number | undefined {
    const port = this.getValue('MAIL_PORT')

    return port ? parseInt(port, 10) : undefined
  }

  public getMailSecure(): boolean | undefined {
    const secure = this.getValue('MAIL_SECURE')

    if (secure === '' || typeof secure === 'undefined') {
      return undefined
    }

    return secure !== 'false'
  }

  public getCorsWhitelistApi(): string {
    return this.getValue('CORS_WHITELIST_API')
  }

  public getImagesPath(): string {
    return this.getValue('IMAGES_PATH')
  }

  public getCorsWhitelistWeb(): string {
    return this.getValue('CORS_WHITELIST_WEB')
  }

  public isProduction() {
    return this.getValue('MODE') == 'PROD'
  }

  public getTypeOrmConfig(): any {
    const pathRoot = `${__dirname}/..`
    const pathEntietiesRoot = `${pathRoot}/api`
    const pathMigrationRoot = `${pathRoot}/migration`

    return {
      // TypeOrmModuleOptions
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      entities: [`${pathEntietiesRoot}/**/*.entity.{ts,js}`],
      subscribers: [`${pathEntietiesRoot}/**/*.subscriber.{ts,js}`],
      logging: true,
      migrationsTableName: 'migration',

      migrations: [`${pathMigrationRoot}/**/*{.ts,.js}`],

      cli: {
        migrationsDir: pathMigrationRoot,
      },
      // ssl: this.isProduction(),
    }
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
])

export { configService }
