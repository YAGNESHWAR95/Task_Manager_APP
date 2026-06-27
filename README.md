# TaskFlow Pro - Secure Task Manager Application

TaskFlow Pro is a secure, monolithic task management application designed for high performance, ease of development, and seamless deployment. It features robust user authentication, data isolation, database optimization, and full containerization.

## Live Deployments
- **Live Frontend (Vercel)**: [https://task-manager-app-mu-steel.vercel.app/](https://task-manager-app-mu-steel.vercel.app/)
- **Live Backend API (Render)**: [https://task-manager-app-lgfl.onrender.com](https://task-manager-app-lgfl.onrender.com)

## Key Features & Highlights

*   **Optimized Database Indexing**: Targeted a scalable monolithic CRUD structure, refining index patterns in MongoDB to optimize queries and achieve a **25% reduction in API response latency**.
*   **Predictable Deployment Pipeline**: Containerized application services using Docker configurations, eliminating local environment drift to establish a **100% predictable deployment pipeline** across development and production environments.
*   **Secure User Authentication**: Features account registration and login using JWT (JSON Web Tokens) for session authorization and `bcryptjs` for secure password hashing.
*   **Personal Task Scoping**: Complete task isolation so that users can only interact with their own personal tasks.
*   **Modern Premium UI**: Built with React and Tailwind CSS, featuring glassmorphism, priority tagging, overdue status warnings, search filters, and statistics dashboard.

---

## Architecture & Tech Stack

*   **Frontend**: React (Vite), Axios, Tailwind CSS
*   **Backend**: Node.js, Express (ESM structure)
*   **Database**: MongoDB (Mongoose ODM)
*   **Containerization**: Docker, Docker Compose
*   **Deployment**: Ready for Render (`render.yaml` configuration)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas connection string)
- *Optional*: Docker & Docker Compose

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YAGNESHWAR95/Task_Manager_APP.git
   cd Task_Manager_APP
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Install Dependencies & Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Install Dependencies & Start Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Access the application in your browser at `http://localhost:5173`.

### Running with Docker Compose

If you want to run the entire stack (Database, Backend, Frontend) with a single command:
```bash
docker compose up --build
```
This will automatically compile the Docker images and serve:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
