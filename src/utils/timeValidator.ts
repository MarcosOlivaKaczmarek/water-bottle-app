export const validateTime = (time: string): boolean => {
  if (!time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return false
  }

  const [hours, minutes] = time.split(':').map(Number)

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return false
  }

  return true
}
