require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Improved CORS configuration to handle redirects
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:4173",
      "https://crimewisesys-yelj.vercel.app",
      "https://crimewisesys.vercel.app",
    ];

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Apply CORS first, before any other middleware
app.use(cors(corsOptions));

// Remove any trailing slashes to prevent redirect CORS issues
app.use((req, res, next) => {
  if (req.path.slice(-1) === "/" && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

app.use(express.json());

// Serve static files from the frontend dist directory FIRST - before any routes
const frontendPath = path.join(__dirname, "../frontend/dist");
console.log("Frontend path:", frontendPath);
console.log("Frontend path exists:", require('fs').existsSync(frontendPath));

// Debug: List files in dist directory
if (require('fs').existsSync(frontendPath)) {
  const files = require('fs').readdirSync(frontendPath);
  console.log("Files in dist:", files);
  const assetsDir = path.join(frontendPath, 'assets');
  if (require('fs').existsSync(assetsDir)) {
    const assetFiles = require('fs').readdirSync(assetsDir);
    console.log("Files in assets:", assetFiles);
  }
}

// Serve static files with proper headers - this must come before ALL other routes
app.use(express.static(frontendPath, {
  setHeaders: (res, path) => {
    console.log("Serving static file:", path);
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Modularized database and routes
let db;
try {
  db = require("./db");
  console.log("Database module loaded successfully");
} catch (err) {
  console.error("Failed to load database module:", err);
  // Create a mock db object to prevent crashes
  db = {
    sql: async () => {
      throw new Error("Database connection failed");
    }
  };
}
const batchesRoutes = require("./routes/batches");
const coursesRoutes = require("./routes/courses");
const classesRoutes = require("./routes/classes");
const instructorsRoutes = require("./routes/instructors");
const studentsRoutes = require("./routes/students");
const usersRoutes = require("./routes/users");
const homeRoutes = require("./routes/home");
const relationsRoutes = require("./routes/relations");
const questionsRouter = require("./routes/questions");
const examsRoutes = require("./routes/exams");
const organizationsRoutes = require("./routes/organizations");
const subscriptionsRoutes = require("./routes/subscriptions");
const chatbotRoutes = require("./routes/chatbot");
const keywordPoolsRoutes = require("./routes/keyword-pools");
const contactRoutes = require("./routes/contact");

// Mount modular routes
app.use("/api/batches", batchesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/instructors", instructorsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/relations", relationsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api", keywordPoolsRoutes);
app.use("/api", questionsRouter);
app.use("/api", contactRoutes);
app.use("/", homeRoutes);

// Explicit route for static assets
app.get('/assets/*', (req, res) => {
  const filePath = path.join(frontendPath, req.path);
  console.log("Attempting to serve asset:", filePath);
  console.log("Asset exists:", require('fs').existsSync(filePath));
  
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log("Asset not found:", filePath);
    res.status(404).send('File not found');
  }
});

// Handle React Router (return `index.html` for non-API routes)
app.get(/^(?!\/api)(?!\/assets).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
