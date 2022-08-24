import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Student } from '../../students/entities/student.entity'
import { Vote } from './voting.entity'
import { Entities } from '../../common/enums'

@Entity({ name: Entities.VOTING_HISTORY })
export class VoteResult extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Student)
  @JoinColumn()
  student: Student

  @Column({ default: false })
  isVoted: boolean

  @OneToOne(() => Vote)
  @JoinColumn()
  vote: Vote
}
