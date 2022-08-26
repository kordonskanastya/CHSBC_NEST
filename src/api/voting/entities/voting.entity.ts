import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'
import { Group } from '../../groups/entities/group.entity'
import { Student } from '../../students/entities/student.entity'

@Entity({ name: Entities.VOTING })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  startDate: string

  @Column({ nullable: true })
  endDate: string

  @Column({ nullable: false, default: 0 })
  tookPart: number

  @OneToMany(() => Group, (group) => group.vote, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  groups: Group[]

  @OneToMany(() => Course, (course) => course.voteRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  requiredCourses: Course[]

  @OneToMany(() => Course, (course) => course.voteNotRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notRequiredCourses: Course[]

  @ManyToMany(() => Student, (student) => student.votes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  students: Student[]

  @Column({ nullable: true })
  status: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date
}
