"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./EmailConfirmationNotice.module.css";

interface EmailConfirmationNoticeProps {
  email: string;
  onConfirmed?: () => void;
  redirectTo?: string;
}

export function EmailConfirmationNotice({ 
  email, 
  onConfirmed,
  redirectTo = '/dealroom'
}: EmailConfirmationNoticeProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckConfirmation = async () => {
    setChecking(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.email_confirmed_at) {
        setMessage('✅ E-Mail bestätigt!');
        
        // Update verification status
        await supabase
          .from('profiles')
          .update({ 
            is_verified: true,
            verification_date: new Date().toISOString()
          })
          .eq('id', user.id);
        
        setTimeout(() => {
          if (onConfirmed) {
            onConfirmed();
          } else {
            router.push(redirectTo);
          }
        }, 1000);
      } else {
        setMessage('⏳ E-Mail noch nicht bestätigt. Bitte überprüfen Sie Ihr Postfach.');
      }
    } catch (error) {
      console.error('Error checking confirmation:', error);
      setMessage('❌ Fehler beim Prüfen der Bestätigung. Bitte versuchen Sie es erneut.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      setMessage('📧 Bestätigungs-E-Mail erneut gesendet! Bitte überprüfen Sie Ihr Postfach.');
    } catch (error: any) {
      console.error('Error resending email:', error);
      setMessage(`❌ Fehler beim erneuten Senden: ${error.message}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>
      
      <h2 className={styles.title}>E-Mail-Bestätigung erforderlich</h2>
      
      <div className={styles.content}>
        <p className={styles.description}>
          Wir haben Ihnen eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
        </p>
        
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>E-Mail öffnen</h3>
              <p>Überprüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner)</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Link klicken</h3>
              <p>Klicken Sie auf den Bestätigungslink in der E-Mail</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Weiter zum Dealroom</h3>
              <p>Nach der Bestätigung können Sie auf den Dealroom zugreifen</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.info}`}>
            {message}
          </div>
        )}

        <div className={styles.actions}>
          <button
            onClick={handleCheckConfirmation}
            disabled={checking}
            className={styles.btnPrimary}
          >
            {checking ? 'Prüfe...' : 'E-Mail bestätigt? Prüfen'}
          </button>
          
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className={styles.btnSecondary}
          >
            {resending ? 'Sende...' : 'E-Mail erneut senden'}
          </button>
        </div>

        <div className={styles.hint}>
          <p>💡 <strong>Tipp:</strong> Nach dem Klicken auf den Bestätigungslink können Sie oben auf "E-Mail bestätigt? Prüfen" klicken, um automatisch weitergeleitet zu werden.</p>
        </div>
      </div>
    </div>
  );
}

