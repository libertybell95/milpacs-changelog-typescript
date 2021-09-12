export interface Trooper {
  user: User
  rank: Rank
  realName: string
  uniformUrl: string
  roster: string
  primary: Position
  secondaries: Position[]
  records: Record[]
  awards: Award[]
  joinDate: string
  promotionDate: string
}

interface Award {
  awardDetails: string
  awardName: string
  awardDate: string
  awardImageUrl: string
}

interface Position {
  positionTitle: string
}

interface Rank {
  rankShort: string
  rankFull: string
  rankImageUrl: string
}

export interface Record {
  recordDetails: string
  recordType: RecordType
  recordDate: string
}

export enum RecordType {
  RecordTypeAssignment = 'RECORD_TYPE_ASSIGNMENT',
  RecordTypeDischarge = 'RECORD_TYPE_DISCHARGE',
  RecordTypeGraduation = 'RECORD_TYPE_GRADUATION',
  RecordTypeOperation = 'RECORD_TYPE_OPERATION',
  RecordTypePromotion = 'RECORD_TYPE_PROMOTION',
  RecordTypeTransfer = 'RECORD_TYPE_TRANSFER',
  RecordTypeUnspecified = 'RECORD_TYPE_UNSPECIFIED'
}

export interface User {
  milpacId: string
  userId: string
  username: string
}

export interface Event {
  type: string
  userId: number
  milpacId: number
  message: EventMessage
}

export type EventMessage = Record | Award | { from: string, to: string}

export function compareTrooper (old: Trooper, current: Trooper): Event[] {
  const diff = (arr1: string[], arr2: string[]): string[] => arr1.filter(v => !arr2.includes(v))
  const events: Event[] = []

  // * Check matching user.userId
  if (old.user.userId !== current.user.userId) {
    throw new Error('user.userId does not match. Failing')
  }

  // * Name
  if (old.realName !== current.realName) {
    events.push({ type: 'name', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.realName, to: current.realName } })
  }

  // * Rank
  if (old.rank.rankShort !== current.rank.rankShort) {
    events.push({ type: 'rank', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.rank.rankShort, to: current.rank.rankShort } })
  }

  // * Roster
  if (old.roster !== current.roster) {
    events.push({ type: 'roster', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.roster, to: current.roster } })
  }

  // * Primary Position
  if (old.primary.positionTitle !== current.primary.positionTitle) {
    events.push({ type: 'primary', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: old.primary.positionTitle, to: current.primary.positionTitle } })
  }

  // * Secondary Position(s)
  if (JSON.stringify(old.secondaries) !== JSON.stringify(current.secondaries)) {
    const oldSecondaries = old.secondaries.map(v => v.positionTitle)
    const currentSecondaries = current.secondaries.map(v => v.positionTitle)

    diff(oldSecondaries, currentSecondaries)
      .forEach(v => events.push({ type: 'secondary - removed', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: v, to: '' } }))
    diff(currentSecondaries, oldSecondaries)
      .forEach(v => events.push({ type: 'secondary - added', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: { from: '', to: v } }))
  }

  // * Service Records
  if (JSON.stringify(old.records) !== JSON.stringify(current.records)) {
    const oldRecords = old.records.map(v => JSON.stringify(v))
    const currentRecords = current.records.map(v => JSON.stringify(v))

    diff(oldRecords, currentRecords)
      .forEach(v => events.push({ type: 'record - removed', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
    diff(currentRecords, oldRecords)
      .forEach(v => events.push({ type: 'record - added', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
  }

  // * Awards
  if (JSON.stringify(old.awards) !== JSON.stringify(current.awards)) {
    const oldAwards = old.awards.map(v => JSON.stringify(v))
    const currentAwards = current.awards.map(v => JSON.stringify(v))

    diff(oldAwards, currentAwards)
      .forEach(v => events.push({ type: 'award - removed', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
    diff(currentAwards, oldAwards)
      .forEach(v => events.push({ type: 'award - added', userId: Number(current.user.userId), milpacId: Number(current.user.milpacId), message: JSON.parse(v) }))
  }

  return events
}
