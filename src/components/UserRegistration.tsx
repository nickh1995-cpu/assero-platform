"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/utils/url";
import styles from "./UserRegistration.module.css";

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'buyer' | 'seller';
  companyName?: string;
  phone?: string;
  website?: string;
  termsAccepted: boolean;
}

interface UserRegistrationProps {
  onRegistrationComplete?: (userData: any) => void;
  onClose?: () => void;
}

export function UserRegistration({ onRegistrationComplete, onClose }: UserRegistrationProps) {
  const [step, setStep] = useState<'role' | 'details' | 'profile' | 'verification'>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'buyer',
    companyName: '',
    phone: '',
    website: '',
    termsAccepted: false
  });

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleNext = () => {
    if (step === 'role') {
      setStep('details');
    } else if (step === 'details') {
      setStep('profile');
    } else if (step === 'profile') {
      setStep('verification');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('role');
    } else if (step === 'profile') {
      setStep('details');
    } else if (step === 'verification') {
      setStep('profile');
    }
  };

  const validateForm = () => {
    if (step === 'details') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Bitte füllen Sie alle Felder aus.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwörter stimmen nicht überein.');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Passwort muss mindestens 8 Zeichen lang sein.');
        return false;
      }
    }
    if (step === 'profile') {
      if (!formData.firstName || !formData.lastName) {
        setError('Bitte geben Sie Ihren Vor- und Nachnamen ein.');
        return false;
      }
      if (formData.userType === 'seller' && !formData.companyName) {
        setError('Bitte geben Sie den Firmennamen ein.');
        return false;
      }
    }
    if (step === 'verification') {
      if (!formData.termsAccepted) {
        setError('Bitte akzeptieren Sie die AGB und Datenschutzerklärung.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase Client nicht verfügbar. Bitte überprüfen Sie Ihre Netzwerkverbindung.');
      }
      
      // Create user account with email confirmation
      // Include redirect_to parameter to return to dealroom after confirmation
      const callbackUrl = `${getAuthCallbackUrl()}?redirect_to=/dealroom`;
      
      console.log('Starting user registration...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: formData.userType
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(`Registrierung fehlgeschlagen: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Benutzer konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
      }

      console.log('User created:', authData.user.id);

      // Check if user needs email confirmation
      if (authData.user.email_confirmed_at === null) {
        // User needs to confirm email - show clear message
        // Profile creation will happen AFTER email confirmation
        setError(null);
        setLoading(false);
        
        console.log('User registered, waiting for email confirmation:', authData.user.id);
        
        // Show success message with clear instructions
        alert(`✅ Registrierung erfolgreich!\n\n📧 Bitte verifizieren Sie Ihre E-Mail-Adresse.\n\nSie haben eine Bestätigungs-E-Mail an ${formData.email} erhalten.\n\nBitte klicken Sie auf den Link in der E-Mail, um Ihre Registrierung abzuschließen.\n\nNach dem Klick auf den Link werden Sie automatisch angemeldet und zur Dealroom-Seite weitergeleitet.`);
        
        // Close registration modal and redirect to home
        onClose?.();
        window.location.href = '/';
        return;
      }

      // User is already confirmed (no email confirmation required)
      // This happens when email confirmation is disabled in Supabase settings
      console.log('User already confirmed, creating profile now...');

      // Wait a moment to ensure auth.users record is committed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create user role with error handling
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_type: formData.userType,
          is_primary_role: true
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
        // If role already exists, ignore error and continue
        if (!roleError.message.includes('duplicate key') && !roleError.message.includes('already exists')) {
          // If FK constraint error, profile will be created after email confirmation
          if (roleError.message.includes('foreign key constraint')) {
            console.warn('FK constraint - profile will be created after email confirmation');
            onClose?.();
            window.location.href = '/';
            return;
          }
          throw new Error(`Rolle konnte nicht erstellt werden: ${roleError.message}`);
        }
      }

      // Create role-specific profile with error handling
      if (formData.userType === 'buyer') {
        const { error: buyerError } = await supabase
          .from('buyer_profiles')
          .insert({
            user_id: authData.user.id,
            company_name: formData.companyName || null,
            contact_person: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone || null,
            website: formData.website || null,
            verification_status: 'pending'
          });

        if (buyerError) {
          console.error('Buyer profile creation error:', buyerError);
          // If profile already exists, ignore error and continue
          if (!buyerError.message.includes('duplicate key') && !buyerError.message.includes('already exists')) {
            throw new Error(`Käufer-Profil konnte nicht erstellt werden: ${buyerError.message}`);
          }
        }
      } else if (formData.userType === 'seller') {
        const { error: sellerError } = await supabase
          .from('seller_profiles')
          .insert({
            user_id: authData.user.id,
            company_name: formData.companyName || 'Nicht angegeben',
            contact_person: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone || null,
            website: formData.website || null,
            verification_status: 'pending'
          });

        if (sellerError) {
          console.error('Seller profile creation error:', sellerError);
          // If profile already exists, ignore error and continue
          if (!sellerError.message.includes('duplicate key') && !sellerError.message.includes('already exists')) {
            throw new Error(`Verkäufer-Profil konnte nicht erstellt werden: ${sellerError.message}`);
          }
        }
      }

      console.log('Registration complete - calling callback');

      // Call completion callback (success message will be shown by parent component)
      onRegistrationComplete?.({
        user: authData.user,
        role: formData.userType,
        profile: formData
      });

      // Redirect to dealroom after short delay
      setTimeout(() => {
        window.location.href = '/dealroom';
      }, 500);

    } catch (error: any) {
      console.error('Registration error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail-Adresse.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Ungültige E-Mail-Adresse. Bitte überprüfen Sie Ihre Eingabe.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Passwort ist zu schwach oder ungültig. Bitte verwenden Sie mindestens 8 Zeichen.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'role': return 'Wählen Sie Ihren Account-Typ';
      case 'details': return 'Kontodaten';
      case 'profile': return 'Profil-Informationen';
      case 'verification': return 'Bestätigung';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'role': return 'Wie möchten Sie die Plattform nutzen?';
      case 'details': return 'Erstellen Sie Ihr Konto';
      case 'profile': return 'Ergänzen Sie Ihre Informationen';
      case 'verification': return 'Bestätigen Sie Ihre Registrierung';
      default: return '';
    }
  };

  // Handle overlay click with onMouseDown to prevent click-through issues
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.registrationModal}>
      {onClose && (
        <div 
          className={styles.modalOverlay} 
          onMouseDown={handleOverlayClick}
        ></div>
      )}
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>Registrierung</h2>
            <div className={styles.stepIndicator}>
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${step === 'role' ? styles.stepActive : ''}`}>1</div>
                <span className={styles.stepLabel}>Rolle</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${step === 'details' ? styles.stepActive : ''}`}>2</div>
                <span className={styles.stepLabel}>Daten</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${step === 'profile' ? styles.stepActive : ''}`}>3</div>
                <span className={styles.stepLabel}>Profil</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${step === 'verification' ? styles.stepActive : ''}`}>4</div>
                <span className={styles.stepLabel}>Bestätigung</span>
              </div>
            </div>
          </div>
          {onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>{getStepTitle()}</h3>
            <p className={styles.stepDescription}>{getStepDescription()}</p>

            {/* Role Selection */}
            {step === 'role' && (
              <div className={styles.roleSelection}>
                <div 
                  className={`${styles.roleCard} ${formData.userType === 'buyer' ? styles.roleSelected : ''}`}
                  onClick={() => handleInputChange('userType', 'buyer')}
                >
                  <div className={styles.roleIcon}>🛒</div>
                  <h4 className={styles.roleTitle}>Käufer</h4>
                  <p className={styles.roleDescription}>
                    Ich möchte Luxus-Assets kaufen und in den Dealroom investieren
                  </p>
                  <div className={styles.roleFeatures}>
                    <div className={styles.feature}>✓ Zugang zum Dealroom</div>
                    <div className={styles.feature}>✓ Portfolio-Management</div>
                    <div className={styles.feature}>✓ AI-Empfehlungen</div>
                    <div className={styles.feature}>✓ Analytics Dashboard</div>
                  </div>
                </div>

                <div 
                  className={`${styles.roleCard} ${formData.userType === 'seller' ? styles.roleSelected : ''}`}
                  onClick={() => handleInputChange('userType', 'seller')}
                >
                  <div className={styles.roleIcon}>🏪</div>
                  <h4 className={styles.roleTitle}>Verkäufer</h4>
                  <p className={styles.roleDescription}>
                    Ich möchte Luxus-Assets verkaufen und Inserate verwalten
                  </p>
                  <div className={styles.roleFeatures}>
                    <div className={styles.feature}>✓ Inserate erstellen</div>
                    <div className={styles.feature}>✓ Verkaufs-Analytics</div>
                    <div className={styles.feature}>✓ Käufer-Kommunikation</div>
                    <div className={styles.feature}>✓ Provision-Management</div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details */}
            {step === 'details' && (
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>E-Mail-Adresse *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.formInput}
                    placeholder="ihre@email.de"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Passwort *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={styles.formInput}
                      placeholder="Mindestens 8 Zeichen"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Passwort bestätigen *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={styles.formInput}
                      placeholder="Passwort wiederholen"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information */}
            {step === 'profile' && (
              <div className={styles.formSection}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Vorname *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={styles.formInput}
                      placeholder="Max"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nachname *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={styles.formInput}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                
                {formData.userType === 'seller' && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Firmenname *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={styles.formInput}
                      placeholder="Ihre Firma GmbH"
                    />
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={styles.formInput}
                      placeholder="+49 123 456789"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className={styles.formInput}
                      placeholder="https://ihre-website.de"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Verification */}
            {step === 'verification' && (
              <div className={styles.verificationSection}>
                <div className={styles.verificationSummary}>
                  <h4 className={styles.summaryTitle}>Zusammenfassung</h4>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Rolle:</span>
                    <span className={styles.summaryValue}>
                      {formData.userType === 'buyer' ? 'Käufer' : 'Verkäufer'}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Name:</span>
                    <span className={styles.summaryValue}>
                      {formData.firstName} {formData.lastName}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>E-Mail:</span>
                    <span className={styles.summaryValue}>{formData.email}</span>
                  </div>
                  {formData.companyName && (
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Firma:</span>
                      <span className={styles.summaryValue}>{formData.companyName}</span>
                    </div>
                  )}
                </div>

                <div className={styles.termsSection}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Ich akzeptiere die <a href="/terms" target="_blank" className={styles.link}>AGB</a> und 
                    <a href="/privacy" target="_blank" className={styles.link}> Datenschutzerklärung</a>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.buttonGroup}>
            {step !== 'role' && (
              <button className={styles.backButton} onClick={handleBack}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Zurück
              </button>
            )}
            <button 
              className={styles.nextButton}
              onClick={step === 'verification' ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Registrierung...
                </>
              ) : step === 'verification' ? (
                'Registrierung abschließen'
              ) : (
                'Weiter'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
