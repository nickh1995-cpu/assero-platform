import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: portfolios, error } = await supabase
      .from('portfolio_overview')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
    }

    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('Portfolio API error:', error);
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
    const { name, description, currency = 'EUR' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 });
    }

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: auth.user.id,
        name,
        description,
        currency,
        total_value: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating portfolio:', error);
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Portfolio creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
