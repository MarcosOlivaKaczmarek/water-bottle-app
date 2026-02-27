import express from 'express'
import { createHydrationReminder, getHydrationReminders, deleteHydrationReminder } from '../controllers/hydrationReminderController'

const router = express.Router()

router.post('/', createHydrationReminder)
router.get('/', getHydrationReminders)
router.delete('/:id', deleteHydrationReminder)

export const hydrationReminderRoutes = router
