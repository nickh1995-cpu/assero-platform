# ASSERO Platform - Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
- Vercel Account
- Supabase Project
- Git Repository

### Environment Variables

Set these in Vercel Dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deployment Steps

1. **Connect Repository**
   ```bash
   # Push to GitHub/GitLab
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import from Git Repository
   - Select "platform" folder as root

3. **Configure Environment**
   - Add Environment Variables
   - Set Build Command: `npm run build`
   - Set Output Directory: `.next`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployment

### Database Setup

1. **Run SQL Scripts in Supabase**
   ```sql
   -- Run these in Supabase SQL Editor:
   -- 1. platform/database/schema.sql
   -- 2. platform/database/saved_valuations_schema.sql
   -- 3. platform/database/dealroom_schema.sql
   ```

2. **Enable RLS Policies**
   - All tables have Row Level Security enabled
   - Policies are automatically applied

### Features Included

✅ **Valuation System**
- Multi-step form wizard
- Real-time validation
- Market context analysis
- PDF export
- Share links

✅ **Dealroom**
- Portfolio management
- Deal pipeline
- Asset allocation
- Performance analytics

✅ **Authentication**
- Sign-in/Sign-up
- Demo account
- Session management
- RLS security

✅ **API Endpoints**
- `/api/valuations` - Save/load valuations
- `/api/export-pdf` - PDF generation
- `/api/dealroom/*` - Dealroom management
- `/api/comparables` - Market data

### Testing

1. **Sign-In Page**: `/sign-in`
2. **Dashboard**: `/dashboard`
3. **Valuation**: `/valuation`
4. **Dealroom**: `/dealroom`

### Troubleshooting

- **Build Errors**: Check import statements
- **Database Errors**: Verify RLS policies
- **Authentication**: Check Supabase configuration
- **API Errors**: Check environment variables

### Support

For issues, check:
- Vercel Function Logs
- Supabase Logs
- Browser Console
- Network Tab
