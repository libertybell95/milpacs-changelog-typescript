import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Trooper } from '../lib/scraper'

@Entity()
export default class Roster {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  created: Date

  @Column({
    type: 'json'
  })
  roster: Trooper[]
}
