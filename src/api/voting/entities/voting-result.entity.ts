import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'
import { Student } from '../../students/entities/student.entity'
import { Vote } from './voting.entity'

@Entity({ name: Entities.VOTING_RESULT })
export class VotingResult extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Vote, (Vote) => Vote.results, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  vote: Vote

  @ManyToOne(() => Course, (Course) => Course.votingResults, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  course: Course

  @ManyToOne(() => Student, (Student) => Student.votingResults, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  student: Student

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @Column({ nullable: true })
  tableIndex: number
}
