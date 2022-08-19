import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'
import { Course } from '../../courses/entities/course.entity'
import { Vote } from '../../voting/entities/voting.entity'

@Entity({ name: Entities.STUDENTS })
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 10, nullable: false })
  dateOfBirth: string

  @Column({ type: 'varchar', length: 20, nullable: false })
  orderNumber: string

  @Column({ type: 'varchar', length: 8, nullable: false })
  edeboId: string

  @Column({ type: 'boolean', nullable: false })
  isFullTime: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @ManyToOne(() => Group, (group) => group.students, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  group: Group

  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  user: User

  @OneToMany(() => Course, (course) => course.student, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  courses: Course[]

  @ManyToOne(() => Vote, (vote) => vote.students, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  vote: Vote
}
