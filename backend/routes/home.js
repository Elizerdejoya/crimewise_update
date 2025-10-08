const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { authenticateToken, addOrganizationFilter } = require("../middleware");
const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Home/test endpoint: show tables, endpoints, and test forms
// router.get('/', async (req, res) => {
//   try {
//     const tables = await db.sql`SELECT name FROM sqlite_master WHERE type='table'`;
//     const endpoints = [
//       { method: 'GET', path: '/api/batches' },
//       { method: 'POST', path: '/api/batches' },
//       { method: 'PUT', path: '/api/batches/:id' },
//       { method: 'DELETE', path: '/api/batches/:id' },
//       { method: 'GET', path: '/api/courses' },
//       { method: 'POST', path: '/api/courses' },
//       { method: 'PUT', path: '/api/courses/:id' },
//       { method: 'DELETE', path: '/api/courses/:id' },
//       { method: 'GET', path: '/api/classes' },
//       { method: 'POST', path: '/api/classes' },
//       { method: 'PUT', path: '/api/classes/:id' },
//       { method: 'DELETE', path: '/api/classes/:id' },
//       { method: 'GET', path: '/api/instructors' },
//       { method: 'POST', path: '/api/instructors' },
//       { method: 'PUT', path: '/api/instructors/:id' },
//       { method: 'DELETE', path: '/api/instructors/:id' },
//       { method: 'GET', path: '/api/students/full' },
//       { method: 'POST', path: '/api/students' },
//       { method: 'PUT', path: '/api/students/:id' },
//       { method: 'DELETE', path: '/api/students/:id' },
//       { method: 'GET', path: '/api/users' },
//       { method: 'PUT', path: '/api/users/:id/status' },
//       { method: 'DELETE', path: '/api/users/:id' },
//     ];
//     res.send(`
//       <html>
//         <head>
//           <title>CrimeWiseSys API Test</title>
//           <style>
//             body { font-family: sans-serif; margin: 2rem; }
//             h2 { margin-top: 2rem; }
//             table { border-collapse: collapse; margin-bottom: 2rem; }
//             th, td { border: 1px solid #ccc; padding: 0.5rem 1rem; }
//             form { margin-bottom: 1.5rem; }
//             input, select { margin: 0.2rem 0.5rem 0.2rem 0; }
//             .success { color: green; }
//             .error { color: red; }
//           </style>
//         </head>
//         <body>
//           <h1>CrimeWiseSys API Test &amp; Info</h1>
//           <h2>SQLite Tables</h2>
//           <ul>
//             ${(tables||[]).map(t => `<li>${t.name}</li>`).join('')}
//           </ul>
//           <h2>API Endpoints</h2>
//           <table><tr><th>Method</th><th>Path</th></tr>
//             ${endpoints.map(e => `<tr><td>${e.method}</td><td>${e.path}</td></tr>`).join('')}
//           </table>
//           <h2>Test: GET /api/batches</h2>
//           <form onsubmit="event.preventDefault(); fetch('/api/batches').then(r=>r.json()).then(d=>{document.getElementById('batches-result').textContent=JSON.stringify(d,null,2)}).catch(e=>{document.getElementById('batches-result').textContent=e})">
//             <button type="submit">Fetch Batches</button>
//           </form>
//           <pre id="batches-result" style="background:#f6f6f6;padding:1em;"></pre>
//           <h2>Test: POST /api/batches</h2>
//           <form id="add-batch-form" onsubmit="event.preventDefault(); var f=this; fetch('/api/batches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name.value,startDate:f.startDate.value,endDate:f.endDate.value,status:f.status.value})}).then(r=>r.json()).then(d=>{document.getElementById('add-batch-result').textContent=JSON.stringify(d,null,2)}).catch(e=>{document.getElementById('add-batch-result').textContent=e})">
//             <input name="name" placeholder="Batch Name" required />
//             <input name="startDate" placeholder="Start Date" required />
//             <input name="endDate" placeholder="End Date" required />
//             <select name="status"><option>Active</option><option>Inactive</option></select>
//             <button type="submit">Add Batch</button>
//           </form>
//           <pre id="add-batch-result" style="background:#f6f6f6;padding:1em;"></pre>
//         </body>
//       </html>
//     `);
//   } catch (err) {
//     console.log('[HOME][GET] Error:', err.message);
//     res.status(500).send(`Error: ${err.message}`);
//   }
// });

// Admin overview counts
router.get(
  "/api/admin/overview-counts",
  authenticateToken,
  addOrganizationFilter(),
  async (req, res) => {
    try {
      const orgFilter = req.getOrgFilter();

      let queries;
      if (orgFilter.hasFilter) {
        // Organization-specific counts for non-super_admin users
        queries = [
          db.sql`SELECT COUNT(*) as count FROM batches WHERE organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM classes WHERE organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM users WHERE role = 'instructor' AND organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM courses WHERE organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM questions WHERE organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM results r JOIN users u ON r.student_id = u.id WHERE u.organization_id = ${orgFilter.organizationId}`,
          db.sql`SELECT COUNT(*) as count FROM users WHERE organization_id = ${orgFilter.organizationId}`,
        ];
      } else {
        // Global counts for super_admin
        queries = [
          db.sql`SELECT COUNT(*) as count FROM batches`,
          db.sql`SELECT COUNT(*) as count FROM classes`,
          db.sql`SELECT COUNT(*) as count FROM users WHERE role = 'instructor'`,
          db.sql`SELECT COUNT(*) as count FROM users WHERE role = 'student'`,
          db.sql`SELECT COUNT(*) as count FROM courses`,
          db.sql`SELECT COUNT(*) as count FROM questions`,
          db.sql`SELECT COUNT(*) as count FROM results`,
          db.sql`SELECT COUNT(*) as count FROM users`,
        ];
      }

      // Execute all queries in parallel using Promise.all
      const [
        batches,
        classes,
        instructors,
        students,
        courses,
        questions,
        results,
        users,
      ] = await Promise.all(queries);

      // Format the response
      const counts = {
        batches: batches[0]?.count || 0,
        classes: classes[0]?.count || 0,
        instructors: instructors[0]?.count || 0,
        students: students[0]?.count || 0,
        courses: courses[0]?.count || 0,
        questions: questions[0]?.count || 0,
        results: results[0]?.count || 0,
        users: users[0]?.count || 0,
      };

      res.json(counts);
    } catch (err) {
      console.log("[HOME][COUNTS] Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin recent exams endpoint
router.get(
  "/api/admin/recent-exams",
  authenticateToken,
  addOrganizationFilter(),
  async (req, res) => {
    try {
      const orgFilter = req.getOrgFilter();
      const { limit = 10 } = req.query;

      let query;
      if (orgFilter.hasFilter) {
        // Organization-specific recent exams
        query = await db.sql`
        SELECT 
          e.*,
          COUNT(r.id) as participants,
          CASE 
            WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.score), 2)
            ELSE NULL 
          END as avgScore,
          q.points as totalItemScore,
          q.type as question_type,
          q.answer as answer_key,
          q.title as question_title,
          q.text as question_text,
          u.name as instructor_name
        FROM exams e
        JOIN users u ON e.instructor_id = u.id
        LEFT JOIN results r ON e.id = r.exam_id
        LEFT JOIN questions q ON e.question_id = q.id
        WHERE u.organization_id = ${orgFilter.organizationId}
          AND e.start <= datetime('now')
        GROUP BY e.id, q.id
        ORDER BY e.start DESC
        LIMIT ${parseInt(limit)}
      `;
      } else {
        // Global recent exams for super_admin
        query = await db.sql`
        SELECT 
          e.*,
          COUNT(r.id) as participants,
          CASE 
            WHEN COUNT(r.id) > 0 THEN ROUND(AVG(r.score), 2)
            ELSE NULL 
          END as avgScore,
          q.points as totalItemScore,
          q.type as question_type,
          q.answer as answer_key,
          q.title as question_title,
          q.text as question_text,
          u.name as instructor_name
        FROM exams e
        JOIN users u ON e.instructor_id = u.id
        LEFT JOIN results r ON e.id = r.exam_id
        LEFT JOIN questions q ON e.question_id = q.id
        WHERE e.start <= datetime('now')
        GROUP BY e.id, q.id
        ORDER BY e.start DESC
        LIMIT ${parseInt(limit)}
      `;
      }

      res.json(query);
    } catch (err) {
      console.log("[HOME][RECENT-EXAMS] Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Login endpoint
router.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log(`[LOGIN] Attempt: email=${email}, role=${role}`);

    if (!email || !password || !role)
      return res.status(400).json({ error: "Missing fields" });

    // For super_admin, don't check organization
    if (role === "super_admin") {
      const users =
        await db.sql`SELECT * FROM users WHERE email = ${email} AND role = ${role}`;

      if (!users || users.length === 0) {
        console.log(`[LOGIN] Super admin not found: ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = users[0];

      if (password !== user.password) {
        console.log(`[LOGIN] Super admin password mismatch: ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: typeof user.id === "string" ? parseInt(user.id, 10) : user.id,
          email: user.email,
          role: user.role,
        },
        SECRET,
        { expiresIn: "1h" }
      );

      console.log(`[LOGIN] Super admin login successful: ${email}`);
      res.json({ token, role: user.role });
      return;
    }

    // For other roles, check organization
    console.log(
      `[LOGIN] Looking up organization user: ${email}, role: ${role}`
    );
    const users = await db.sql`
      SELECT u.*, o.name as organization_name, o.status as org_status 
      FROM users u 
      LEFT JOIN organizations o ON u.organization_id = o.id 
      WHERE u.email = ${email} AND u.role = ${role}
    `;

    console.log(`[LOGIN] Query result count: ${users?.length || 0}`);
    if (users && users.length > 0) {
      console.log(
        `[LOGIN] Found user: ID=${users[0].id}, org_id=${users[0].organization_id}, org_status=${users[0].org_status}`
      );
    }

    if (!users || users.length === 0) {
      console.log(
        `[LOGIN] Organization user not found: ${email}, role: ${role}`
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    if (password !== user.password) {
      console.log(`[LOGIN] Organization user password mismatch: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if organization is active
    if (user.org_status !== "active") {
      console.log(
        `[LOGIN] Organization inactive: ${user.organization_name}, status: ${user.org_status}`
      );
      return res
        .status(403)
        .json({ error: "Organization account is inactive" });
    }

    const token = jwt.sign(
      {
        id: typeof user.id === "string" ? parseInt(user.id, 10) : user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: user.organization_name,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    console.log(
      `[LOGIN] Organization user login successful: ${email}, org: ${user.organization_name}`
    );
    res.json({
      token,
      role: user.role,
      organization_id: user.organization_id,
      organization_name: user.organization_name,
    });
  } catch (err) {
    console.log("[HOME][LOGIN] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
