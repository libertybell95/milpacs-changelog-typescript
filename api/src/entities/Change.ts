import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { EventMessage } from '../lib/changes'

@Entity()
export default class Change {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  created: Date

  @Column()
  type: string

  @Column()
  userId: number

  @Column()
  milpacId: number

  @Column({
    type: 'json'
  })
  message: EventMessage
}
