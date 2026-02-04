# KhetBox - Smart Cold Storage Dashboard

## 🚀 Deployment Guide

### Option 1: Deploy Frontend Only to Vercel (Recommended)

The **easiest way** is to deploy **frontend** and **backend separately**:

#### 1. Deploy Backend to Railway/Render
- **Railway** (Recommended): https://railway.app
  - Connect your GitHub repo
  - Select the `backend` folder
  - Add environment variables (MONGO_URL, DB_NAME, CORS_ORIGINS)
  - Deploy ✅
  
#### 2. Deploy Frontend to Vercel
- Go to https://vercel.com
- Import your repo
- **Root Directory**: Set to `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- Add environment variable:
  - `REACT_APP_API_URL` = `https://your-backend.railway.app`
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
