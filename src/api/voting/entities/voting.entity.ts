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
import { VotingResult } from './voting-result.entity'
import { Student } from '../../students/entities/student.entity'

@Entity({ name: Entities.VOTING })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  startDate: Date

  @Column({ nullable: true })
  endDate: Date

  @Column({ nullable: false, default: 0 })
  tookPart: number

  @OneToMany(() => Group, (group) => group.vote, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  groups: Group[]

  @ManyToMany(() => Course, (course) => course.voteRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  requiredCourses: Course[]

  @ManyToMany(() => Course, (course) => course.voteNotRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notRequiredCourses: Course[]

  @OneToMany(() => VotingResult, (votingResultEntity) => votingResultEntity.vote, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  results: VotingResult[]

  @Column({ nullable: true })
  status: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @OneToMany(() => Student, (student) => student.vote)
  students: Student[]

  @Column({ nullable: false, default: false })
  isRevote: boolean

  @Column({ nullable: false, default: false })
  isApproved: boolean
}
