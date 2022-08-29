import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'
import { Group } from '../../groups/entities/group.entity'
import { VotingResultEntity } from './voting-result.entity'

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

  @OneToMany(() => Course, (course) => course.voteRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  requiredCourses: Course[]

  @OneToMany(() => Course, (course) => course.voteNotRequiredCourses, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  notRequiredCourses: Course[]

  @OneToMany(() => VotingResultEntity, (votingResultEntity) => votingResultEntity.vote, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  results: VotingResultEntity[]

  @Column({ nullable: true })
  status: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date
}
