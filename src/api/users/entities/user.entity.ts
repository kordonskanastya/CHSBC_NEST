import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ROLE } from '../../../auth/roles/role.enum'
import { hashPassword } from '../users.service'
import { Entities } from '../../common/enums'
import { Course } from '../../courses/entities/course.entity'
import { Group } from '../../groups/entities/group.entity'
import { Student } from '../../students/entities/student.entity'

export interface RefreshToken {
  token: string
  expiresIn: Date
}

export type RefreshTokenList = RefreshToken[]

@Entity({ name: Entities.USERS })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 200, nullable: true })
  firstName: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  lastName: string

  @Column({ type: 'varchar', length: 200, nullable: true })
  patronymic: string

  @Column({ type: 'varchar', length: 320, unique: true, nullable: true })
  email: string

  @Column({ nullable: false })
  password: string

  @Column({ default: ROLE.STUDENT, enum: ROLE })
  role: ROLE

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated: Date

  @Column({ type: 'jsonb', nullable: true })
  refreshTokenList: RefreshTokenList

  @OneToMany(() => Course, (course) => course.teacher, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  courses: Course[]

  @OneToMany(() => Group, (group) => group.curator, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  groups: Group[]

  @OneToOne(() => Student, (student) => student.user, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  student: Student

  @BeforeInsert()
  async hashPassword() {
    this.password = await hashPassword(this.password)
  }
}
