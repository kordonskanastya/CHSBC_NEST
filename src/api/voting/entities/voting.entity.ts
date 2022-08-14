import { BaseEntity, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Entities } from '../../common/enums'

@Entity({ name: Entities.VOTING })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number
}
