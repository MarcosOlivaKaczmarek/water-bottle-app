export const calculateRecommendedIntake = (
  weightKg: number,
  activityLevel: number,
  climate: string,
): number => {
  // Base intake (ml) - You can adjust this base value
  let recommendedIntake = weightKg * 30

  // Adjustments for activity level
  switch (activityLevel) {
    case 1: // Sedentary
      recommendedIntake += 0
      break
    case 2: // Lightly active
      recommendedIntake += 250
      break
    case 3: // Moderately active
      recommendedIntake += 500
      break
    case 4: // Very active
      recommendedIntake += 750
      break
    case 5: // Extremely active
      recommendedIntake += 1000
      break
    default:
      break
  }

  // Adjustments for climate
  switch (climate) {
    case 'hot':
      recommendedIntake += 500
      break
    case 'very_hot':
      recommendedIntake += 1000
      break
    case 'humid':
      recommendedIntake += 300
      break
    default:
      break
  }

  return Math.round(recommendedIntake)
}
