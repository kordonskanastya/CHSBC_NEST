import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Student } from '../../students/entities/student.entity'
import { Course } from '../../courses/entities/course.entity'
import { User } from '../../users/entities/user.entity'

@Entity({ name: Entities.GRADES_HISTORY })
export class GradeHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Student, (student) => student.gradesHistories, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student

  @Column({ default: 0, nullable: false })
  grade: number

  @ManyToOne(() => Course, (course) => course.gradesHistories, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  course: Course

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  userChanged: User

  @Column({ default: null })
  reasonOfChange: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
