import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { User } from '../../users/entities/user.entity'
import { Student } from '../../students/entities/student.entity'
import { Course } from '../../courses/entities/course.entity'
import { Vote } from '../../voting/entities/voting.entity'

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

  @OneToMany(() => Student, (student) => student.group, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  students: Student[]

  @ManyToOne(() => User, (user) => user.groups, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  curator: User

  @ManyToMany(() => Course, (course) => course.groups, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  courses: Course[]

  @ManyToOne(() => Vote, (vote) => vote.groups, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  vote: Vote
}
