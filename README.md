# KhetBox - Smart Cold Storage Dashboard

## 🚀 Deployment Guide

### Option 1: Deploy Backend on Render and Frontend on Vercel

The cleanest setup is to deploy the **backend** and **frontend** as two separate services:

#### 1. Deploy Backend to Render
- **Render**: https://render.com
   - Create a new Web Service from this repo
   - Use [render.yaml](render.yaml) or set the root directory to `backend`
   - Render will run the backend using the Python build path defined in [render.yaml](render.yaml)
   - Add environment variables: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`
   - Deploy ✅

#### 2. Deploy Frontend to Vercel
- Go to https://vercel.com
- Import the same repo as a separate project
- **Root Directory**: set to `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- Add environment variable:
   - `REACT_APP_BACKEND_URL` = `https://your-backend.onrender.com`
- Deploy ✅

### Option 2: Deploy Backend to Vercel

If you must use Vercel for backend:

1. **Deploy from the `backend` folder**:
   ```bash
   cd backend
   vercel
   ```

2. **Add Environment Variables in Vercel Dashboard**:
   - `MONGO_URL` = Your MongoDB Atlas connection string
   - `DB_NAME` = `khetbox_production`
   - `CORS_ORIGINS` = `*`

3. **Limitations**:
   - ⚠️ WebSockets won't work (real-time updates disabled)
   - ⚠️ Cold starts may cause delays

## 📦 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=khetbox_production
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```
