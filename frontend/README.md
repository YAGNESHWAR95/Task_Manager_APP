# TaskFlow Pro - React Frontend Client

This is the React-based client web application for TaskFlow Pro, designed with a premium, responsive interface panel, glassmorphic card elements, and live data synchronization.

## Features & Highlights

*   **Responsive User Statistics**: Real-time task dashboard showcasing completed, pending, total tasks, and a dynamic progress completion rate bar.
*   **Intuitive Task Controls**: Allows sorting tasks (by newest, oldest, due date, or priority) and advanced filtering (by status, priority, and debounced text search).
*   **Persistent Auth Portal**: Complete login and signup views integrated with `localStorage` for session token preservation.
*   **Axios Request Interceptor**: Automatically attaches the `Authorization: Bearer <token>` header to all outgoing requests and catches `401 Unauthorized` responses to clear expired credentials and force safe logout redirects.

---

## Technical Stack

*   **Framework**: React (v19)
*   **Build Tooling**: Vite (v7)
*   **Styling**: Tailwind CSS (Utility-first framework)
*   **Request Client**: Axios (REST API calls)

---

## Folder Structure

```
frontend/
├── public/                 # Static assets
└── src/
    ├── assets/             # SVGs and static media
    ├── components/
    │   ├── Auth.jsx        # Login & Signup Form views
    │   └── TaskItem.jsx    # Individual Task Item (edit, complete, delete)
    ├── App.jsx             # Main Application hub (State, Dashboard, Header)
    ├── index.css           # Core styling index
    └── main.jsx            # React root injection point
```

---

## Setup & Local Development

### Prerequisites
- Node.js (v18+)
- Backend service running locally (on port `5000`) or deployed on the cloud.

### Steps to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional)**
   Create a `.env` file in this directory to override the live deployment API URL during local debugging:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to access the application.

4. **Production Build**
   To build the production-ready assets (dist folder):
   ```bash
   npm run build
   ```
