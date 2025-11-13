"use client";

import { useState, useEffect, FormEvent } from "react";
import { createDeposit, DepositParams } from "@/lib/transactionService";
import styles from "./DepositModal.module.css";

// ===============================================
// TYPES
// ===============================================

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
  paymentMethods: any[];
  onSuccess: () => void;
}

// ===============================================
// COMPONENT
// ===============================================

export function DepositModal({ 
  isOpen, 
  onClose, 
  wallet, 
  paymentMethods,
  onSuccess 
}: DepositModalProps) {
  
  // State
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setCurrency('EUR');
      setSelectedPaymentMethod("");
      setDescription("");
      setError("");
      setSuccess("");
      
      // Auto-select first verified payment method
      const defaultMethod = paymentMethods.find(pm => pm.is_default && pm.is_verified);
      const firstVerified = paymentMethods.find(pm => pm.is_verified);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (firstVerified) {
        setSelectedPaymentMethod(firstVerified.id);
      }
    }
  }, [isOpen, paymentMethods]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Validate amount
  const validateAmount = (value: string): boolean => {
    const num = parseFloat(value);
    
    if (isNaN(num) || num <= 0) {
      setError("Bitte geben Sie einen gültigen Betrag ein");
      return false;
    }
    
    if (num < 10) {
      setError("Mindestbetrag: €10.00");
      return false;
    }
    
    if (num > 50000) {
      setError("Maximalbetrag: €50,000.00");
      return false;
    }
    
    // Check decimal places
    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      setError("Maximal 2 Dezimalstellen erlaubt");
      return false;
    }
    
    return true;
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate
    if (!amount || !validateAmount(amount)) {
      return;
    }
    
    if (!selectedPaymentMethod) {
      setError("Bitte wählen Sie eine Zahlungsmethode");
      return;
    }
    
    // Confirm
    const confirmMessage = `Einzahlung bestätigen:\n\nBetrag: ${parseFloat(amount).toFixed(2)} ${currency}\nZahlungsmethode: ${paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.bank_name || paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.card_brand || 'Zahlungsmethode'}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Process deposit
    setLoading(true);
    
    const params: DepositParams = {
      walletId: wallet.id,
      userId: wallet.user_id,
      amount: parseFloat(amount),
      currency: currency,
      paymentMethodId: selectedPaymentMethod,
      description: description || undefined
    };
    
    try {
      const result = await createDeposit(params);
      
      if (result.success) {
        setSuccess(result.message);
        setAmount("");
        setDescription("");
        
        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess(); // Reload wallet data
          onClose();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Deposit error:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (value: number, curr: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getBalance = (curr: 'EUR' | 'USD' | 'GBP') => {
    if (!wallet) return 0;
    switch (curr) {
      case 'EUR': return wallet.balance_eur || 0;
      case 'USD': return wallet.balance_usd || 0;
      case 'GBP': return wallet.balance_gbp || 0;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_account':
      case 'sepa':
        return '🏦';
      case 'credit_card':
      case 'debit_card':
        return '💳';
      case 'paypal':
        return '🅿️';
      default:
        return '💰';
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Get verified payment methods only
  const verifiedPaymentMethods = paymentMethods.filter(pm => pm.is_verified);

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.titleIcon}>💸</span>
            Einzahlung
          </h2>
          <p className={styles.modalSubtitle}>
            Laden Sie Ihr Wallet-Guthaben auf
          </p>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            type="button"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {/* Success Message */}
          {success && (
            <div className={`${styles.messageCard} ${styles.messageSuccess}`}>
              <div className={styles.messageIcon}>✅</div>
              <div className={styles.messageContent}>
                <h3 className={styles.messageTitle}>Erfolgreich!</h3>
                <p className={styles.messageText}>{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`${styles.messageCard} ${styles.messageError}`}>
              <div className={styles.messageIcon}>⚠️</div>
              <div className={styles.messageContent}>
                <h3 className={styles.messageTitle}>Fehler</h3>
                <p className={styles.messageText}>{error}</p>
              </div>
            </div>
          )}

          <div className={styles.form}>
            {/* Currency Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Währung
              </label>
              <div className={styles.currencyTabs}>
                <button
                  type="button"
                  className={`${styles.currencyTab} ${currency === 'EUR' ? styles.currencyTabActive : ''}`}
                  onClick={() => setCurrency('EUR')}
                >
                  EUR (€)
                </button>
                <button
                  type="button"
                  className={`${styles.currencyTab} ${currency === 'USD' ? styles.currencyTabActive : ''}`}
                  onClick={() => setCurrency('USD')}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  className={`${styles.currencyTab} ${currency === 'GBP' ? styles.currencyTabActive : ''}`}
                  onClick={() => setCurrency('GBP')}
                >
                  GBP (£)
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Betrag <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="10"
                max="50000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                onBlur={() => amount && validateAmount(amount)}
                placeholder="0.00"
                className={`${styles.input} ${styles.amountInput} ${error && !selectedPaymentMethod ? styles.inputError : ''}`}
                disabled={loading || !!success}
                required
              />
              <p className={styles.helperText}>
                💡 Mindestbetrag: €10.00 | Maximalbetrag: €50,000.00
              </p>
            </div>

            {/* Current Balance Info */}
            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Aktuelles Guthaben:</span>
                <span className={styles.infoValue}>
                  {formatCurrency(getBalance(currency), currency)}
                </span>
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Neues Guthaben:</span>
                  <span className={styles.infoHighlight}>
                    {formatCurrency(getBalance(currency) + parseFloat(amount), currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Zahlungsmethode <span className={styles.required}>*</span>
              </label>
              
              {verifiedPaymentMethods.length === 0 ? (
                <div className={styles.infoCard}>
                  <p className={styles.helperText}>
                    ⚠️ Sie haben noch keine verifizierte Zahlungsmethode. 
                    Bitte fügen Sie zuerst eine Zahlungsmethode hinzu.
                  </p>
                </div>
              ) : (
                <div className={styles.paymentMethods}>
                  {verifiedPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`${styles.paymentMethodCard} ${
                        selectedPaymentMethod === method.id ? styles.paymentMethodCardSelected : ''
                      }`}
                      onClick={() => {
                        setSelectedPaymentMethod(method.id);
                        setError("");
                      }}
                    >
                      <div className={styles.paymentMethodIcon}>
                        {getPaymentMethodIcon(method.type)}
                      </div>
                      <div className={styles.paymentMethodInfo}>
                        <div className={styles.paymentMethodName}>
                          {method.bank_name || method.card_brand || 'Zahlungsmethode'}
                          {method.is_verified && (
                            <span className={styles.verifiedBadge}>✓</span>
                          )}
                        </div>
                        <div className={styles.paymentMethodDetails}>
                          {method.iban ? `••••${method.iban.slice(-4)}` : 
                           method.card_last4 ? `••••${method.card_last4}` : 
                           'Details nicht verfügbar'}
                        </div>
                      </div>
                      <div className={`${styles.radio} ${selectedPaymentMethod === method.id ? styles.radioChecked : ''}`}></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Beschreibung (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Ersteinzahlung für Projekt XYZ"
                className={styles.textarea}
                disabled={loading || !!success}
                maxLength={200}
              />
              <p className={styles.helperText}>
                📝 Optionale Notiz für Ihre Unterlagen
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onClose}
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={handleSubmit}
            disabled={
              loading || 
              !amount || 
              parseFloat(amount) < 10 || 
              !selectedPaymentMethod ||
              !!success
            }
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Wird verarbeitet...
              </>
            ) : success ? (
              <>
                <span className={styles.buttonIcon}>✓</span>
                Erfolgreich
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>💸</span>
                Einzahlen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

