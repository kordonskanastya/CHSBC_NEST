import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { User } from '../../users/entities/user.entity'
import { SubscriberEventTypes } from './logger-subscriber'
import { plainToClass } from 'class-transformer'
import { GetLoggerUserDto } from '../dto/get-logger-user.dto'

interface OptionsData {
  id?: number
  user?: User
  skip?: boolean
  eventName?: string
}

@Entity({ name: Entities.LOGGERS })
export class Logger extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ enum: SubscriberEventTypes })
  event: string

  @Column({ type: 'jsonb', nullable: true })
  before: any

  @Column({ type: 'jsonb', nullable: true })
  after: any

  @Column({ enum: Entities })
  entity: string

  @Column({ nullable: true })
  entityId: number

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  static async make<T>(
    event: SubscriberEventTypes,
    before: T,
    after: T,
    entityName: string,
    optionsData?: OptionsData | any,
  ) {
    if (optionsData && optionsData.skip === true) {
      return
    }

    const diffBefore = Object.keys(before || {})
      .sort()
      .filter((key) => /*key !== 'updated' && */ key !== 'user')
      .reduce((acc, key) => {
        acc[key] = typeof before[key] === 'object' && before[key]?.id ? { id: before[key].id } : before[key]

        return acc
      }, {})

    const diffAfter = Object.keys(after || {})
      .sort()
      .filter((key) => /*key !== 'updated' && */ key !== 'user')
      .reduce((acc, key) => {
        acc[key] = typeof after[key] === 'object' && after[key]?.id ? { id: after[key].id } : after[key]

        return acc
      }, {})

    if (JSON.stringify(diffBefore) === JSON.stringify(diffAfter)) {
      return
    }

    const data = {
      event: optionsData && optionsData.eventName ? optionsData.eventName : event,
      entity: entityName,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      entityId: after ? after?.id : before?.id,
      before,
      after,
      user: undefined,
    }

    if (optionsData) {
      if (optionsData.user) {
        data.user = plainToClass(GetLoggerUserDto, optionsData.user, {
          excludeExtraneousValues: true,
        })
      } else if (optionsData.id) {
        data.user = plainToClass(GetLoggerUserDto, await User.findOne(optionsData.id), {
          excludeExtraneousValues: true,
        })
      }
    }

    await this.create(data).save()
  }
}
