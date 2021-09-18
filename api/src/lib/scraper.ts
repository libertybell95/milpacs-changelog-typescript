import { Event, EventType } from './changes'

export interface User {
  milpacId: string
  userId: string
  username: string
}

export interface Rank {
  rankShort: string
  rankFull: string
  rankImageUrl: string
}

export enum RosterType {
  UNSPECIFIED = 'ROSTER_TYPE_UNSPECIFIED',
  COMBAT = 'ROSTER_TYPE_COMBAT',
  RESERVE = 'ROSTER_TYPE_RESERVE',
  ELOA = 'ROSTER_TYPE_ELOA',
  WALL_OF_HONOR = 'ROSTER_TYPE_WALL_OF_HONOR',
  ARLINGTON = 'ROSTER_TYPE_ARLINGTON',
  PAST_MEMBERS = 'ROSTER_TYPE_PAST_MEMBERS'
}

export interface Position {
  positionTitle: string
}

export enum RecordType {
  ASSIGNMENT = 'RECORD_TYPE_ASSIGNMENT',
  DISCHARGE = 'RECORD_TYPE_DISCHARGE',
  GRADUATION = 'RECORD_TYPE_GRADUATION',
  OPERATION = 'RECORD_TYPE_OPERATION',
  PROMOTION = 'RECORD_TYPE_PROMOTION',
  TRANSFER = 'RECORD_TYPE_TRANSFER',
  UNSPECIFIED = 'RECORD_TYPE_UNSPECIFIED'
}

export interface Record {
  recordDetails: string
  recordType: RecordType
  recordDate: string
}

export interface Award {
  awardDetails: string
  awardName: string
  awardDate: string
  awardImageUrl: string
}

export interface Trooper {
  user: User
  rank: Rank
  realName: string
  uniformUrl: string
  roster: RosterType
  primary: Position
  secondaries: Position[]
  records: Record[]
  awards: Award[]
  joinDate: string
  promotionDate: string
}

export function compareTrooper (old: Trooper, current: Trooper): Event[] {
  const diff = (arr1: string[], arr2: string[]): string[] => arr1.filter(v => !arr2.includes(v))
  const events: Event[] = []

  // * Check matching user.userId
  if (old.user.userId !== current.user.userId) {
    throw new Error('user.userId does not match. Failing')
  }

  // * Name
  if (old.realName !== current.realName) {
    events.push({ type: EventType.NAME, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.realName, to: current.realName } })
  }

  // * Rank
  if (old.rank.rankShort !== current.rank.rankShort) {
    events.push({ type: EventType.RANK, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.rank.rankShort, to: current.rank.rankShort } })
  }

  // * Roster
  if (old.roster !== current.roster) {
    events.push({ type: EventType.ROSTER, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.roster, to: current.roster } })
  }

  // * Primary Position
  if (old.primary.positionTitle !== current.primary.positionTitle) {
    events.push({ type: EventType.PRIMARY, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.primary.positionTitle, to: current.primary.positionTitle } })
  }

  // * Secondary Position(s)
  if (JSON.stringify(old.secondaries) !== JSON.stringify(current.secondaries)) {
    const oldSecondaries = old.secondaries.map(v => v.positionTitle)
    const currentSecondaries = current.secondaries.map(v => v.positionTitle)

    diff(oldSecondaries, currentSecondaries)
      .forEach(v => events.push({ type: EventType.SECONDARY_REMOVED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: v, to: '' } }))
    diff(currentSecondaries, oldSecondaries)
      .forEach(v => events.push({ type: EventType.SECONDARY_ADDED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: '', to: v } }))
  }

  // * Service Records
  if (JSON.stringify(old.records) !== JSON.stringify(current.records)) {
    const oldRecords = old.records.map(v => JSON.stringify(v))
    const currentRecords = current.records.map(v => JSON.stringify(v))

    diff(oldRecords, currentRecords)
      .forEach(v => events.push({ type: EventType.RECORD_REMOVED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
    diff(currentRecords, oldRecords)
      .forEach(v => events.push({ type: EventType.RECORD_ADDED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
  }

  // * Awards
  if (JSON.stringify(old.awards) !== JSON.stringify(current.awards)) {
    const oldAwards = old.awards.map(v => JSON.stringify(v))
    const currentAwards = current.awards.map(v => JSON.stringify(v))

    diff(oldAwards, currentAwards)
      .forEach(v => events.push({ type: EventType.AWARD_REMOVED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
    diff(currentAwards, oldAwards)
      .forEach(v => events.push({ type: EventType.AWARD_ADDED, userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
  }

  return events
}
