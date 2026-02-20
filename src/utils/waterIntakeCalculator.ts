// src/utils/waterIntakeCalculator.ts

export const calculateRecommendedIntake = (weight: number, activityLevel: number, climate: string): number => {
  // Basic calculation (you can adjust the formula as needed)
  let recommendedIntake = weight * 0.03 // 0.03 liters per kg of body weight

  // Adjust for activity level
  recommendedIntake += activityLevel * 0.5 // Additional 0.5 liters per activity level unit

  // Adjust for climate
  if (climate.toLowerCase() === 'hot') {
    recommendedIntake += 0.75 // Additional 0.75 liters in hot climates
  }

  return Math.round(recommendedIntake * 1000) // Convert to ml
}