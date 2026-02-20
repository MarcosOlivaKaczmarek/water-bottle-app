import express, { Request, Response } from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import requireAuth from '../middleware/requireAuth'
import { dbQuery } from '../utils/dbQuery'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// AWS S3 configuration
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  },
})

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

interface AuthenticatedRequest extends Request {
  userId?: number
}

// Function to upload image to S3
const uploadImageToS3 = async (
  file: Express.Multer.File,
  userId: number,
  bottleName: string,
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined')
  }

  const key = `water-bottle-profiles/${userId}/${bottleName}-${Date.now()}-${file.originalname}`

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams))
    return `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Failed to upload image to S3')
  }
}

// Route to create a new water bottle profile
router.post(
  '/profiles',
  requireAuth,
  upload.single('image'),
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
    body('capacity_ml').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, capacity_ml } = req.body
      const userId = req.userId

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      let imageUrl = null
      if (req.file) {
        imageUrl = await uploadImageToS3(req.file, userId, name)
      }

      const query =
        'INSERT INTO water_bottle_profiles (user_id, name, capacity_ml, image_url) VALUES ($1, $2, $3, $4) RETURNING *'
      const values = [userId, name, capacity_ml, imageUrl]
      const result = await dbQuery(query, values)

      res.status(201).json(result.rows[0])
    } catch (error: any) {
      console.error('Error creating water bottle profile:', error)
      res.status(500).json({ message: error.message || 'Server error' })
    }
  },
)

// Route to get all water bottle profiles for a user
router.get('/profiles', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const query = 'SELECT * FROM water_bottle_profiles WHERE user_id = $1'
    const values = [userId]
    const result = await dbQuery(query, values)

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error getting water bottle profiles:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Route to get a specific water bottle profile by ID
router.get('/profiles/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const query = 'SELECT * FROM water_bottle_profiles WHERE id = $1 AND user_id = $2'
    const values = [id, userId]
    const result = await dbQuery(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Water bottle profile not found' })
    }

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error getting water bottle profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Route to update a water bottle profile
router.put(
  '/profiles/:id',
  requireAuth,
  upload.single('image'),
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
    body('capacity_ml').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { id } = req.params
      const { name, capacity_ml } = req.body
      const userId = req.userId

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      let imageUrl = null
      if (req.file) {
        imageUrl = await uploadImageToS3(req.file, userId, name)
      }

      let query = 'UPDATE water_bottle_profiles SET name = $1, capacity_ml = $2, updated_at = NOW()'
      let values: any[] = [name, capacity_ml]

      if (imageUrl) {
        query += ', image_url = $3'
        values.push(imageUrl)
      }

      query += ' WHERE id = $4 AND user_id = $5 RETURNING *'
      values.push(id, userId)

      const result = await dbQuery(query, values)

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Water bottle profile not found' })
      }

      res.status(200).json(result.rows[0])
    } catch (error: any) {
      console.error('Error updating water bottle profile:', error)
      res.status(500).json({ message: error.message || 'Server error' })
    }
  },
)

// Route to delete a water bottle profile
router.delete('/profiles/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const query = 'DELETE FROM water_bottle_profiles WHERE id = $1 AND user_id = $2 RETURNING *'
    const values = [id, userId]
    const result = await dbQuery(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Water bottle profile not found' })
    }

    res.status(200).json({ message: 'Water bottle profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting water bottle profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
