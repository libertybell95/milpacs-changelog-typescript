import { Trooper } from './scraper'
import config from 'config'
import axios from 'axios'
import { getConnection } from 'typeorm'
import Roster from '../entities/Roster'

export async function getCurrentTroopers (): Promise<Trooper[] | undefined> {
  const rosters: string[] = config.get('rosters')

  let troopers: Trooper[] = []

  for (let i = 0; i < rosters.length; i++) {
    const res = await axios.get(`https://api.7cav.us/api/v1/roster/${rosters[i]}`, {
      headers: { Authorization: `Bearer ${config.get<string>('api-key')}` }
    })
    if (res.status !== 200) return undefined

    const profiles: Trooper[] = []
    for (const p in res.data.profiles) {
      const profile: Trooper = res.data.profiles[p]
      profile.user.milpacId = profile.uniformUrl.match(/\/\d+\/(?<milpacId>\d+)/)?.groups?.milpacId ?? ''
      profiles.push(profile)
    }
    troopers = troopers.concat(profiles)
  }

  return troopers
}

export async function getOldTroopers (): Promise<Trooper[] | undefined> {
  const roster = await getConnection().getRepository(Roster).findOne({
    order: { created: 'DESC' }
  })
  return roster?.roster
}

export function getTrooper (troopers: Trooper[], userId: string): Trooper | undefined {
  return troopers.find(v => v.user.userId === userId)
}
