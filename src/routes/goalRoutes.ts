import express from 'express'
import { setGoal, getGoal } from '../controllers/goalController'

const router = express.Router()

router.post('/', setGoal)
router.get('/', getGoal)

export const goalRoutes = router
