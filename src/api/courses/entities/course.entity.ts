import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'
import { Student } from '../../students/entities/student.entity'
import { Vote } from '../../voting/entities/voting.entity'
import { GradeHistory } from '../../grades-history/entities/grades-history.entity'
import { VotingResult } from '../../voting/entities/voting-result.entity'

@Entity({ name: Entities.COURSES })
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  credits: number

  @Column({ nullable: false })
  lectureHours: number

  @Column({ nullable: false })
  isActive: boolean

  @Column({ nullable: false, default: false })
  isExam: boolean

  @Column({ nullable: false })
  semester: number

  @Column({ nullable: true })
  type: string

  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  teacher: User

  @ManyToMany(() => Group, (group) => group.courses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinTable()
  groups: Group[]

  @ManyToMany(() => Student, (student) => student.courses, { onDelete: 'CASCADE' })
  @JoinTable()
  students: Student[]

  @ManyToMany(() => Vote, (vote) => vote.requiredCourses, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinTable()
  voteRequiredCourses: Vote[]

  @ManyToMany(() => Vote, (vote) => vote.notRequiredCourses, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinTable()
  voteNotRequiredCourses: Vote[]

  @OneToMany(() => VotingResult, (VotingResultEntity) => VotingResultEntity.course)
  votingResults: VotingResult[]

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @OneToMany(() => GradeHistory, (gradeHistory) => gradeHistory.course, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  gradesHistories: GradeHistory[]
}
