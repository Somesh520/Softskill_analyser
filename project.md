# CRPC Soft Skill Analyser Platform — Full Project Prompt

## Project Overview
Build a full-stack web platform called **CRPC Soft Skill Analyser** for a college.
It allows an Admin to manage Teachers, Teachers to manage Students and Activities,
and Students to view their semester-wise soft skill performance reports as charts and graphs.

---

## Tech Stack
- **Frontend:** React.js (with React Router, Recharts for graphs)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM) — start on free tier M0
- **Auth:** JWT (access token 15min) + refresh token (7 days) stored in httpOnly cookie
- **File Storage:** Cloudinary free tier (for CSV uploads temporarily) or local multer
- **Password:** bcrypt (salt rounds 10)
- **Queue:** BullMQ + Redis (for CSV processing jobs) — skip Redis initially, use direct processing on free tier
- **Env:** dotenv for all secrets

---

## Roles & Hierarchy

```
Admin (1 per college)
  └── Teacher (assigned by Admin)
        └── Student (assigned by Teacher)
```

- Admin can only see/manage teachers of their own college
- Teacher can only see/manage students assigned to them
- Student can only see their own reports
- `collegeId` is the scope lock — no cross-college data access ever

---

## MongoDB Collections & Schema

### users
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "teacher", "student"] },
  collegeId: ObjectId,         // ref: colleges — all users scoped here
  isActive: { type: Boolean, default: true },
  createdAt: Date,

  // teacher-only
  assignedByAdmin: ObjectId,   // ref: users
  deptName: String,

  // student-only
  assignedByTeacher: ObjectId, // ref: users
  classId: ObjectId,           // ref: classes
  semester: Number,
  rollNo: String
}
```

### colleges
```js
{
  _id: ObjectId,
  name: String,
  code: String,
  adminId: ObjectId,           // ref: users
  createdAt: Date
}
```

### classes
```js
{
  _id: ObjectId,
  name: String,
  dept: String,
  semester: Number,
  academicYear: String,        // e.g. "2024-25"
  collegeId: ObjectId,
  teacherId: ObjectId,         // ref: users
  createdAt: Date
}
```

### activities
```js
{
  _id: ObjectId,
  title: String,
  skillCategory: { type: String, enum: ["communication","teamwork","leadership","presentation","critical_thinking"] },
  classId: ObjectId,
  semester: Number,
  csvUrl: String,              // cloudinary or local path
  status: { type: String, enum: ["pending","processing","processed","failed"] },
  createdAt: Date
}
```

### scores
```js
{
  _id: ObjectId,
  studentId: ObjectId,
  activityId: ObjectId,
  classId: ObjectId,
  semester: Number,
  academicYear: String,
  skillCategory: String,
  score: Number,               // 0–100
  createdAt: Date
}
// Indexes:
// { studentId: 1, semester: 1 }
// { classId: 1, semester: 1 }
```

### reports (pre-computed cache)
```js
{
  _id: ObjectId,
  studentId: ObjectId,
  classId: ObjectId,
  semester: Number,
  academicYear: String,
  data: {
    communication: Number,
    teamwork: Number,
    leadership: Number,
    presentation: Number,
    critical_thinking: Number
  },
  generatedAt: Date
}
```

---

## Folder Structure

```
/backend
  /config
    db.js              # mongoose connect, maxPoolSize: 5
    cloudinary.js
  /models
    User.js
    College.js
    Class.js
    Activity.js
    Score.js
    Report.js
  /middlewares
    auth.js            # verifyToken, requireRole, sameCollege
    upload.js          # multer config
  /controllers
    authController.js
    adminController.js
    teacherController.js
    studentController.js
    reportController.js
  /routes
    auth.js
    admin.js
    teacher.js
    student.js
  /utils
    csvParser.js       # parse CSV → score rows
    reportGenerator.js # aggregate scores → report document
  server.js

/frontend
  /src
    /pages
      Login.jsx
      AdminDashboard.jsx
      TeacherDashboard.jsx
      StudentDashboard.jsx
    /components
      Navbar.jsx
      ProtectedRoute.jsx
      SemesterReport.jsx     # radar/bar chart using Recharts
      ClassReport.jsx        # teacher view — class average charts
      ActivityForm.jsx
      CSVUpload.jsx
    /context
      AuthContext.jsx        # stores user, role, token
    /api
      axiosInstance.js       # base URL + interceptor for JWT refresh
    App.jsx
    main.jsx
```

---

## Auth Flow

### Login → JWT
```
POST /api/auth/login
body: { email, password }
response: { accessToken, user: { id, name, role, collegeId } }
+ httpOnly cookie: refreshToken
```

### Middleware chain on every protected route:
```
verifyToken → requireRole(...roles) → [optional] sameCollege check
```

### Token refresh:
```
POST /api/auth/refresh
reads refreshToken from cookie → returns new accessToken
```

---

## API Routes

### Auth
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Admin routes (requireRole: admin)
```
POST   /api/admin/add-teacher          # create teacher under admin's college
GET    /api/admin/teachers             # list all teachers in college
DELETE /api/admin/teacher/:id          # deactivate teacher
GET    /api/admin/college-report       # full college soft skill overview
```

### Teacher routes (requireRole: teacher)
```
POST   /api/teacher/add-student        # add student to teacher's class
GET    /api/teacher/my-students        # all students assigned to me
POST   /api/teacher/create-class       # create a class
POST   /api/teacher/create-activity    # create activity under a class
POST   /api/teacher/upload-csv/:activityId   # upload CSV → parse → save scores
GET    /api/teacher/class-report/:classId    # class avg report by semester
GET    /api/teacher/classes            # list my classes
```

### Student routes (requireRole: student)
```
GET    /api/student/my-report                    # all semester reports
GET    /api/student/my-report/:semester          # specific semester report
```

---

## CSV Upload Flow
```
Teacher uploads CSV file
  → multer saves temporarily
  → csvParser reads rows: [rollNo, skillCategory, score]
  → match rollNo → studentId in DB
  → batch insert into scores collection (insertMany)
  → call reportGenerator for affected students
  → reportGenerator: aggregate scores by semester → upsert into reports collection
  → delete temp CSV file
  → update activity.status = "processed"
```

### Expected CSV format:
```
rollNo,skillCategory,score
CSE2021001,communication,82
CSE2021001,teamwork,75
CSE2021002,leadership,90
```

---

## Report Generation Logic
```js
// reportGenerator.js
async function generateReport(studentId, semester, academicYear) {
  const scores = await Score.find({ studentId, semester, academicYear });

  const grouped = {};
  scores.forEach(s => {
    if (!grouped[s.skillCategory]) grouped[s.skillCategory] = [];
    grouped[s.skillCategory].push(s.score);
  });

  const avg = {};
  for (const [cat, vals] of Object.entries(grouped)) {
    avg[cat] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  await Report.findOneAndUpdate(
    { studentId, semester, academicYear },
    { data: avg, generatedAt: new Date() },
    { upsert: true }
  );
}
```

---

## Frontend Pages & Charts

### Student Dashboard
- Semester selector (dropdown)
- **Radar chart** — all 5 skill categories for selected semester (Recharts `RadarChart`)
- **Bar chart** — semester-wise comparison across years (Recharts `BarChart`)

### Teacher Dashboard
- Class selector
- **Bar chart** — class average per skill category
- **Line chart** — improvement trend across semesters
- Student list with individual score summary

### Admin Dashboard
- Total teachers, students, activities count cards
- **Bar chart** — college-wide skill averages
- Teacher-wise performance table

---

## Security Rules (implement all)
- Passwords: bcrypt hash, never return in any API response (`.select("-passwordHash")`)
- JWT secret in `.env`, never hardcode
- `collegeId` always injected from `req.user.collegeId` — never trust client-sent collegeId
- Teacher can only add students to classes where `teacherId === req.user._id`
- Student can only fetch reports where `studentId === req.user._id`
- Rate limit login route: max 10 requests per 15 min per IP (`express-rate-limit`)
- Sanitize all inputs with `express-validator`
- Use parameterized queries only (Mongoose handles this)
- CORS: allow only frontend origin

---

## Environment Variables (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/crpc
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:5173
```

---

## MongoDB Connection (free tier safe)
```js
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

## Scale Path (post-funding)
- MongoDB M0 (free) → M10 ($57/mo): add read replica, increase pool size to 20
- Add Redis (Upstash) for report caching and session store
- Add BullMQ for async CSV processing queue
- Add indexes on `scores` for `academicYear` partitioning
- Move to M30 for 20K+ students

---

## Important Rules for Code Generation
1. Always scope queries with `collegeId` from JWT — never from request body
2. Never return `passwordHash` in any response
3. Reports are always read from `reports` collection — never run live aggregations on `scores` for student-facing routes
4. CSV processing must be synchronous on free tier (no queue) — add queue later
5. All chart data must come from `/api/student/my-report` or `/api/teacher/class-report` endpoints only
6. Use `async/await` with try/catch on every controller
7. Return consistent response shape: `{ success: true, data: {} }` or `{ success: false, message: "" }`