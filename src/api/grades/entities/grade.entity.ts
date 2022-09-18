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

@Entity({ name: Entities.GRADES })
export class Grade extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Student, (student) => student.grades, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student

  @Column({ nullable: true })
  grade: number

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn()
  course: Course

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date
}
