// src/types/goal.ts

export interface Goal {
  id: number
  user_id: number
  daily_goal_ml: number
  start_date: Date
  end_date: Date | null
}