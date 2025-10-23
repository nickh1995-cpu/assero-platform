import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { generateValuationPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { valuationId, valuationData } = body;

    // If valuationId is provided, fetch from database
    if (valuationId) {
      const supabase = await getSupabaseServerClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Fetch valuation
      const { data: valuation, error } = await supabase
        .from('saved_valuations')
        .select('*')
        .eq('id', valuationId)
        .single();

      if (error || !valuation) {
        return NextResponse.json(
          { error: 'Valuation not found' },
          { status: 404 }
        );
      }

      // Generate PDF
      const pdf = generateValuationPDF({
        asset_type: valuation.asset_type,
        form_data: valuation.form_data,
        estimated_value: valuation.estimated_value,
        value_min: valuation.value_min,
        value_max: valuation.value_max,
        title: valuation.title,
        created_at: valuation.created_at
      });

      // Convert to buffer
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      // Return PDF as blob
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ASSERO_Bewertung_${valuationId.slice(0, 8)}.pdf"`
        }
      });
    }

    // If valuationData is provided directly (not saved)
    if (valuationData) {
      const pdf = generateValuationPDF(valuationData);
      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="ASSERO_Bewertung.pdf"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Missing valuationId or valuationData' },
      { status: 400 }
    );

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

