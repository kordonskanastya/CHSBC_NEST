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

@Entity({ name: Entities.GROUPS })
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string

  @ManyToOne(() => User, (user) => user.id)
  curatorId: User

  @Column({ nullable: false })
  orderNumber: string

  @Column({ nullable: true })
  deletedOrderNumber: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date
}
