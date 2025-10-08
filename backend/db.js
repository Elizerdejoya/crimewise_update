const { Database } = require("@sqlitecloud/drivers");

// Connect to SQLite Cloud database 
const db = new Database(
  "sqlitecloud://cl5xzepunk.g5.sqlite.cloud:8860/crimewise?apikey=j1VlFrxb2bE7DDETTXb96dtsabmyn77UA4Aa1Oge2hg"
);

// Function to initialize the database schema
async function initializeSchema() {
  try {
    console.log("Connecting to SQLite Cloud...");
    // The connection might happen implicitly or require an explicit connect method
    // Check driver docs if connection issues arise.

    console.log("Initializing database schema...");

    // --- MULTI-TENANT TABLES ---
    await db.sql`CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      domain TEXT UNIQUE,
      contact_email TEXT,
      contact_phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      subscription_plan TEXT DEFAULT 'basic',
      max_users INTEGER DEFAULT 50,
      max_storage_gb INTEGER DEFAULT 10,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`;

    await db.sql`CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      start_date TEXT NOT NULL,
      end_date TEXT,
      monthly_price DECIMAL(10,2),
      features TEXT, -- JSON string of features
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )`;

    // --- TABLE CREATION ---
    // Execute each CREATE TABLE statement using db.sql
    await db.sql`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT,
      status TEXT DEFAULT 'active',
      organization_id INTEGER,
      class_id INTEGER,
      instructor_id TEXT,
      student_id TEXT,
      course_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(organization_id) REFERENCES organizations(id),
      FOREIGN KEY(class_id) REFERENCES classes(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      organization_id INTEGER,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      batch_id INTEGER,
      organization_id INTEGER,
      FOREIGN KEY(batch_id) REFERENCES batches(id),
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      status TEXT DEFAULT 'active',
      organization_id INTEGER,
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      exam_id INTEGER,
      score INTEGER,
      date TEXT,
      answer TEXT,
      tab_switches INTEGER DEFAULT 0,
      details TEXT,
      explanation TEXT,
      FOREIGN KEY(student_id) REFERENCES users(id)
    )`;
    // Note: The 'relations' table seems redundant given the specific join tables below.
    // Consider removing it if it's not actively used.
    await db.sql`CREATE TABLE IF NOT EXISTS relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      class_id INTEGER,
      instructor_id INTEGER,
      batch_id INTEGER,
      course_id INTEGER
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS class_instructor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      instructor_id INTEGER NOT NULL,
      FOREIGN KEY (class_id) REFERENCES classes(id),
      FOREIGN KEY (instructor_id) REFERENCES users(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS batch_course (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      FOREIGN KEY (batch_id) REFERENCES batches(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS instructor_course (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instructor_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      FOREIGN KEY (instructor_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT,
      course_id INTEGER,
      difficulty TEXT,
      type TEXT,
      answer TEXT,         -- Now stores either JSON array of rows or JSON object with specimens and explanation
      image TEXT,
      points INTEGER,      -- Total points (sum of specimen points + explanation points)
      explanation TEXT,    -- Legacy field for backward compatibility
      explanation_points INTEGER DEFAULT 0,  -- Points specifically for explanation section
      keyword_pool_id INTEGER, -- Reference to keyword pool used for this question
      selected_keywords TEXT, -- JSON array of selected keywords from the pool
      created_by INTEGER,
      organization_id INTEGER,
      created TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(organization_id) REFERENCES organizations(id),
      FOREIGN KEY(keyword_pool_id) REFERENCES keyword_pools(id)
    )`;
    await db.sql`CREATE TABLE IF NOT EXISTS keyword_pools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      keywords TEXT NOT NULL, -- JSON array of keywords
      description TEXT,
      organization_id INTEGER,
      created_by INTEGER,
      created TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(organization_id) REFERENCES organizations(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    )`;

    await db.sql`CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      instructor_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL, -- This might need to be a JSON array or separate table if an exam has multiple questions
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      duration TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      organization_id INTEGER,
      created TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id),
      FOREIGN KEY(class_id) REFERENCES classes(id),
      FOREIGN KEY(instructor_id) REFERENCES users(id),
      FOREIGN KEY(organization_id) REFERENCES organizations(id)
      -- FOREIGN KEY(question_id) REFERENCES questions(id) -- Revisit this relationship if multiple questions per exam
    )`;

    console.log("Database schema initialized successfully.");
  } catch (err) {
    console.error(
      "Error initializing SQLite Cloud database schema:",
      err.message
    );
    // Don't exit in serverless environment - just log the error
    throw err;
  }
}

// Call the async function to initialize the schema
initializeSchema().catch(err => {
  console.error("Database initialization failed:", err);
  // Don't exit in serverless environment - let the function continue
});

module.exports = db;
