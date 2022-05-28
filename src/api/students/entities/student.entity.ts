import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'

@Entity({ name: Entities.STUDENTS })
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 10, nullable: false })
  dateOfBirth: string

  @Column({ type: 'integer', length: 10, nullable: false })
  groupId: number

  @Column({ type: 'varchar', length: 20, nullable: false })
  orderNumber: string

  @Column({ type: 'varchar', length: 8, nullable: false })
  edeboId: string

  @Column({ type: 'boolean', nullable: false })
  isFullTime: boolean
}
