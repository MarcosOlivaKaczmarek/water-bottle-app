import express from 'express'
import { PORT } from './config'
import { db } from './db'
import goalsRouter from './api/goals'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api/goals', goalsRouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
