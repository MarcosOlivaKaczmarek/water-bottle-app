-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: water_intake_logs
CREATE TABLE water_intake_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quantity_ml INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: goals
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    daily_goal_ml INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- Can be null for ongoing goals
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: water_bottle_profiles
CREATE TABLE water_bottle_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity_ml INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: hydration_reminders
CREATE TABLE hydration_reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    cron_expression VARCHAR(255) NOT NULL,
    quantity_ml INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_water_intake_logs_user_id ON water_intake_logs (user_id);
CREATE INDEX idx_water_intake_logs_timestamp ON water_intake_logs (timestamp);
CREATE INDEX idx_goals_user_id ON goals (user_id);
CREATE INDEX idx_water_bottle_profiles_user_id ON water_bottle_profiles (user_id);
CREATE INDEX idx_hydration_reminders_user_id ON hydration_reminders (user_id);
