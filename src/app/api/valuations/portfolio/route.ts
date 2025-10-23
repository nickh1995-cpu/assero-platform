import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch portfolio summary for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the database function to get portfolio summary
    const { data: summary, error } = await supabase
      .rpc('get_portfolio_summary', { p_user_id: user.id });

    if (error) {
      console.error('Error fetching portfolio summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch portfolio summary' },
        { status: 500 }
      );
    }

    // Fetch recent valuations for the chart
    const { data: recent, error: recentError } = await supabase
      .from('saved_valuations')
      .select('asset_type, estimated_value, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent valuations:', error);
    }

    return NextResponse.json({
      summary: summary?.[0] || {},
      recent: recent || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

