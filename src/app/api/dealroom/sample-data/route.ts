import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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

    // Create sample portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        user_id: auth.user.id,
        name: 'Luxury Assets Portfolio',
        description: 'Premium investment portfolio focusing on luxury real estate, watches, and vehicles',
        total_value: 2500000.00,
        currency: 'EUR'
      })
      .select()
      .single();

    if (portfolioError) {
      console.error('Error creating sample portfolio:', portfolioError);
      return NextResponse.json({ error: 'Failed to create sample portfolio' }, { status: 500 });
    }

    // Create sample deals
    const sampleDeals = [
      {
        portfolio_id: portfolio.id,
        user_id: auth.user.id,
        title: 'Munich Penthouse Acquisition',
        description: 'Exclusive penthouse in Munich city center with panoramic views',
        asset_type: 'real-estate',
        status: 'negotiation',
        deal_value: 850000.00,
        currency: 'EUR',
        expected_close_date: '2024-03-15'
      },
      {
        portfolio_id: portfolio.id,
        user_id: auth.user.id,
        title: 'Rolex Daytona Investment',
        description: 'Rare Rolex Daytona 116500LN with box and papers',
        asset_type: 'luxury-watches',
        status: 'due-diligence',
        deal_value: 45000.00,
        currency: 'EUR',
        expected_close_date: '2024-02-28'
      },
      {
        portfolio_id: portfolio.id,
        user_id: auth.user.id,
        title: 'Porsche 911 GT3 RS',
        description: 'Limited edition Porsche 911 GT3 RS in Guards Red',
        asset_type: 'vehicles',
        status: 'interest',
        deal_value: 180000.00,
        currency: 'EUR',
        expected_close_date: '2024-04-30'
      }
    ];

    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .insert(sampleDeals)
      .select();

    if (dealsError) {
      console.error('Error creating sample deals:', dealsError);
      return NextResponse.json({ error: 'Failed to create sample deals' }, { status: 500 });
    }

    // Create sample asset allocations
    const sampleAllocations = [
      {
        portfolio_id: portfolio.id,
        asset_type: 'real-estate',
        allocation_percentage: 65.0,
        target_allocation: 60.0,
        actual_value: 1650000.00
      },
      {
        portfolio_id: portfolio.id,
        asset_type: 'luxury-watches',
        allocation_percentage: 20.0,
        target_allocation: 25.0,
        actual_value: 500000.00
      },
      {
        portfolio_id: portfolio.id,
        asset_type: 'vehicles',
        allocation_percentage: 15.0,
        target_allocation: 15.0,
        actual_value: 350000.00
      }
    ];

    const { data: allocations, error: allocationsError } = await supabase
      .from('asset_allocations')
      .insert(sampleAllocations)
      .select();

    if (allocationsError) {
      console.error('Error creating sample allocations:', allocationsError);
      return NextResponse.json({ error: 'Failed to create sample allocations' }, { status: 500 });
    }

    // Create sample performance data
    const performanceData = [];
    const baseValue = 2500000.00;
    let cumulativeReturn = 0;
    
    for (let i = 1; i <= 30; i++) {
      const dailyReturn = (Math.random() * 5 - 2) / 100; // -2% to +3%
      cumulativeReturn += dailyReturn;
      const currentValue = baseValue * (1 + cumulativeReturn);
      
      performanceData.push({
        portfolio_id: portfolio.id,
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_value: currentValue,
        daily_return: dailyReturn,
        cumulative_return: cumulativeReturn,
        volatility: Math.random() * 0.15 + 0.05, // 5% to 20%
        sharpe_ratio: Math.random() * 2 + 0.5 // 0.5 to 2.5
      });
    }

    const { error: performanceError } = await supabase
      .from('portfolio_performance')
      .insert(performanceData);

    if (performanceError) {
      console.error('Error creating sample performance data:', performanceError);
      // Don't fail the request for performance data errors
    }

    return NextResponse.json({ 
      success: true,
      portfolio,
      deals,
      allocations,
      message: 'Sample data created successfully'
    });

  } catch (error) {
    console.error('Sample data creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
