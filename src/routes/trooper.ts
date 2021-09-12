/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Fix this in .eslintrc

import { Router } from 'express'
import { getConnection } from 'typeorm'
import Change from '../entities/Change'

const router = Router()

router.get('/userId/:id', async (req, res) => {
  const changes = await getConnection().getRepository(Change).find({ userId: Number(req.params.id) })
  res.json(changes)
})

router.get('/milpacId/:id', async (req, res) => {
  const changes = await getConnection().getRepository(Change).find({ milpacId: Number(req.params.id) })
  res.json(changes)
})

export default router
