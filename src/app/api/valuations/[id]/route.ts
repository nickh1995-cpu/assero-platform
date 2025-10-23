import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch a single valuation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Fetch valuation (RLS will ensure user can only see their own)
    const { data: valuation, error } = await supabase
      .from('saved_valuations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching valuation:', error);
      return NextResponse.json(
        { error: 'Valuation not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('saved_valuations')
      .update({ view_count: (valuation.view_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ valuation });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update a valuation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Update valuation (RLS will ensure user can only update their own)
    const { data: valuation, error } = await supabase
      .from('saved_valuations')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating valuation:', error);
      return NextResponse.json(
        { error: 'Failed to update valuation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ valuation });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a valuation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Delete valuation (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('saved_valuations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting valuation:', error);
      return NextResponse.json(
        { error: 'Failed to delete valuation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Valuation deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

