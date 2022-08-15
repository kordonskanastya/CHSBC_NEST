import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'

@Entity({ name: Entities.VOTING })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  startDate: string

  @Column({ nullable: true })
  endDate: string

  @OneToMany(() => Course, (course) => course.voteRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  requiredCourses: Course[]

  @OneToMany(() => Course, (course) => course.voteNotRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notRequiredCourses: Course[]
}
