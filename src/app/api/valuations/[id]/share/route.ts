import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// POST: Generate share link for a valuation
export async function POST(
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

    // Verify valuation belongs to user
    const { data: valuation, error: fetchError } = await supabase
      .from('saved_valuations')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !valuation || valuation.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Valuation not found or unauthorized' },
        { status: 404 }
      );
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');
    const shareableUntil = new Date();
    shareableUntil.setDate(shareableUntil.getDate() + 30); // Valid for 30 days

    // Update valuation with share token
    const { error: updateError } = await supabase
      .from('saved_valuations')
      .update({
        share_token: shareToken,
        shareable_until: shareableUntil.toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating share token:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate share link' },
        { status: 500 }
      );
    }

    // Generate share URL
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    return NextResponse.json({
      shareUrl,
      shareToken,
      expiresAt: shareableUntil.toISOString()
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Revoke share link
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

    // Revoke share token
    const { error: updateError } = await supabase
      .from('saved_valuations')
      .update({
        share_token: null,
        shareable_until: null
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error revoking share token:', updateError);
      return NextResponse.json(
        { error: 'Failed to revoke share link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Share link revoked successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

