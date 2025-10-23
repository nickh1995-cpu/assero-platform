import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getComparables, getPriceDistribution } from '@/lib/comparables-data';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Map asset types to category slugs
const CATEGORY_SLUGS = {
  'real-estate': 'immobilien',
  'luxusuhren': 'luxusuhren',
  'fahrzeuge': 'fahrzeuge'
};

type ComparableAsset = {
  id: string;
  type: string;
  title: string;
  price: number;
  image?: string;
  specs: Record<string, string | number>;
  location?: string;
  similarity: number;
  listingUrl?: string;
};

// Calculate similarity score based on price and metadata
function calculateSimilarity(asset: any, userEstimate: number): number {
  const priceDiff = Math.abs(asset.price - userEstimate) / userEstimate;
  // Base similarity on price proximity (max 100%, decreases with price difference)
  const similarity = Math.max(70, Math.min(100, 100 - (priceDiff * 50)));
  return Math.round(similarity);
}

// Extract specs from metadata
function extractSpecs(asset: any, assetType: string): Record<string, string | number> {
  const specs: Record<string, string | number> = {};
  
  if (assetType === 'real-estate' && asset.metadata) {
    if (asset.area_sqm) specs["Fläche"] = `${asset.area_sqm} m²`;
    if (asset.rooms) specs["Zimmer"] = asset.rooms;
    if (asset.condition) specs["Zustand"] = asset.condition;
    if (asset.property_type) specs["Typ"] = asset.property_type;
  } else if (assetType === 'luxusuhren' && asset.metadata) {
    specs["Marke"] = asset.metadata.brand || "N/A";
    specs["Modell"] = asset.metadata.model || "N/A";
    specs["Zustand"] = asset.metadata.condition || asset.condition || "Gut";
    if (asset.metadata.fullSet) specs["Full Set"] = "Ja";
  } else if (assetType === 'fahrzeuge' && asset.metadata) {
    specs["Marke"] = asset.metadata.brand || "N/A";
    specs["Modell"] = asset.metadata.model || "N/A";
    if (asset.metadata.year) specs["Baujahr"] = asset.metadata.year;
    if (asset.metadata.mileage) specs["Kilometerstand"] = `${asset.metadata.mileage.toLocaleString('de-DE')} km`;
    specs["Zustand"] = asset.metadata.condition || asset.condition || "Gut";
  }
  
  return specs;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetType = searchParams.get('assetType') as "real-estate" | "luxusuhren" | "fahrzeuge";
    const userEstimate = searchParams.get('estimate');
    const limit = searchParams.get('limit');

    if (!assetType) {
      return NextResponse.json(
        { error: 'assetType is required' },
        { status: 400 }
      );
    }

    const estimate = userEstimate ? parseInt(userEstimate) : 500000;
    const maxResults = limit ? parseInt(limit) : 5;
    const categorySlug = CATEGORY_SLUGS[assetType];

    // Fetch real data from Supabase
    const { data: category } = await supabase
      .from('asset_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    let comparables: ComparableAsset[] = [];
    
    if (category) {
      // Query assets from the same category
      const priceMin = estimate * 0.7; // ±30% price range
      const priceMax = estimate * 1.3;
      
      const { data: assets, error } = await supabase
        .from('assets')
        .select('*')
        .eq('category_id', category.id)
        .eq('status', 'active')
        .gte('price', priceMin)
        .lte('price', priceMax)
        .order('created_at', { ascending: false })
        .limit(maxResults * 2); // Fetch more for better filtering

      if (error) {
        console.error('Supabase query error:', error);
      } else if (assets && assets.length > 0) {
        // Transform to comparables format
        comparables = assets
          .map(asset => ({
            id: asset.id,
            type: assetType,
            title: asset.title,
            price: Number(asset.price),
            image: asset.metadata?.images?.[0] || asset.image || undefined,
            specs: extractSpecs(asset, assetType),
            location: asset.location || undefined,
            similarity: calculateSimilarity(asset, estimate),
            listingUrl: `/browse/${asset.id}`
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, maxResults);
      }
    }

    // Fallback to mock data if no real data found
    if (comparables.length === 0) {
      console.log('No real assets found, using mock data');
      comparables = getComparables(assetType, estimate, maxResults).map(comp => ({
        ...comp,
        type: assetType
      }));
    }

    // Calculate price distribution
    const allPrices = comparables.map(c => c.price);
    allPrices.push(estimate);
    allPrices.sort((a, b) => a - b);

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const avg = Math.round(allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length);
    const median = allPrices[Math.floor(allPrices.length / 2)];
    const userIndex = allPrices.indexOf(estimate);
    const percentile = Math.round((userIndex / allPrices.length) * 100);

    const distribution = {
      min,
      max,
      avg,
      median,
      percentile,
      priceRange: {
        low: Math.round(avg * 0.85),
        mid: avg,
        high: Math.round(avg * 1.15)
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        comparables,
        distribution,
        count: comparables.length,
        source: comparables.length > 0 && comparables[0].id.startsWith('re-') ? 'mock' : 'database'
      }
    });
  } catch (error) {
    console.error('Error fetching comparables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparables' },
      { status: 500 }
    );
  }
}

