/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Fix this in .eslintrc

import { Router } from 'express'
import { getChanges } from '../lib/changes'
import { getCurrentTroopers, getOldTroopers } from '../lib/rosters'
import { getConnection } from 'typeorm'
import Roster from '../entities/Roster'
import Change from '../entities/Change'

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

router.get('/compare', async (req, res) => {
  const old = await getOldTroopers()
  const current = await getCurrentTroopers()

  if (old === undefined) return res.sendStatus(404)
  if (current === undefined) return res.sendStatus(404)

  const changes = getChanges(old, current)
  res.send(changes)

  if (typeof req.query === 'object' && req.query.save === '1') {
    changes.forEach(async (event) => await getConnection().getRepository(Change).insert(event))
    await getConnection().getRepository(Roster).insert({ roster: current })
  }
})

export default router
