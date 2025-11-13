"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { DepositModal } from "@/components/DepositModal";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./wallet.module.css";

// ===============================================
// TYPE DEFINITIONS
// ===============================================

interface Wallet {
  id: string;
  user_id: string;
  balance_eur: number;
  balance_usd: number;
  balance_gbp: number;
  reserved_eur: number;
  reserved_usd: number;
  reserved_gbp: number;
  status: string;
  kyc_verified: boolean;
  daily_limit_eur: number;
  monthly_limit_eur: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference_number: string;
  created_at: string;
  completed_at: string | null;
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'sepa' | 'paypal';
  bank_name?: string;
  account_holder?: string;
  iban?: string;
  card_last4?: string;
  card_brand?: string;
  is_verified: boolean;
  is_default: boolean;
  status: string;
  last_used_at: string | null;
}

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function WalletPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // ===============================================
  // DATA LOADING
  // ===============================================

  const loadWalletData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      // Load or create wallet
      let { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If wallet doesn't exist, create one
      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            status: 'active'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating wallet:', createError);
        } else {
          walletData = newWallet;
        }
      }

      setWallet(walletData);

      // Load recent transactions (last 10)
      if (walletData) {
        const { data: transactionsData } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setTransactions(transactionsData || []);

        // Load payment methods
        const { data: paymentMethodsData } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('is_default', { ascending: false });

        setPaymentMethods(paymentMethodsData || []);
      }

    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/sign-in?redirect_to=/wallet');
      return;
    }
    loadWalletData();
  }, [authLoading, user, loadWalletData, router]);

  // ===============================================
  // HELPER FUNCTIONS
  // ===============================================

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
        return '↓';
      case 'withdrawal':
      case 'transfer_out':
        return '↑';
      case 'payment':
        return '→';
      case 'refund':
        return '←';
      default:
        return '•';
    }
  };

  const getTransactionIconClass = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
      case 'refund':
        return styles.iconDeposit;
      case 'withdrawal':
      case 'transfer_out':
        return styles.iconWithdrawal;
      case 'payment':
        return styles.iconPayment;
      default:
        return styles.iconTransfer;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'pending':
      case 'processing':
        return styles.statusPending;
      case 'failed':
      case 'cancelled':
        return styles.statusFailed;
      default:
        return styles.statusPending;
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

  const getBalance = (currency: 'EUR' | 'USD' | 'GBP') => {
    if (!wallet) return 0;
    switch (currency) {
      case 'EUR':
        return wallet.balance_eur;
      case 'USD':
        return wallet.balance_usd;
      case 'GBP':
        return wallet.balance_gbp;
    }
  };

  const getReserved = (currency: 'EUR' | 'USD' | 'GBP') => {
    if (!wallet) return 0;
    switch (currency) {
      case 'EUR':
        return wallet.reserved_eur;
      case 'USD':
        return wallet.reserved_usd;
      case 'GBP':
        return wallet.reserved_gbp;
    }
  };

  const getAvailable = (currency: 'EUR' | 'USD' | 'GBP') => {
    return getBalance(currency) - getReserved(currency);
  };

  // ===============================================
  // RENDER: LOADING STATE
  // ===============================================

  if (authLoading || loading) {
    return (
      <main style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Lade Wallet-Daten...</p>
        </div>
      </main>
    );
  }

  // ===============================================
  // RENDER: MAIN CONTENT
  // ===============================================

  return (
    <main className={styles.walletPage}>
      <Header />
      
      <div className={styles.container}>
        {/* Dashboard Header */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <h1 className={styles.title}>Wallet</h1>
              <p className={styles.subtitle}>
                Verwalten Sie Ihr Guthaben und Transaktionen
              </p>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                onClick={() => router.push('/dealroom')}
              >
                <span className={styles.actionIcon}>←</span>
                Zurück zum Dealroom
              </button>
            </div>
          </div>
        </div>

        {/* KYC Banner - if not verified */}
        {wallet && !wallet.kyc_verified && (
          <div className={styles.kycBanner}>
            <div className={styles.kycBannerIcon}>⚠️</div>
            <div className={styles.kycBannerContent}>
              <h3 className={styles.kycBannerTitle}>KYC-Verifizierung ausstehend</h3>
              <p className={styles.kycBannerText}>
                Bitte verifizieren Sie Ihre Identität, um alle Wallet-Funktionen nutzen zu können. 
                Ohne Verifizierung sind Ihre Limits eingeschränkt.
              </p>
            </div>
            <button className={styles.kycBannerButton}>
              Jetzt verifizieren
            </button>
          </div>
        )}

        {/* Balance Cards */}
        <div className={styles.balanceGrid}>
          {/* EUR Balance */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceCardHeader}>
              <span className={styles.balanceLabel}>Guthaben</span>
              <span className={styles.currencyBadge}>EUR</span>
            </div>
            <div className={styles.balanceAmount}>
              {formatCurrency(getBalance('EUR'), 'EUR')}
            </div>
            <div className={styles.balanceSubtext}>
              Verfügbar: {formatCurrency(getAvailable('EUR'), 'EUR')}
            </div>
            <div className={styles.balanceFooter}>
              <div className={styles.balanceFooterItem}>
                <span className={styles.balanceFooterLabel}>Reserviert</span>
                <span className={styles.balanceFooterValue}>
                  {formatCurrency(getReserved('EUR'), 'EUR')}
                </span>
              </div>
              <div className={styles.balanceFooterItem}>
                <span className={styles.balanceFooterLabel}>Tageslimit</span>
                <span className={styles.balanceFooterValue}>
                  {formatCurrency(wallet?.daily_limit_eur || 0, 'EUR')}
                </span>
              </div>
            </div>
          </div>

          {/* USD Balance */}
          <div className={styles.balanceCard} style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
            <div className={styles.balanceCardHeader}>
              <span className={styles.balanceLabel}>Guthaben</span>
              <span className={styles.currencyBadge}>USD</span>
            </div>
            <div className={styles.balanceAmount}>
              {formatCurrency(getBalance('USD'), 'USD')}
            </div>
            <div className={styles.balanceSubtext}>
              Verfügbar: {formatCurrency(getAvailable('USD'), 'USD')}
            </div>
            <div className={styles.balanceFooter}>
              <div className={styles.balanceFooterItem}>
                <span className={styles.balanceFooterLabel}>Reserviert</span>
                <span className={styles.balanceFooterValue}>
                  {formatCurrency(getReserved('USD'), 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* GBP Balance */}
          <div className={styles.balanceCard} style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
            <div className={styles.balanceCardHeader}>
              <span className={styles.balanceLabel}>Guthaben</span>
              <span className={styles.currencyBadge}>GBP</span>
            </div>
            <div className={styles.balanceAmount}>
              {formatCurrency(getBalance('GBP'), 'GBP')}
            </div>
            <div className={styles.balanceSubtext}>
              Verfügbar: {formatCurrency(getAvailable('GBP'), 'GBP')}
            </div>
            <div className={styles.balanceFooter}>
              <div className={styles.balanceFooterItem}>
                <span className={styles.balanceFooterLabel}>Reserviert</span>
                <span className={styles.balanceFooterValue}>
                  {formatCurrency(getReserved('GBP'), 'GBP')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            onClick={() => setShowDepositModal(true)}
          >
            <span className={styles.actionIcon}>💸</span>
            Einzahlen
          </button>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
            onClick={() => setShowWithdrawalModal(true)}
          >
            <span className={styles.actionIcon}>💰</span>
            Auszahlen
          </button>
          <button 
            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
            onClick={() => setShowTransferModal(true)}
          >
            <span className={styles.actionIcon}>🔄</span>
            Überweisung
          </button>
          <button className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>
            <span className={styles.actionIcon}>📄</span>
            Export
          </button>
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Transactions Section */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Letzte Transaktionen</h2>
                <a href="#" className={styles.sectionAction}>
                  Alle ansehen →
                </a>
              </div>

              {transactions.length > 0 ? (
                <div className={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionLeft}>
                        <div className={`${styles.transactionIcon} ${getTransactionIconClass(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className={styles.transactionInfo}>
                          <div className={styles.transactionTitle}>
                            {transaction.description || 'Transaktion'}
                          </div>
                          <div className={styles.transactionMeta}>
                            <span className={styles.transactionDate}>
                              🕐 {formatDate(transaction.created_at)}
                            </span>
                            <span className={styles.transactionReference}>
                              #{transaction.reference_number}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.transactionRight}>
                        <div className={`${styles.transactionAmount} ${
                          ['deposit', 'transfer_in', 'refund'].includes(transaction.type) 
                            ? styles.amountPositive 
                            : styles.amountNegative
                        }`}>
                          {['deposit', 'transfer_in', 'refund'].includes(transaction.type) ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <span className={`${styles.transactionStatus} ${getStatusBadgeClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📋</div>
                  <h3 className={styles.emptyStateTitle}>Keine Transaktionen</h3>
                  <p className={styles.emptyStateText}>
                    Sie haben noch keine Transaktionen getätigt. 
                    Starten Sie mit einer Einzahlung!
                  </p>
                  <button className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
                    Erste Einzahlung
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Payment Methods */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Zahlungsmethoden</h2>
                <a href="#" className={styles.sectionAction}>
                  + Hinzufügen
                </a>
              </div>

              {paymentMethods.length > 0 ? (
                <div className={styles.paymentMethodsList}>
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className={`${styles.paymentMethodItem} ${method.is_default ? styles.paymentMethodDefault : ''}`}
                    >
                      <div className={styles.paymentMethodLeft}>
                        <div className={styles.paymentMethodIcon}>
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div className={styles.paymentMethodInfo}>
                          <div className={styles.paymentMethodName}>
                            {method.bank_name || method.card_brand || 'Zahlungsmethode'}
                            {method.is_default && <span className={styles.defaultBadge}>Standard</span>}
                            {method.is_verified && <span className={styles.verifiedBadge}>✓</span>}
                          </div>
                          <div className={styles.paymentMethodDetails}>
                            {method.iban ? `••••${method.iban.slice(-4)}` : 
                             method.card_last4 ? `••••${method.card_last4}` : 
                             'Details nicht verfügbar'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.paymentMethodActions}>
                        <button className={styles.iconButton} title="Bearbeiten">
                          ✏️
                        </button>
                        <button className={styles.iconButton} title="Löschen">
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>💳</div>
                  <h3 className={styles.emptyStateTitle}>Keine Zahlungsmethoden</h3>
                  <p className={styles.emptyStateText}>
                    Fügen Sie eine Zahlungsmethode hinzu, um Einzahlungen vorzunehmen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        wallet={wallet}
        paymentMethods={paymentMethods}
        onSuccess={loadWalletData}
      />
      
      {/* TODO: WithdrawalModal */}
      {/* TODO: TransferModal */}
    </main>
  );
}
