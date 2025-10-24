"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./PortfolioModal.module.css";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPortfolioCreated: (portfolio: any) => void;
}

export function PortfolioModal({ isOpen, onClose, onPortfolioCreated }: PortfolioModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_value: '',
    currency: 'EUR',
    risk_level: 'medium',
    investment_horizon: '5-10 years'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Sie müssen angemeldet sein, um ein Portfolio zu erstellen.');
        return;
      }

      const portfolioData = {
        name: formData.name,
        description: formData.description,
        target_value: parseFloat(formData.target_value),
        currency: formData.currency,
        risk_level: formData.risk_level,
        investment_horizon: formData.investment_horizon,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('portfolio_overview')
        .insert(portfolioData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating portfolio:', insertError);
        setError('Fehler beim Erstellen des Portfolios. Bitte versuchen Sie es erneut.');
        return;
      }

      onPortfolioCreated(data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        target_value: '',
        currency: 'EUR',
        risk_level: 'medium',
        investment_horizon: '5-10 years'
      });

    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Neues Portfolio erstellen</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              Portfolio-Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="z.B. Luxus-Immobilien Portfolio"
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
              placeholder="Beschreiben Sie Ihr Investment-Ziel..."
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="target_value" className={styles.formLabel}>
                Zielwert (€) *
              </label>
              <input
                type="number"
                id="target_value"
                name="target_value"
                value={formData.target_value}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="1000000"
                min="0"
                step="1000"
                required
              />
            </div>

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
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="risk_level" className={styles.formLabel}>
                Risikoprofil
              </label>
              <select
                id="risk_level"
                name="risk_level"
                value={formData.risk_level}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="low">Konservativ</option>
                <option value="medium">Ausgewogen</option>
                <option value="high">Aggressiv</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="investment_horizon" className={styles.formLabel}>
                Anlagehorizont
              </label>
              <select
                id="investment_horizon"
                name="investment_horizon"
                value={formData.investment_horizon}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="1-3 years">1-3 Jahre</option>
                <option value="3-5 years">3-5 Jahre</option>
                <option value="5-10 years">5-10 Jahre</option>
                <option value="10+ years">10+ Jahre</option>
              </select>
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
              {loading ? 'Erstelle...' : 'Portfolio erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
