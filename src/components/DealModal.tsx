"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { checkUserVerification } from "@/lib/verification";
import styles from "./DealModal.module.css";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealCreated: (deal: any) => void;
}

export function DealModal({ isOpen, onClose, onDealCreated }: DealModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_type: 'real-estate',
    deal_size: '',
    currency: 'EUR',
    expected_close_date: '',
    deal_stage: 'initial',
    priority: 'medium',
    location: '',
    seller_contact: '',
    buyer_contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // ESC key handler
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      
      // Quick auth check only - don't block on full verification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('Sie müssen angemeldet sein, um einen Deal zu erstellen.');
        setLoading(false);
        return;
      }
      
      // Check if email is confirmed (required for creating deals)
      if (!user.email_confirmed_at) {
        setError('Bitte bestätigen Sie Ihre E-Mail-Adresse, um Deals zu erstellen.');
        setLoading(false);
        return;
      }

      // Map deal_stage to valid status values from database constraint
      // Database allows: 'initial', 'interest', 'negotiation', 'due-diligence', 'contract', 'closed', 'cancelled', 'nda_sent', 'nda_signed'
      const statusMap: Record<string, string> = {
        'initial': 'initial',
        'negotiation': 'negotiation',
        'due_diligence': 'due-diligence',
        'due-diligence': 'due-diligence',
        'contract': 'contract',
        'closing': 'closed',
        'completed': 'closed'
      };
      
      // Ensure we always have a valid status
      const mappedStatus = statusMap[formData.deal_stage] || 'initial';
      
      // Validate the status against database constraints
      const validStatuses = ['initial', 'interest', 'negotiation', 'due-diligence', 'contract', 'closed', 'cancelled', 'nda_sent', 'nda_signed'];
      const finalStatus = validStatuses.includes(mappedStatus) ? mappedStatus : 'initial';
      
      console.log('Deal status mapping:', {
        deal_stage: formData.deal_stage,
        mappedStatus,
        finalStatus
      });
      
      // Ensure asset_type is valid (fix potential browser cache issue)
      const validAssetTypes = ['real-estate', 'luxury-watches', 'vehicles', 'art', 'collectibles', 'real_estate'];
      const assetType = validAssetTypes.includes(formData.asset_type) 
        ? formData.asset_type 
        : 'real-estate';
      
      // Prepare deal data for the deals table
      const dealData = {
        user_id: user.id, // Required for RLS
        title: formData.title,
        description: formData.description || null,
        asset_type: assetType, // Use validated asset type
        status: finalStatus, // Use validated status
        deal_value: parseFloat(formData.deal_size) || null,
        deal_size: parseFloat(formData.deal_size) || null, // Store both for compatibility
        currency: formData.currency,
        expected_close_date: formData.expected_close_date || null,
        priority: formData.priority,
        location: formData.location || null,
        seller_contact: formData.seller_contact || null,
        buyer_contact: formData.buyer_contact || null,
        created_by: user.id
      };

      console.log('Creating deal with data:', {
        ...dealData,
        asset_type_validated: assetType,
        status_mapped: mappedStatus,
        status_final: finalStatus
      });
      
      // Double-check: log the exact status being sent
      console.log('Final status value being sent:', finalStatus, 'Type:', typeof finalStatus);
      console.log('Valid statuses:', validStatuses);
      console.log('Is status valid?', validStatuses.includes(finalStatus));

      // Insert into deals table (deal_pipeline is a view, not directly insertable)
      const { data: dealResult, error: insertError } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating deal:', insertError);
        setError(`Fehler beim Erstellen des Deals: ${insertError.message}`);
        setLoading(false);
        return;
      }

      if (!dealResult) {
        setError('Deal wurde erstellt, aber keine Daten zurückgegeben.');
        setLoading(false);
        return;
      }

      console.log('Deal created successfully:', dealResult);

      onDealCreated(dealResult);
      onClose();
      
      // Show success message
      alert('✅ Deal erfolgreich erstellt!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        asset_type: 'real-estate',
        deal_size: '',
        currency: 'EUR',
        expected_close_date: '',
        deal_stage: 'initial',
        priority: 'medium',
        location: '',
        seller_contact: '',
        buyer_contact: ''
      });

    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Normalize asset_type values to match database constraints
    let normalizedValue = value;
    if (name === 'asset_type') {
      const assetTypeMap: Record<string, string> = {
        'real_estate': 'real-estate',
        'real-estate': 'real-estate',
        'luxury_goods': 'luxury-watches',
        'luxury-watches': 'luxury-watches',
        'vehicles': 'vehicles',
        'art': 'art',
        'jewelry': 'luxury-watches',
        'collectibles': 'collectibles',
        'other': 'collectibles'
      };
      normalizedValue = assetTypeMap[value] || 'real-estate';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
  };

  if (!isOpen) return null;

  // Handle overlay click with onMouseDown to prevent click-through issues
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Neuen Deal erstellen</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Deal-Titel *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="z.B. Luxus-Penthouse Berlin"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.formLabel}>
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="Beschreiben Sie den Deal..."
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="asset_type" className={styles.formLabel}>
                Asset-Typ *
              </label>
              <select
                id="asset_type"
                name="asset_type"
                value={formData.asset_type}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="real-estate">Immobilie</option>
                <option value="luxury-watches">Luxusuhren</option>
                <option value="vehicles">Fahrzeuge</option>
                <option value="art">Kunst</option>
                <option value="collectibles">Sammlerobjekte</option>
                <option value="real_estate">Immobilie (Alt)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deal_size" className={styles.formLabel}>
                Deal-Größe (€) *
              </label>
              <input
                type="number"
                id="deal_size"
                name="deal_size"
                value={formData.deal_size}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="1000000"
                min="0"
                step="1000"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="currency" className={styles.formLabel}>
                Währung
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF (CHF)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="expected_close_date" className={styles.formLabel}>
                Erwarteter Abschluss
              </label>
              <input
                type="date"
                id="expected_close_date"
                name="expected_close_date"
                value={formData.expected_close_date}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="deal_stage" className={styles.formLabel}>
                Deal-Phase
              </label>
              <select
                id="deal_stage"
                name="deal_stage"
                value={formData.deal_stage}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="initial">Initial</option>
                <option value="negotiation">Verhandlung</option>
                <option value="due_diligence">Due Diligence</option>
                <option value="contract">Vertrag</option>
                <option value="closing">Abschluss</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.formLabel}>
                Priorität
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.formLabel}>
              Standort
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="z.B. Berlin, Deutschland"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="seller_contact" className={styles.formLabel}>
                Verkäufer-Kontakt
              </label>
              <input
                type="text"
                id="seller_contact"
                name="seller_contact"
                value={formData.seller_contact}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Name oder E-Mail"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="buyer_contact" className={styles.formLabel}>
                Käufer-Kontakt
              </label>
              <input
                type="text"
                id="buyer_contact"
                name="buyer_contact"
                value={formData.buyer_contact}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Name oder E-Mail"
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnSecondary}
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? 'Erstelle...' : 'Deal erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
