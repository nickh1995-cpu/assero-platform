import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch valuation by share token (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await getSupabaseServerClient();
    const { token } = params;

    // Fetch valuation by share token (bypassing RLS for this specific case)
    const { data: valuation, error } = await supabase
      .from('saved_valuations')
      .select('*')
      .eq('share_token', token)
      .single();

    if (error || !valuation) {
      return NextResponse.json(
        { error: 'Valuation not found or link expired' },
        { status: 404 }
      );
    }

    // Check if share link is still valid
    if (valuation.shareable_until) {
      const expiryDate = new Date(valuation.shareable_until);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: 'Share link expired' },
          { status: 410 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Share link not active' },
        { status: 403 }
      );
    }

    // Return valuation data (without sensitive user info)
    return NextResponse.json({
      valuation: {
        id: valuation.id,
        asset_type: valuation.asset_type,
        form_data: valuation.form_data,
        estimated_value: valuation.estimated_value,
        value_min: valuation.value_min,
        value_max: valuation.value_max,
        title: valuation.title,
        created_at: valuation.created_at
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

