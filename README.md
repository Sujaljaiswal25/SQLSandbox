# 🚀 CipherSQL Sandbox

**Learn SQL interactively with AI-powered hints in your browser**

A modern, full-stack SQL learning platform that provides isolated PostgreSQL environments (workspaces) for practicing SQL queries with real-time AI assistance powered by Google Gemini.

---

## ✨ Features

### 🎯 Core Features

- **Isolated Workspaces** - Each workspace gets its own PostgreSQL schema for safe practice
- **Visual Schema Builder** - Create tables with a beautiful drag-and-drop interface
- **SQL Editor** - Monaco-based editor with syntax highlighting and auto-completion
- **Live Query Execution** - Execute SQL queries and see results instantly
- **AI-Powered Hints** - Get intelligent SQL hints from Google Gemini AI at any learning stage
- **Resizable Panels** - Customize your workspace layout with draggable panels
- **Auto-Save** - Your queries and workspace state are saved automatically

### 🤖 AI Features

- **Context-Aware Hints** - AI understands your schema and current query
- **Beginner Friendly** - Works even without tables, helps you learn basics
- **Error Explanations** - Get helpful hints when queries fail
- **Query Validation** - Ask AI to review your SQL before running it
- **Concept Learning** - Ask about JOINs, aggregate functions, and more

---

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor in the browser
- **Axios** - HTTP client for API calls

### Backend

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **PostgreSQL** - Isolated SQL environments
- **MongoDB** - Workspace metadata storage
- **Google Gemini AI** - AI-powered hints
- **CORS** - Cross-origin support

---

## 📁 Project Structure

```
CipherSQLSandbox/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # React context (state management)
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── configs/        # Database configurations
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Rate limiting, validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (PostgreSQL, LLM)
│   │   ├── utils/          # Helper functions
│   │   └── app.js          # Express app setup
│   ├── server.js           # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database
- **MongoDB** database
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/app/apikey))

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/CipherSQLSandbox.git
cd CipherSQLSandbox
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# PostgreSQL Configuration
DATABASE_URL=postgresql://user:password@host:port/database
# OR use individual variables:
# PG_HOST=localhost
# PG_PORT=5432
# PG_DATABASE=ciphersql_app
# PG_USER=postgres
# PG_PASSWORD=your_password

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Start server:

```bash
npm start
```

Server runs on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🌐 Deployment

### Backend (Render)

1. **Create PostgreSQL Database** (Railway/Render)

   - Get the `DATABASE_PUBLIC_URL`

2. **Deploy to Render**
   - Create new Web Service
   - Connect your GitHub repo
   - Set environment variables:
     ```
     MONGODB_URI=your_mongodb_uri
     PORT=5000
     CLIENT_URL=https://your-frontend-url.vercel.app
     DATABASE_URL=your_postgresql_public_url
     GEMINI_API_KEY=your_api_key
     ```
   - Build command: `npm install`
   - Start command: `node server.js`

### Frontend (Vercel)

1. **Deploy to Vercel**
   - Import GitHub repository
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable:
     ```
     VITE_API_URL=https://your-backend.onrender.com/api
     ```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Workspaces

```http
POST   /workspace              # Create workspace
GET    /workspaces             # Get all workspaces
GET    /workspace/:id          # Get workspace by ID
PUT    /workspace/:id          # Update workspace name
DELETE /workspace/:id          # Delete workspace
```

#### Tables

```http
POST   /workspace/:id/table    # Create table
GET    /workspace/:id/tables   # Get all tables
DELETE /workspace/:id/table/:name  # Delete table
```

#### Queries

```http
POST   /workspace/:id/query    # Execute SQL query
```

#### AI Hints

```http
POST   /hint                   # Get AI hint
```

**Hint Request Body:**

```json
{
  "workspaceId": "workspace_id",
  "query": "SELECT * FROM users", // optional
  "intent": "Find users older than 25", // optional
  "error": {
    // optional
    "type": "SYNTAX_ERROR",
    "message": "error message"
  }
}
```

---

## 🎮 Usage Guide

### 1. Create Workspace

- Click "Create Workspace" on welcome screen
- Enter workspace name
- Your isolated SQL environment is ready!

### 2. Create Tables

**Option A - Visual Builder:**

- Click "Create Table" in left sidebar
- Add table name and columns
- Choose data types (INTEGER, TEXT, VARCHAR, etc.)

**Option B - SQL Query:**

```sql
CREATE TABLE users (
  name TEXT,
  age INTEGER,
  email VARCHAR
);
```

### 3. Execute Queries

Write SQL in the editor:

```sql
-- Insert data
INSERT INTO users (name, age, email)
VALUES ('John Doe', 25, 'john@example.com');

-- Query data
SELECT * FROM users WHERE age > 20;

-- Update data
UPDATE users SET age = 26 WHERE name = 'John Doe';

-- Delete data
DELETE FROM users WHERE age < 18;
```

### 4. Get AI Hints

- Type your question in the hint panel
- Or write a query and ask for help
- Examples:
  - "How do I create a table?"
  - "What is a JOIN?"
  - "Find all users older than 25"

### 5. Customize Layout

- Drag the resize handles between panels
- Adjust editor, results, schema, and hints panels
- Your layout preferences are saved

---

## 🔧 Configuration

### Environment Variables

**Backend (`server/.env`):**
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `PORT` | Server port (default: 5000) | ✅ Yes |
| `CLIENT_URL` | Frontend URL for CORS | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection URL | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |

**Frontend (`client/.env`):**
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ Yes |

---

## 🎯 Features Breakdown

### Workspace Isolation

Each workspace gets:

- Unique PostgreSQL schema (`ws_<workspace_id>`)
- Isolated tables and data
- Independent query execution
- Safe learning environment

### AI Hint System

- **No Tables?** Ask about SQL basics, syntax, concepts
- **With Tables?** Get schema-aware hints for your queries
- **Query Issues?** Get error explanations and fixes
- **Learning?** Ask about JOINs, aggregates, indexes, etc.

### Auto-Save

- Queries saved automatically
- Workspace state persisted
- Resume where you left off
- No manual save needed

---

## 🐛 Troubleshooting

### CORS Error

**Problem:** Frontend can't connect to backend  
**Solution:** Check `CLIENT_URL` in backend `.env` matches your frontend URL exactly (no trailing slash)

### Database Connection Failed

**Problem:** Can't connect to PostgreSQL  
**Solution:**

- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure PostgreSQL is running
- Verify credentials

### AI Hints Not Working

**Problem:** Hints returning errors  
**Solution:**

- Verify `GEMINI_API_KEY` is valid
- Check API quota/limits
- Ensure workspace exists before requesting hints

---

## 📝 Postman Collection

Import `CipherSQL.postman_collection.json` to test all APIs:

- Workspace CRUD operations
- Table creation/deletion
- Query execution
- AI hint generation (6 test scenarios)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Sujal Jaiswal**

- GitHub: [@Sujaljaiswal25](https://github.com/Sujaljaiswal25)

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the hint system
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the SQL editor
- [Railway](https://railway.app/) for PostgreSQL hosting
- [Render](https://render.com/) for backend deployment
- [Vercel](https://vercel.com/) for frontend hosting

---

**Made with ❤️ for SQL learners**
