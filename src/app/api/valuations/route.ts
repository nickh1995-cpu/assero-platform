import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch all saved valuations for the current user
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

    // Fetch saved valuations
    const { data: valuations, error } = await supabase
      .from('saved_valuations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching valuations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch valuations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ valuations });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Save a new valuation
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      asset_type,
      form_data,
      estimated_value,
      value_min,
      value_max,
      title,
      notes,
      tags,
      price_alert_enabled,
      price_alert_threshold
    } = body;

    // Validate required fields
    if (!asset_type || !form_data || !estimated_value || !value_min || !value_max) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new valuation
    const { data: valuation, error } = await supabase
      .from('saved_valuations')
      .insert({
        user_id: user.id,
        asset_type,
        form_data,
        estimated_value,
        value_min,
        value_max,
        title: title || generateDefaultTitle(asset_type, form_data),
        notes,
        tags: tags || [],
        price_alert_enabled: price_alert_enabled || false,
        price_alert_threshold: price_alert_threshold || 5.0
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving valuation:', error);
      return NextResponse.json(
        { error: 'Failed to save valuation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ valuation }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a default title
function generateDefaultTitle(asset_type: string, form_data: any): string {
  if (asset_type === 'real-estate') {
    const type = form_data.propertyType || 'Immobilie';
    const location = form_data.locationAddress || '';
    return `${type} ${location}`.trim() || 'Immobilienbewertung';
  }
  
  if (asset_type === 'luxusuhren') {
    const brand = form_data.watchBrand || '';
    const model = form_data.watchModel || '';
    return `${brand} ${model}`.trim() || 'Uhrenbewertung';
  }
  
  if (asset_type === 'fahrzeuge') {
    const brand = form_data.vehicleBrand || '';
    const model = form_data.vehicleModel || '';
    return `${brand} ${model}`.trim() || 'Fahrzeugbewertung';
  }
  
  return 'Bewertung';
}

