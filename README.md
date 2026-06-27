# CRPC Soft Skill Analyser Platform

The **CRPC Soft Skill Analyser Platform** is a full-stack web application designed to track, manage, and visualize the soft-skill development of students across an educational institution. It implements a multi-tenant, role-based architecture allowing Admins, Teachers, and Students to interact with secure and customized dashboards.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Strict security boundaries. Admins manage teachers, Teachers manage students & activities, Students view their reports.
*   **Multi-Tenant Architecture:** Built with `collegeId` scoping to guarantee data isolation across different colleges.
*   **Asynchronous CSV Processing:** Teachers can upload raw CSV datasets for soft skill activities, which are automatically parsed and inserted into the database.
*   **Automated Analytics Generation:** A background report generator pre-computes semantic analytics (averages for Communication, Teamwork, Leadership, etc.) and caches them for fast dashboard rendering.
*   **Dynamic Visual Dashboards:** Rich, interactive charts (Radar Charts, Bar Charts, Line Charts) built with Recharts.
*   **Secure Authentication:** JWT-based system utilizing short-lived access tokens and secure, `httpOnly` refresh tokens.
*   **Cloud Integrations:** File storage ready for Cloudinary/Multer (for CSV processing).

---

## 🏗️ System Architecture

The following diagram illustrates the high-level architecture, showing how different components of the system interact with each other.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend ["Frontend (React + Vite)"]
        A1[Admin Dashboard]
        A2[Teacher Dashboard]
        A3[Student Dashboard]
        API_Layer[Axios API Client + Interceptors]
    end

    %% Backend Layer
    subgraph Backend ["Backend (Node.js + Express)"]
        R[Express Router]
        M[Auth & Upload Middlewares]
        C[Controllers]
        S[Business Logic / Services]
        U[CSV Parser & Report Generator]
    end

    %% Database Layer
    subgraph Database ["Database (MongoDB)"]
        D_Users[(Users)]
        D_Colleges[(Colleges)]
        D_Classes[(Classes)]
        D_Activities[(Activities)]
        D_Scores[(Scores)]
        D_Reports[(Reports Cache)]
    end

    %% Flow connections
    A1 -->|JWT Secured HTTP| API_Layer
    A2 -->|JWT Secured HTTP| API_Layer
    A3 -->|JWT Secured HTTP| API_Layer

    API_Layer -->|REST API Requests| R
    R --> M
    M --> C
    C --> S
    S --> U
    S <--> Database
    U <--> Database
```

---

## 🔐 Role Hierarchy & Authentication Flow

Data isolation is guaranteed at the API level by injecting the validated `collegeId` from the JWT into every database query, ensuring users can never request cross-college data.

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant S as Server (Express)
    participant DB as MongoDB

    C->>S: POST /api/auth/login (Email, Password)
    S->>DB: Find User by Email
    DB-->>S: User Document (including Role, collegeId)
    S->>S: Validate Password (bcrypt)
    S->>C: Return AccessToken (JSON) + Set-Cookie (httpOnly RefreshToken)
    
    Note over C,S: Subsequent Protected Request
    C->>S: GET /api/student/my-report (Header: Bearer AccessToken)
    S->>S: Middleware: Verify JWT & extract user payload
    S->>S: Middleware: Verify Role (student)
    S->>DB: Query `reports` where studentId = payload._id
    DB-->>S: Return Pre-computed Analytics
    S-->>C: JSON Response containing Chart Data
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    COLLEGE ||--o{ USER : "has many (Admins/Teachers)"
    USER ||--o{ COURSE_CLASS : "teaches"
    COURSE_CLASS ||--o{ USER : "contains (Students)"
    COURSE_CLASS ||--o{ ACTIVITY : "has"
    ACTIVITY ||--o{ SCORE : "generates"
    USER ||--o{ SCORE : "receives"
    USER ||--o{ REPORT : "has cached"

    USER {
        ObjectId _id
        String name
        String role "admin, teacher, student"
        ObjectId collegeId
    }
    ACTIVITY {
        ObjectId _id
        String title
        String skillCategory
        String status "pending, processed"
    }
    SCORE {
        ObjectId _id
        ObjectId studentId
        Number score "0-100"
    }
```

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, React Router, Recharts, Vite, Axios
*   **Backend:** Node.js, Express.js, JWT, Bcrypt, Multer (File Uploads)
*   **Database:** MongoDB, Mongoose ODM
*   **Environment:** Dotenv for variable management

## 📦 Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    *   Navigate to `/Backend` and run `npm install`.
    *   Navigate to `/Frontend` and run `npm install`.
3.  **Environment Setup:** Create a `.env` file in the Backend directory matching the configuration required (Database URI, JWT Secrets, Cloudinary keys).
4.  **Run Locally:**
    *   Backend: `npm run dev` (or node server)
    *   Frontend: `npm run dev`

---

## 🌐 API Reference (Backend Routes & Services)

The backend provides RESTful APIs segmented by user role. All protected routes require a valid `Bearer Token` and automatically enforce `collegeId` scoping.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/login` | Authenticates a user (Admin/Teacher/Student), returns a short-lived JWT access token and sets an `httpOnly` refresh token. |
| `POST` | `/refresh` | Reads the `httpOnly` refresh token and issues a new JWT access token without requiring re-login. |
| `POST` | `/logout` | Clears the refresh token cookie and ends the user session. |

### Admin Routes (`/api/admin`) - *Requires Admin Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/add-teacher` | Creates a new teacher account mapped strictly to the Admin's `collegeId`. |
| `GET`  | `/teachers` | Retrieves a list of all teachers currently registered under the Admin's college. |
| `DELETE`| `/teacher/:id` | Deactivates or removes a teacher account. |
| `GET`  | `/college-report` | Aggregates all soft skill data across the college for high-level admin dashboard analytics. |

### Teacher Routes (`/api/teacher`) - *Requires Teacher Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/create-class` | Initializes a new class (e.g., "CSE 2nd Year") under the teacher. |
| `POST` | `/add-student` | Registers a student and assigns them to the teacher's class. |
| `GET`  | `/my-students` | Fetches the roster of students assigned to the authenticated teacher. |
| `GET`  | `/classes` | Retrieves a list of all classes managed by the teacher. |
| `POST` | `/create-activity` | Creates a soft skill activity (e.g., "Mock Interview") linked to a specific class. |
| `POST` | `/upload-csv/:activityId` | Accepts a CSV file, parses scores, maps them to students, triggers report caching, and saves them to the DB. |
| `GET`  | `/class-report/:classId` | Retrieves aggregated performance averages for an entire class to display on the teacher's charts. |

### Student Routes (`/api/student`) - *Requires Student Role*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`  | `/my-report` | Retrieves the pre-computed soft skill analytics (Communication, Leadership, etc.) for the logged-in student across all semesters. |
| `GET`  | `/my-report/:semester` | Retrieves the report specific to a single semester for targeted visualization (Radar Charts). |

---

## 🖥️ Frontend Endpoints & Pages

The frontend application uses React Router to manage views based on authentication state and user roles.

| Route | Component/Page | Functionality |
| :--- | :--- | :--- |
| `/login` | `Login.jsx` | Public login page. Redirects users to their respective dashboards based on their RBAC role upon success. |
| `/admin` | `AdminDashboard.jsx` | Overview of college statistics, teacher management, and college-wide skill averages. |
| `/teacher` | `TeacherDashboard.jsx` | Management hub for teachers to view classes, add students, upload CSVs, and view class-level analytics. |
| `/student` | `StudentDashboard.jsx` | Personalized student view featuring Recharts (Radar/Bar) to visualize their own soft skill progression. |
| `/*` (Protected) | `ProtectedRoute.jsx` | A wrapper component that verifies JWT validity and role authorization before rendering internal pages. |
