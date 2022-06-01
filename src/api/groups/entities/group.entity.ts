import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { User } from '../../users/entities/user.entity'
import { Student } from '../../students/entities/student.entity'

@Entity({ name: Entities.GROUPS })
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string

  @Column({ nullable: false })
  orderNumber: string

  @Column({ nullable: true })
  deletedOrderNumber: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @OneToMany(() => Student, (student) => student.group)
  students: Student[]

  @ManyToOne(() => User, (user) => user.id)
  curator: User
}
