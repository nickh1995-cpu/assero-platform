import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolio_id');
    const status = searchParams.get('status');
    const assetType = searchParams.get('asset_type');

    let query = supabase
      .from('deal_pipeline')
      .select('*')
      .order('expected_close_date', { ascending: true });

    if (portfolioId) {
      query = query.eq('portfolio_id', portfolioId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    const { data: deals, error } = await query;

    if (error) {
      console.error('Error fetching deals:', error);
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }

    return NextResponse.json({ deals });
  } catch (error) {
    console.error('Deals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      portfolio_id, 
      title, 
      description, 
      asset_type, 
      status = 'interest', 
      deal_value, 
      currency = 'EUR',
      expected_close_date 
    } = body;

    if (!portfolio_id || !title || !asset_type) {
      return NextResponse.json({ 
        error: 'Portfolio ID, title, and asset type are required' 
      }, { status: 400 });
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        portfolio_id,
        user_id: auth.user.id,
        title,
        description,
        asset_type,
        status,
        deal_value,
        currency,
        expected_close_date
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Deal creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
