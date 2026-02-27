import express from 'express'
import { logWaterIntake, getWaterIntake, getHistoricalWaterIntake } from '../controllers/waterIntakeController'

const router = express.Router()

router.post('/', logWaterIntake)
router.get('/', getWaterIntake)
router.get('/historical', getHistoricalWaterIntake)

export const waterIntakeRoutes = router
