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
import { Grade } from '../../grades/entities/grade.entity'
import { Vote } from '../../voting/entities/voting.entity'
import { GradeHistory } from '../../grades-history/entities/grades-history.entity'

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

  @Column({ nullable: false })
  isCompulsory: boolean

  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  teacher: User

  @ManyToMany(() => Group, (group) => group.courses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinTable()
  groups: Group[]

  @ManyToOne(() => Student, (student) => student.courses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student

  @OneToMany(() => Grade, (grade) => grade.student, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  grades: Grade[]

  @ManyToOne(() => Vote, (vote) => vote.requiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  voteRequiredCourses: Vote

  @ManyToOne(() => Vote, (vote) => vote.notRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  voteNotRequiredCourses: Vote

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @OneToMany(() => GradeHistory, (gradeHistory) => gradeHistory.course, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  gradesHistories: GradeHistory[]
}
