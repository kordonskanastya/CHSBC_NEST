import { BaseEntity, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'
import { Student } from '../../students/entities/student.entity'
import { Vote } from './voting.entity'

@Entity({ name: Entities.VOTING_RESULT })
export class VotingResultEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Vote, (Vote) => Vote.results)
  vote: Vote

  @ManyToOne(() => Course, (Course) => Course.votingResults)
  course: Course

  @ManyToOne(() => Student, (Student) => Student.votingResults)
  student: Student

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date
}
