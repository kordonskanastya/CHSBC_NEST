import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'

@Entity({ name: Entities.GROUPS })
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string

  @Column({ nullable: false })
  curatorId: number

  @Column({ nullable: false })
  orderNumber: string

  @Column({ nullable: true })
  deletedOrderNumber: string
}
