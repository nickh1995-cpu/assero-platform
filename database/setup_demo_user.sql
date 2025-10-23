-- ASSERO DEMO USER SETUP
-- Creates a demo user for testing the Dealroom functionality

-- ==============================================
-- DEMO USER CREATION
-- ==============================================

-- Note: This script should be run in Supabase SQL Editor
-- It creates a demo user that can be used for testing

-- Create demo user (this will be handled by Supabase Auth)
-- The user will be created through the sign-up process

-- ==============================================
-- DEMO USER DATA
-- ==============================================

-- Demo user credentials:
-- Email: demo@assero.com
-- Password: demo123

-- This user will be created when they sign up through the application
-- The RLS policies will automatically apply to this user

-- ==============================================
-- TESTING INSTRUCTIONS
-- ==============================================

/*
To test the Dealroom:

1. Go to http://localhost:3000/sign-in
2. Click "Use Demo Account" button
3. This will fill in demo@assero.com and demo123
4. Click "Sign in" (this will create the user if they don't exist)
5. You'll be redirected to /dashboard
6. Go to http://localhost:3000/dealroom
7. Click "📊 Sample Data" button
8. The sample data will be created for your user

The authentication flow:
- Sign-in page → Authentication → Dashboard/Dealroom
- Sample Data API → Authenticated User → Database Insert
- RLS policies ensure user can only see their own data
*/
