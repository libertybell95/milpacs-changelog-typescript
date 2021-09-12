import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import config from 'config'
import { createConnection } from 'typeorm'

import Roster from './routes/roster'
import Trooper from './routes/trooper'

const app = express()
const PORT: number = config.get('port')

app.use(morgan('dev'))
app.use(bodyParser.json())

app.use('/roster', Roster)
app.use('/trooper', Trooper)

app.get('/', (req, res) => {
  res.sendStatus(200)
})

async function main (): Promise<void> {
  const dbConn = await createConnection()
  console.log('Database connected')

  const api = app.listen(PORT, () => console.log(`API is running on port ${PORT}`))

  process.on('SIGTERM', () => {
    dbConn.close().catch(err => console.error(err))
    api.close()
  })
}

main().catch(err => console.error(err))
