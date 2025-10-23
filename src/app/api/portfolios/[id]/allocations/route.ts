import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: allocations, error } = await supabase
      .from('asset_allocations')
      .select('*')
      .eq('portfolio_id', params.id)
      .order('allocation_percentage', { ascending: false });

    if (error) {
      console.error('Error fetching allocations:', error);
      return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
    }

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error('Allocations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      asset_type, 
      allocation_percentage, 
      target_allocation, 
      actual_value 
    } = body;

    if (!asset_type || allocation_percentage === undefined) {
      return NextResponse.json({ 
        error: 'Asset type and allocation percentage are required' 
      }, { status: 400 });
    }

    const { data: allocation, error } = await supabase
      .from('asset_allocations')
      .insert({
        portfolio_id: params.id,
        asset_type,
        allocation_percentage,
        target_allocation: target_allocation || allocation_percentage,
        actual_value: actual_value || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating allocation:', error);
      return NextResponse.json({ error: 'Failed to create allocation' }, { status: 500 });
    }

    return NextResponse.json({ allocation });
  } catch (error) {
    console.error('Allocation creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
