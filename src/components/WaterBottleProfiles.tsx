import React, { useState, useEffect } from 'react'

interface WaterBottle {
  id: number
  name: string
  capacity_ml: number
  image?: string // Optional image URL
}

const WaterBottleProfiles: React.FC = () => {
  const [bottles, setBottles] = useState<WaterBottle[]>([])
  const [newBottle, setNewBottle] = useState<Omit<WaterBottle, 'id'>>({
    name: '',
    capacity_ml: 500,
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    // Fetch water bottle profiles from the backend API
    const fetchBottles = async () => {
      try {
        const response = await fetch('/api/water-bottle-profiles') // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setBottles(data)
      } catch (error) {
        console.error('Failed to fetch water bottle profiles:', error)
      }
    }

    fetchBottles()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewBottle((prevBottle) => ({
      ...prevBottle,
      [name]: name === 'capacity_ml' ? parseInt(value) : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setNewBottle((prevBottle) => ({ ...prevBottle, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addBottle = async () => {
    try {
      const response = await fetch('/api/water-bottle-profiles', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBottle),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const addedBottle = await response.json()
      setBottles([...bottles, addedBottle])
      setNewBottle({
        name: '',
        capacity_ml: 500,
      })
      setSelectedImage(null)
    } catch (error) {
      console.error('Failed to add water bottle profile:', error)
    }
  }

  const deleteBottle = async (id: number) => {
    try {
      const response = await fetch(`/api/water-bottle-profiles/${id}`, { // Replace with your actual API endpoint
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      setBottles(bottles.filter((bottle) => bottle.id !== id))
    } catch (error) {
      console.error('Failed to delete water bottle profile:', error)
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Water Bottle Profiles</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={newBottle.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="capacity_ml" className="block text-sm font-medium text-gray-700">
          Capacity (ml):
        </label>
        <input
          type="number"
          id="capacity_ml"
          name="capacity_ml"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={newBottle.capacity_ml}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Image:
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleImageChange}
        />
        {selectedImage && (
          <img src={selectedImage} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
        )}
      </div>

      <button
        className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={addBottle}
      >
        Add Bottle
      </button>

      <ul className="mt-8">
        {bottles.map((bottle) => (
          <li key={bottle.id} className="mb-4 p-4 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800">{bottle.name}</h3>
                <p className="text-sm text-gray-600">Capacity: {bottle.capacity_ml} ml</p>
              </div>
              {bottle.image && (
                <img src={bottle.image} alt={bottle.name} className="h-16 w-16 object-cover rounded" />
              )}
              <button
                className="rounded-md bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => deleteBottle(bottle.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WaterBottleProfiles
