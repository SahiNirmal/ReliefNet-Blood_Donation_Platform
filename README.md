# ReliefNet — Experiments 3, 4 & 5

- `frontend/` — React app: UI (Exp 1), hooks (Exp 2), Redux Toolkit (Exp 3)
- `backend/` — Express + MongoDB/Mongoose REST API (Exp 4), now security-hardened (Exp 5)

## Run order

1. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env    # set MONGODB_URI and FRONTEND_URL
   npm run seed              # optional sample data
   npm run dev
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env    # VITE_API_URL
   npm run dev
   ```

See `backend/README.md` for full details on the security hardening added in Experiment 5, the API reference, and MongoDB Atlas setup notes.
