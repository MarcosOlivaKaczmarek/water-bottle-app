import { Request, Response } from 'express'
import { findUserById, updateUser } from '../services/userService'

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const user = await findUserById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Omit the password from the user object before sending it in the response
    const { password, ...userWithoutPassword } = user

    res.status(200).json(userWithoutPassword)
  } catch (error) {
    console.error('Error getting user profile:', error)
    res.status(500).json({ message: 'Failed to get user profile' })
  }
}

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id
    const updatedUser = await updateUser(userId, req.body)

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Omit the password from the user object before sending it in the response
    const { password, ...userWithoutPassword } = updatedUser

    res.status(200).json({ message: 'User profile updated successfully', user: userWithoutPassword })
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Failed to update user profile' })
  }
}
