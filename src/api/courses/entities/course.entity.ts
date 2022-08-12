import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'

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
}
