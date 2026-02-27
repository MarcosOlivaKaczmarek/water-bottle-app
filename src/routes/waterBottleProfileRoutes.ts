import express from 'express'
import { createWaterBottleProfile, getWaterBottleProfiles, deleteWaterBottleProfile } from '../controllers/waterBottleProfileController'

const router = express.Router()

router.post('/', createWaterBottleProfile)
router.get('/', getWaterBottleProfiles)
router.delete('/:id', deleteWaterBottleProfile)

export const waterBottleProfileRoutes = router
