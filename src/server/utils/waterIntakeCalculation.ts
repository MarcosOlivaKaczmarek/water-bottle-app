// Function to calculate recommended water intake based on weight, activity level, and climate
export function calculateRecommendedIntake(weight: number, activityLevel: number, climate: string): number {
  // Use environment variables for default values
  const baseIntake = parseFloat(process.env.BASE_INTAKE || '2000') // Default: 2000ml
  const weightFactor = parseFloat(process.env.WEIGHT_FACTOR || '0.03') // Default: 0.03
  const activityFactor = parseFloat(process.env.ACTIVITY_FACTOR || '0.5') // Default: 0.5

  let recommendedIntake = baseIntake + weight * weightFactor

  if (activityLevel > 1) {
    recommendedIntake += activityLevel * activityFactor * weight
  }

  switch (climate) {
    case 'hot':
      recommendedIntake += 500
      break
    case 'cold':
      recommendedIntake -= 250
      break
    default:
      break
  }

  return Math.max(500, Math.round(recommendedIntake)) // Minimum intake: 500ml
}
