import { Request, Response } from 'express'
import { createProfile, getProfiles, deleteProfile } from '../services/waterBottleProfileService'

export const createWaterBottleProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { name, capacity_ml, image } = req.body

    const newProfile = await createProfile(userId, name, capacity_ml, image)

    res.status(201).json({ message: 'Water bottle profile created successfully', profile: newProfile })
  } catch (error) {
    console.error('Error creating water bottle profile:', error)
    res.status(500).json({ message: 'Failed to create water bottle profile' })
  }
}

export const getWaterBottleProfiles = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const profiles = await getProfiles(userId)

    res.status(200).json(profiles)
  } catch (error) {
    console.error('Error getting water bottle profiles:', error)
    res.status(500).json({ message: 'Failed to get water bottle profiles' })
  }
}

export const deleteWaterBottleProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const { id } = req.params

    await deleteProfile(userId, parseInt(id))

    res.status(200).json({ message: 'Water bottle profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting water bottle profile:', error)
    res.status(500).json({ message: 'Failed to delete water bottle profile' })
  }
}
