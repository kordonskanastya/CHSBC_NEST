import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Student } from '../../students/entities/student.entity'
import { Course } from '../../courses/entities/course.entity'

@Entity({ name: Entities.GRADES })
export class Grade extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Student, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  student: Student

  @Column({ default: 0, nullable: false })
  grade: number

  @ManyToOne(() => Course, (course) => course.student, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  course: Course
}
