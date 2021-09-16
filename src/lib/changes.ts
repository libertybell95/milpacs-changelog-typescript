import { compareTrooper, Trooper, Record, Award } from './scraper'
import { getTrooper } from './rosters'

export enum EventType {
  NAME = 'name',
  RANK = 'rank',
  ROSTER = 'roster',
  PRIMARY = 'primary',
  SECONDARY_ADDED = 'secondary - added',
  SECONDARY_REMOVED = 'secondary - removed',
  AWARD_ADDED = 'award - added',
  AWARD_REMOVED = 'award - removed',
  RECORD_ADDED = 'record - added',
  RECORD_REMOVED = 'record - removed',
  TROOPER_ADDED = 'trooper - added',
  TROOPER_REMOVED = 'trooper - removed',
}

export type EventMessage = Record | Award | { from: string, to: string }

export interface Event {
  type: EventType
  userId: number
  milpacId: number
  message: EventMessage
}

export function getChanges (oldTroopers: Trooper[], currentTroopers: Trooper[]): Event[] {
  const oldTrooperIds = oldTroopers.map(v => v.user.userId)
  const currentTrooperIds = currentTroopers.map(v => v.user.userId)

  const newTrooperIds = currentTrooperIds.filter(v => !oldTrooperIds.includes(v))
  const deletedTrooperIds = oldTrooperIds.filter(v => !currentTrooperIds.includes(v))

  const events: Event[] = []
  newTrooperIds
    .map(v => getTrooper(currentTroopers, v))
    .forEach(v => {
      if (v !== undefined) {
        events.push({ type: EventType.TROOPER_ADDED, userId: Number(v.user.userId), milpacId: Number(v.user.milpacId), message: { from: '', to: v.realName } })
      }
    })

  deletedTrooperIds
    .map(v => getTrooper(oldTroopers, v))
    .forEach(v => {
      if (v !== undefined) {
        events.push({ type: EventType.TROOPER_REMOVED, userId: Number(v.user.userId), milpacId: Number(v.user.milpacId), message: { from: v.realName, to: '' } })
      }
    })

  currentTroopers.forEach(current => {
    if (newTrooperIds.includes(current.user.userId)) return null
    if (deletedTrooperIds.includes(current.user.userId)) return null

    const old = getTrooper(oldTroopers, current.user.userId)
    if (old !== undefined) compareTrooper(old, current).forEach(e => events.push(e))
  })

  return events
}
