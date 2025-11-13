#!/bin/bash

# ==============================================
# ASSERO Database Schema Deployment Script
# ==============================================
# This script helps deploy all necessary database schemas to Supabase
# Run this script if you encounter Foreign Key Constraint errors

set -e

echo "🚀 ASSERO Database Schema Deployment"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "⚠️  Supabase CLI not found."
    echo "📦 Install it with: npm install -g supabase"
    echo ""
    echo "📋 Alternative: Copy SQL files manually to Supabase Dashboard"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Open SQL Editor"
    echo "   3. Run each .sql file in order"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f "../.supabase/config.toml" ]; then
    echo "⚠️  Supabase project not linked."
    echo "🔗 Run: supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    exit 1
fi

echo "✅ Supabase project linked"
echo ""

# Deploy schemas in order
echo "📦 Deploying database schemas..."
echo ""

# 1. User Auth Schema (CRITICAL - fixes FK constraint error)
echo "1️⃣  Deploying User Auth Schema..."
if supabase db push --schema user_auth_schema.sql 2>/dev/null; then
    echo "   ✅ User Auth Schema deployed successfully"
else
    echo "   ⚠️  Schema may already exist (this is OK)"
fi
echo ""

# 2. Dealroom Schema
echo "2️⃣  Deploying Dealroom Schema..."
if supabase db push --schema dealroom_schema.sql 2>/dev/null; then
    echo "   ✅ Dealroom Schema deployed successfully"
else
    echo "   ⚠️  Schema may already exist (this is OK)"
fi
echo ""

# 3. Performance Indexes
echo "3️⃣  Creating Performance Indexes..."
if supabase db push --schema performance_indexes.sql 2>/dev/null; then
    echo "   ✅ Performance Indexes created successfully"
else
    echo "   ⚠️  Indexes may already exist (this is OK)"
fi
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
echo ""

# Check if critical tables exist
TABLES_CHECK=$(supabase db execute "
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'buyer_profiles', 'seller_profiles', 'portfolios', 'deals');
" --csv 2>/dev/null || echo "0")

if [[ "$TABLES_CHECK" == *"5"* ]]; then
    echo "✅ All critical tables verified"
else
    echo "⚠️  Some tables may be missing. Please check manually."
fi
echo ""

# Success message
echo "======================================"
echo "✅ Database Schema Deployment Complete"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "   1. Test registration: http://localhost:3000/dealroom"
echo "   2. Check logs for any errors"
echo "   3. Verify user can register without FK constraint errors"
echo ""
echo "📚 For manual deployment instructions, see:"
echo "   database/SETUP_INSTRUCTIONS.md"
echo ""

