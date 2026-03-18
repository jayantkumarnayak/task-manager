# Deployment Guide

Complete step-by-step instructions for deploying Task Manager to production.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Git repository is initialized and all code is committed
- [ ] Environment variables are configured (never commit `.env.local`)
- [ ] Production database is set up (MongoDB Atlas)
- [ ] JWT_SECRET is changed to a secure random value
- [ ] Application builds successfully: `npm run build`
- [ ] All tests pass and features work locally
- [ ] `.gitignore` includes `.env.local`, `.next/`, `node_modules/`
- [ ] README.md is complete with setup instructions

## Option 1: Deploy to Vercel (Recommended)

Vercel is the optimal choice for Next.js applications. It provides:
- Automatic deployments from Git
- Built-in CI/CD pipeline
- Environment variable management
- Worldwide CDN
- Serverless Functions
- Free tier available

### Steps:

1. **Push code to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/task-manager.git
   git branch -M main
   git push -u origin main
   ```

2. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up (GitHub, GitLab, or Bitbucket account recommended)
   - Authorize Vercel to access your repositories

3. **Import Project**
   - Click "Add New" → "Project"
   - Select the task-manager repository
   - Vercel auto-detects Next.js configuration

4. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following variables:
     ```
     MONGODB_URI = your_production_mongodb_uri
     JWT_SECRET = your_secure_jwt_secret_key_minimum_32_characters_change_this
     NODE_ENV = production
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)
   - Once complete, you'll receive a live URL

6. **Custom Domain (Optional)**
   - In Vercel Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

7. **Automatic Deployments**
   - Every push to `main` branch automatically deploys
   - Configure deployment branch in Settings

### Production MongoDB Setup

If not already done:

1. **MongoDB Atlas Configuration**
   - Visit [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create account
   - Create cluster
   - Get connection string
   - Add Vercel IP to IP Whitelist (Vercel will show which one)

2. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
   ```

### Verify Deployment

```bash
# Test your deployed application
curl https://your-vercel-app.vercel.app/api/auth/verify

# Should return 401 (unauthorized) - expected without token
```

---

## Option 2: Deploy to Railway

Railway is user-friendly with generous free tier for developers.

### Steps:

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select task-manager repo

3. **Configure New Service**
   - Select Node.js
   - Railway auto-detects Next.js

4. **Add MongoDB Plugin**
   - Click "Add Service"
   - Select "Database" → "MongoDB"
   - Get connection string from Railway dashboard

5. **Environment Variables**
   - Right-click service → Variables
   - Add:
     ```
     DATABASE_URL = mongodb://... (Railway provides this)
     JWT_SECRET = your_secure_jwt_secret
     NODE_ENV = production
     ```
   - OR use MongoDB service connection string as `MONGODB_URI`

6. **Domain Setup**
   - Railway assigns a `railway.app` subdomain
   - Click "Settings" → "Domain" for custom domain
   - Optional: Connect custom domain

### Deploy

```bash
# Using Railway CLI
railway login
railway link
railway up
```

---

## Option 3: Deploy to Render

Render has good performance and simple deployment.

### Steps:

1. **Create Render Account**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub account
   - Select task-manager repository

3. **Configure Service**
   - **Name**: task-manager
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (sufficient for this project)

4. **Environment Variables**
   ```
   MONGODB_URI = your_mongodb_connection_string
   JWT_SECRET = your_secure_jwt_secret
   NODE_ENV = production
   ```

5. **Add MongoDB (if needed)**
   - Create MongoDB Atlas cluster
   - Get connection string
   - Add as MONGODB_URI variable

6. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on Git push to main branch

### Custom Domain

- Settings → Custom Domains
- Add your domain
- Update DNS records as shown

---

## Option 4: Deploy via Docker (AWS, DigitalOcean, etc.)

For more control and scalability.

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Create .dockerignore

```
node_modules
.git
.next
.env.local
.gitignore
README.md
```

### Build and Run Locally

```bash
# Build image
docker build -t task-manager:latest .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e NODE_ENV="production" \
  task-manager:latest
```

### Deploy to Cloud Providers

#### AWS EC2
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pull and run
sudo docker run -d -p 80:3000 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  task-manager:latest
```

#### DigitalOcean App Platform
1. Create DigitalOcean account
2. Push Docker image to Docker Hub
3. Connect in DigitalOcean App Platform
4. Set environment variables
5. Deploy

---

## Post-Deployment Steps

### 1. Test All Features

```bash
# Test registration
curl -X POST https://your-app.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test login
curl -X POST https://your-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test task creation (with token from login)
curl -X POST https://your-app.com/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<your_token>" \
  -d '{"title":"Test task"}'
```

### 2. Monitor Logs

**Vercel:**
- Dashboard → Deployments → Logs

**Railway:**
- Project → Deployments → Logs

**Render:**
- Service → Logs

### 3. Set Up Database Backups

**MongoDB Atlas:**
1. Go to Backup settings
2. Enable automatic backups (daily recommended)
3. Configure retention policy

### 4. Enable HTTPS

Automatically handled by:
- Vercel ✅
- Railway ✅
- Render ✅

Manual setup for Docker:
- Use nginx as reverse proxy
- Let's Encrypt for SSL certificates
- Certbot for auto-renewal

### 5. Monitor Performance

- Check response times in deployment dashboard
- Monitor database query performance
- Set up error alerting

### 6. Update DNS Records (Custom Domain)

**For custom domain:**
1. Get deployment's IP or CNAME
2. Update DNS records at domain registrar
3. Wait for DNS propagation (up to 48 hours)

---

## Troubleshooting

### Build Fails on Deployment

**Check:**
- Environment variables are set correctly
- MongoDB URI is accessible from deployment region
- Node.js version compatibility
- Build logs for specific errors

**Solution:**
```bash
# Test build locally
npm run build
npm start
```

### "MONGODB_URI is not defined"

**Solution:**
- Verify environment variable is set in deployment dashboard
- Ensure no typos
- Restart deployment after updating variables

### Port Already in Use

**Local development:**
```bash
# Use different port
PORT=3001 npm run dev
```

**Production (shouldn't happen):**
- Verify no other services running on port 3000
- Check deployment provider logs

### Cookies Not Working

**Check:**
- Application is using HTTPS (required for Secure flag)
- Development is using HTTP (ok on localhost)
- SameSite cookie policy is correct

### Database Connection Timeout

**Check:**
- MongoDB URI is correct
- Database is running and accessible
- IP whitelist includes deployment provider's IPs
- Network connectivity

---

## Performance Optimization for Production

### 1. Environment Variables

```env
# Use secure values
JWT_SECRET=your_long_secure_random_string_minimum_32_chars
NODE_ENV=production
```

### 2. Database Optimization

```javascript
// Ensure indexes are created
db.users.createIndex({ email: 1 }, { unique: true })
db.tasks.createIndex({ userId: 1, createdAt: -1 })
db.tasks.createIndex({ userId: 1, status: 1 })
```

### 3. Enable Caching

In production, consider:
- Browser caching for static assets
- Database query caching for frequently accessed data
- Redis for session management (future enhancement)

### 4. Monitor Metrics

- Page load times
- API response times
- Database query performance
- Error rates
- User engagement metrics

---

## Rollback Procedure

### Vercel
- Deployments → Previous deployment → Click "Redeploy"

### Railway
- Environment → Deployments → Select previous → "Rollback"

### Render
- Deployments → Select previous → "Deploy"

---

## Security Checklist for Production

- [ ] JWT_SECRET is strong (32+ characters, random)
- [ ] MONGODB_URI is kept secret
- [ ] HTTPS is enforced (automatic for Vercel, Railway, Render)
- [ ] Environment variables not committed to Git
- [ ] Database has authentication enabled
- [ ] Database backups are configured
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting is considered (future enhancement)
- [ ] CORS is properly configured if needed

---

## Scale Your Application

When ready to scale:

1. **Database**
   - MongoDB Atlas: Scale cluster tier
   - Add read replicas for high traffic

2. **Caching**
   - Add Redis for session/data caching
   - Implement query result caching

3. **CDN**
   - Vercel provides automatic global CDN
   - CloudFlare for custom domains

4. **API Optimization**
   - Add request rate limiting
   - Implement request throttling
   - Cache frequently accessed data

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Add performance monitoring (LogRocket)
   - Set up alerts for critical errors

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://railway.app/docs
- **Render Docs**: https://render.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Docker**: https://docs.docker.com

---

## Estimated Deployment Time

- **Vercel**: 5-10 minutes
- **Railway**: 10-15 minutes
- **Render**: 10-15 minutes
- **Docker/Manual**: 30-60 minutes

Choose Vercel for the quickest deployment with optimal Next.js support!
