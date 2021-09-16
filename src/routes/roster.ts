/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Fix this in .eslintrc

import { Router } from 'express'
import { getChanges } from '../lib/changes'
import { getCurrentTroopers, getOldTroopers } from '../lib/rosters'
import { getConnection } from 'typeorm'
import Roster from '../entities/Roster'
import Change from '../entities/Change'
import config from 'config'

const router = Router()

router.get('/old', async (req, res) => {
  const roster = await getOldTroopers()
  if (roster === undefined) return res.sendStatus(404)

  res.send(roster)
})

router.get('/current', async (req, res) => {
  const roster = await getCurrentTroopers()
  if (roster === undefined) return res.sendStatus(404)

  res.send(roster)

  if (typeof req.query === 'object' && req.query.save === '1') {
    await getConnection().getRepository(Roster).insert({ roster })
  }
})

router.post('/compare', async (req, res) => {
  const old = await getOldTroopers()
  const current = await getCurrentTroopers()

  if (old === undefined) return res.sendStatus(404)
  if (current === undefined) return res.sendStatus(404)

  const changes = getChanges(old, current)
  res.send(changes)

  if (typeof req.query === 'object' && req.query.save === '1') {
    changes.forEach(event => getConnection().getRepository(Change).insert(event))
    await getConnection().getRepository(Roster).insert({ roster: current })
  }
})

// Delete old rosters. For space saving
router.delete('/cleanup', async (req, res) => {
  const rosters = await getConnection().getRepository(Roster).find({
    select: [ 'id', 'created' ],
    order: {
      created: 'DESC'
    }
  })

  rosters
    .slice(config.get<number>('max-trooper-files')) // Get rosters to delete
    .forEach(roster => getConnection().getRepository(Roster).delete({ id: roster.id })) // Delete them

  res.sendStatus(200)
})

export default router
