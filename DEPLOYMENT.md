# Farmify - Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended - 5 minutes) ✅

1. **Sign up at railway.app** - Free tier available
2. **Connect GitHub** - Link your Farmify repository
3. **Deploy**:
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production deployment setup"
   git push origin main
   ```
4. **Configure Environment Variables**:
   - Go to Railway Dashboard → Your Project → Variables
   - Add:
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=farmify_super_secret_key_2024_prod_@#$%^&*!
     GEMINI_API_KEY=AIzaSyBfVkrZnixZjo4wUkm11emIoegepquZhF4
     ```
5. **Deploy** - Railway auto-deploys on git push
6. **Get Live URL** - Railway provides a public URL instantly

### Option 2: Docker (for any cloud platform)

```bash
# Build Docker image
docker build -t farmify:latest .

# Run locally to test
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_secret_key \
  -e GEMINI_API_KEY=your_gemini_key \
  farmify:latest

# Push to Docker Hub
docker tag farmify:latest your-username/farmify:latest
docker push your-username/farmify:latest
```

Then deploy on:
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

### Option 3: Vercel (Frontend Optimized)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configure environment variables in Vercel Dashboard.

### Option 4: Heroku (Legacy but stable)

```bash
# Install Heroku CLI
# Create Procfile: (already ready)

# Deploy
heroku login
heroku create farmify-app
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
git push heroku main
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated/backed up
- [ ] JWT_SECRET changed to secure random string
- [ ] GEMINI_API_KEY verified and active
- [ ] Uploads directory has proper permissions
- [ ] Health checks passing
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for production domains
- [ ] Error logging enabled
- [ ] Performance monitoring setup

## Post-Deployment

### Monitor the Application
```bash
# Check logs
vercel logs farmify-app

# Or for Railway
railway logs
```

### Test Live Features
1. Visit your live URL
2. Test all 13 features:
   - Advisory loading
   - Marketplace data
   - Mandi prices
   - AI chat
   - Disease predictor
   - Crop recommendations

### Set Custom Domain
- Add your domain in platform dashboard
- Update DNS records
- Enable SSL certificate

## Performance Tips

1. **Enable Caching**:
   - Browser cache for static assets
   - CDN for images and uploads

2. **Database Optimization**:
   - SQLite for small deployments
   - Migrate to PostgreSQL for scale

3. **Monitoring**:
   - Set up error alerts
   - Monitor response times
   - Track API usage

## Support Contacts

- **Railway Support**: https://railway.app/support
- **Vercel Support**: https://vercel.com/help
- **Docker Support**: https://docs.docker.com/

## Environment Variables Reference

```
NODE_ENV=production           # Set to production
PORT=3001                      # App port
JWT_SECRET=<secure_random>    # JWT signing key
JWT_EXPIRES=30d               # Token expiration
GEMINI_API_KEY=<your_key>    # Google Gemini API key
```

Generate secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
