CREATE TABLE IF NOT EXISTS foods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price INTEGER,
  tags TEXT
);

CREATE TABLE IF NOT EXISTS meal_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL DEFAULT 'default',
  date TEXT NOT NULL,
  food_ids TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_checkins (
  date TEXT,
  user_id TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL CHECK (status IN ('FOLLOWED', 'NOT_FOLLOWED')),
  PRIMARY KEY (date, user_id)
);
