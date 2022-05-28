import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'
import { Group } from '../../groups/entities/group.entity'
import { User } from '../../users/entities/user.entity'

@Entity({ name: Entities.STUDENTS })
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 10, nullable: false })
  dateOfBirth: string

  @ManyToOne((type) => Group, (group) => group.id)
  @JoinColumn()
  groupId: Group

  @OneToOne(() => User)
  @JoinColumn()
  userId: User

  @Column({ type: 'varchar', length: 20, nullable: false })
  orderNumber: string

  @Column({ type: 'varchar', length: 8, nullable: false })
  edeboId: string

  @Column({ type: 'boolean', nullable: false })
  isFullTime: boolean
}
