import { EntitySubscriberInterface, UpdateEvent, InsertEvent, RemoveEvent } from 'typeorm'
import { Logger } from './logger.entity'
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral'

export enum SubscriberEventTypes {
  AFTER_INSERT = 'create',
  BEFORE_UPDATE = 'update',
  BEFORE_REMOVE = 'remove',
}

export class LoggerSubscriber<T> implements EntitySubscriberInterface<T> {
  prepareData(data) {
    return data
  }

  getEntityName(event) {
    return event.metadata.tablePath
  }

  afterInsert(event: InsertEvent<T>): void {
    Logger.make<T>(
      SubscriberEventTypes.AFTER_INSERT,
      null,
      this.prepareData(event.entity),
      this.getEntityName(event),
      event.queryRunner.data,
    )
  }

  beforeUpdate(event: UpdateEvent<T>): void {
    Logger.make<ObjectLiteral>(
      SubscriberEventTypes.BEFORE_UPDATE,
      this.prepareData(event.databaseEntity),
      this.prepareData(event.entity),
      this.getEntityName(event),
      event.queryRunner.data,
    )
  }

  beforeRemove(event: RemoveEvent<T>): void {
    Logger.make<T>(
      SubscriberEventTypes.BEFORE_REMOVE,
      this.prepareData(event.databaseEntity),
      null,
      this.getEntityName(event),
      event.queryRunner.data,
    )
  }
}
