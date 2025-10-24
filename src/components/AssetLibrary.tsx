"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AssetLibrary.module.css";

interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  location?: string;
  image?: string;
  status: string;
  created_at: string;
  metadata?: any;
}

interface FilterOptions {
  category: string[];
  priceRange: [number, number];
  location: string[];
  status: string[];
  dateRange: [string, string];
  features: string[];
}

interface AssetLibraryProps {
  onAssetSelect?: (asset: Asset) => void;
  onBulkAction?: (assetIds: string[], action: string) => void;
}

export function AssetLibrary({ onAssetSelect, onBulkAction }: AssetLibraryProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    priceRange: [0, 10000000],
    location: [],
    status: [],
    dateRange: ['', ''],
    features: []
  });

  const categories = [
    { value: 'real-estate', label: 'Immobilien', icon: '🏠' },
    { value: 'luxury-watches', label: 'Luxusuhren', icon: '⌚' },
    { value: 'vehicles', label: 'Fahrzeuge', icon: '🚗' },
    { value: 'art', label: 'Kunst', icon: '🎨' },
    { value: 'collectibles', label: 'Sammlerstücke', icon: '💎' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Aktiv', color: '#10b981' },
    { value: 'sold', label: 'Verkauft', color: '#6b7280' },
    { value: 'draft', label: 'Entwurf', color: '#f59e0b' },
    { value: 'expired', label: 'Abgelaufen', color: '#ef4444' }
  ];

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, searchQuery, filters, sortBy, sortOrder]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(asset => filters.category.includes(asset.category));
    }

    // Price range filter
    filtered = filtered.filter(asset => 
      asset.price >= filters.priceRange[0] && asset.price <= filters.priceRange[1]
    );

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(asset => 
        asset.location && filters.location.includes(asset.location)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(asset => filters.status.includes(asset.status));
    }

    // Date range filter
    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(asset => {
        const assetDate = new Date(asset.created_at);
        const startDate = new Date(filters.dateRange[0]);
        const endDate = new Date(filters.dateRange[1]);
        return assetDate >= startDate && assetDate <= endDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredAssets(filtered);
  };

  const handleAssetSelect = (asset: Asset) => {
    onAssetSelect?.(asset);
  };

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedAssets.length === 0) return;
    onBulkAction?.(selectedAssets, action);
    setSelectedAssets([]);
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      priceRange: [0, 10000000],
      location: [],
      status: [],
      dateRange: ['', ''],
      features: []
    });
    setSearchQuery("");
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📦';
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Asset-Bibliothek...</p>
      </div>
    );
  }

  return (
    <div className={styles.assetLibrary}>
      {/* Header */}
      <div className={styles.libraryHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.libraryTitle}>Asset-Bibliothek</h2>
          <div className={styles.assetCount}>
            {filteredAssets.length} von {assets.length} Assets
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
            </svg>
            Filter
          </button>
          <div className={styles.viewControls}>
            <button 
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button 
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Assets durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchField}
            />
          </div>
          <div className={styles.sortControls}>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.sortSelect}
            >
              <option value="date">Datum</option>
              <option value="price">Preis</option>
              <option value="title">Titel</option>
            </select>
            <button 
              className={styles.sortOrderButton}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Kategorien</label>
              <div className={styles.filterOptions}>
                {categories.map(category => (
                  <label key={category.value} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            category: [...prev.category, category.value]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            category: prev.category.filter(c => c !== category.value)
                          }));
                        }
                      }}
                    />
                    <span className={styles.filterOptionLabel}>
                      {category.icon} {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Preisbereich</label>
              <div className={styles.priceRange}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [Number(e.target.value) || 0, prev.priceRange[1]]
                  }))}
                  className={styles.priceInput}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], Number(e.target.value) || 10000000]
                  }))}
                  className={styles.priceInput}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <div className={styles.filterOptions}>
                {statusOptions.map(status => (
                  <label key={status.value} className={styles.filterOption}>
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            status: [...prev.status, status.value]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status.value)
                          }));
                        }
                      }}
                    />
                    <span className={styles.filterOptionLabel}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.clearFiltersButton} onClick={clearFilters}>
                Filter zurücksetzen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedAssets.length > 0 && (
        <div className={styles.bulkActions}>
          <div className={styles.bulkInfo}>
            <span>{selectedAssets.length} Assets ausgewählt</span>
            <button 
              className={styles.selectAllButton}
              onClick={handleSelectAll}
            >
              {selectedAssets.length === filteredAssets.length ? 'Alle abwählen' : 'Alle auswählen'}
            </button>
          </div>
          <div className={styles.bulkButtons}>
            <button 
              className={styles.bulkButton}
              onClick={() => handleBulkAction('export')}
            >
              Export
            </button>
            <button 
              className={styles.bulkButton}
              onClick={() => handleBulkAction('delete')}
            >
              Löschen
            </button>
            <button 
              className={styles.bulkButton}
              onClick={() => handleBulkAction('compare')}
            >
              Vergleichen
            </button>
          </div>
        </div>
      )}

      {/* Assets Grid/List */}
      <div className={`${styles.assetsContainer} ${viewMode === 'list' ? styles.listView : styles.gridView}`}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className={`${styles.assetCard} ${selectedAssets.includes(asset.id) ? styles.assetSelected : ''}`}
              onClick={() => handleAssetSelect(asset)}
            >
              <div className={styles.assetCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleAssetToggle(asset.id);
                  }}
                />
              </div>
              
              <div className={styles.assetImage}>
                {asset.image ? (
                  <img src={asset.image} alt={asset.title} />
                ) : (
                  <div className={styles.assetPlaceholder}>
                    {getCategoryIcon(asset.category)}
                  </div>
                )}
                <div className={styles.assetStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(asset.status) }}
                  >
                    {getStatusLabel(asset.status)}
                  </span>
                </div>
              </div>
              
              <div className={styles.assetContent}>
                <div className={styles.assetHeader}>
                  <h3 className={styles.assetTitle}>{asset.title}</h3>
                  <div className={styles.assetCategory}>
                    {getCategoryIcon(asset.category)}
                  </div>
                </div>
                
                <p className={styles.assetDescription}>{asset.description}</p>
                
                <div className={styles.assetMeta}>
                  <div className={styles.assetPrice}>
                    {formatPrice(asset.price, asset.currency)}
                  </div>
                  {asset.location && (
                    <div className={styles.assetLocation}>
                      📍 {asset.location}
                    </div>
                  )}
                  <div className={styles.assetDate}>
                    {new Date(asset.created_at).toLocaleDateString("de-DE")}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3>Keine Assets gefunden</h3>
            <p>Versuchen Sie andere Suchbegriffe oder Filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
