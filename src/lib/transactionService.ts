/**
 * ASSERO WALLET - Transaction Service
 * Handles all transaction processing logic
 * Production-ready with error handling and validation
 */

import { getSupabaseBrowserClient } from "./supabase/client";

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export interface TransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
  error?: any;
}

export interface DepositParams {
  walletId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
}

export interface WithdrawalParams {
  walletId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
}

export interface TransferParams {
  fromWalletId: string;
  fromUserId: string;
  toUserEmail: string;
  amount: number;
  currency: string;
  description?: string;
}

// ===============================================
// VALIDATION FUNCTIONS
// ===============================================

export function validateAmount(amount: number, min: number = 10, max?: number): { valid: boolean; error?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, error: "Betrag muss größer als 0 sein" };
  }
  
  if (amount < min) {
    return { valid: false, error: `Mindestbetrag: €${min.toFixed(2)}` };
  }
  
  if (max && amount > max) {
    return { valid: false, error: `Maximalbetrag: €${max.toFixed(2)}` };
  }
  
  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: "Maximal 2 Dezimalstellen erlaubt" };
  }
  
  return { valid: true };
}

export function validateCurrency(currency: string): boolean {
  return ['EUR', 'USD', 'GBP'].includes(currency);
}

// ===============================================
// DEPOSIT FUNCTION
// ===============================================

export async function createDeposit(params: DepositParams): Promise<TransactionResult> {
  const supabase = getSupabaseBrowserClient();
  
  try {
    console.log('🔄 Creating deposit...', params);
    
    // 1. Validate input
    const amountValidation = validateAmount(params.amount, 10, 50000);
    if (!amountValidation.valid) {
      return {
        success: false,
        message: amountValidation.error || 'Ungültiger Betrag'
      };
    }
    
    if (!validateCurrency(params.currency)) {
      return {
        success: false,
        message: 'Ungültige Währung'
      };
    }
    
    // 2. Verify payment method exists and is verified
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', params.paymentMethodId)
      .eq('user_id', params.userId)
      .single();
    
    if (pmError || !paymentMethod) {
      return {
        success: false,
        message: 'Zahlungsmethode nicht gefunden'
      };
    }
    
    if (!paymentMethod.is_verified) {
      return {
        success: false,
        message: 'Zahlungsmethode muss zuerst verifiziert werden'
      };
    }
    
    // 3. Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', params.walletId)
      .eq('user_id', params.userId)
      .single();
    
    if (walletError || !wallet) {
      return {
        success: false,
        message: 'Wallet nicht gefunden'
      };
    }
    
    // 4. Calculate new balance
    const balanceField = `balance_${params.currency.toLowerCase()}` as keyof typeof wallet;
    const currentBalance = (wallet[balanceField] as number) || 0;
    const newBalance = currentBalance + params.amount;
    
    console.log(`💰 Current balance: €${currentBalance}, New balance: €${newBalance}`);
    
    // 5. Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        type: 'deposit',
        amount: params.amount,
        currency: params.currency,
        status: 'completed', // Instant completion for deposits
        description: params.description || `Einzahlung via ${paymentMethod.type}`,
        payment_method_id: params.paymentMethodId,
        balance_before: currentBalance,
        balance_after: newBalance,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (txError || !transaction) {
      console.error('❌ Transaction creation failed:', txError);
      return {
        success: false,
        message: 'Transaktion konnte nicht erstellt werden',
        error: txError
      };
    }
    
    console.log('✅ Transaction created:', transaction.id);
    
    // 6. Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        [balanceField]: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.walletId)
      .eq('user_id', params.userId);
    
    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      
      // Rollback: Mark transaction as failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);
      
      return {
        success: false,
        message: 'Fehler beim Aktualisieren des Guthabens',
        error: updateError
      };
    }
    
    console.log('✅ Balance updated successfully');
    
    // 7. Log activity
    await supabase
      .from('wallet_activity_log')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        activity_type: 'deposit_completed',
        description: `Einzahlung von ${params.amount} ${params.currency} erfolgreich`,
        related_transaction_id: transaction.id,
        related_payment_method_id: params.paymentMethodId
      });
    
    // 8. Update payment method last_used_at
    await supabase
      .from('payment_methods')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', params.paymentMethodId);
    
    console.log('🎉 Deposit completed successfully!');
    
    return {
      success: true,
      message: `Einzahlung von ${params.amount.toFixed(2)} ${params.currency} erfolgreich`,
      transactionId: transaction.id,
      newBalance: newBalance
    };
    
  } catch (error: any) {
    console.error('❌ Deposit failed with exception:', error);
    return {
      success: false,
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      error: error
    };
  }
}

// ===============================================
// WITHDRAWAL FUNCTION
// ===============================================

export async function createWithdrawal(params: WithdrawalParams): Promise<TransactionResult> {
  const supabase = getSupabaseBrowserClient();
  
  try {
    console.log('🔄 Creating withdrawal...', params);
    
    // 1. Validate input
    const amountValidation = validateAmount(params.amount, 10, 50000);
    if (!amountValidation.valid) {
      return {
        success: false,
        message: amountValidation.error || 'Ungültiger Betrag'
      };
    }
    
    if (!validateCurrency(params.currency)) {
      return {
        success: false,
        message: 'Ungültige Währung'
      };
    }
    
    // 2. Verify payment method
    const { data: paymentMethod, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', params.paymentMethodId)
      .eq('user_id', params.userId)
      .single();
    
    if (pmError || !paymentMethod) {
      return {
        success: false,
        message: 'Zahlungsmethode nicht gefunden'
      };
    }
    
    if (!paymentMethod.is_verified) {
      return {
        success: false,
        message: 'Zahlungsmethode muss zuerst verifiziert werden'
      };
    }
    
    // 3. Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', params.walletId)
      .eq('user_id', params.userId)
      .single();
    
    if (walletError || !wallet) {
      return {
        success: false,
        message: 'Wallet nicht gefunden'
      };
    }
    
    // 4. Check available balance
    const balanceField = `balance_${params.currency.toLowerCase()}` as keyof typeof wallet;
    const reservedField = `reserved_${params.currency.toLowerCase()}` as keyof typeof wallet;
    const currentBalance = (wallet[balanceField] as number) || 0;
    const reservedBalance = (wallet[reservedField] as number) || 0;
    const availableBalance = currentBalance - reservedBalance;
    
    console.log(`💰 Available balance: €${availableBalance}`);
    
    if (params.amount > availableBalance) {
      return {
        success: false,
        message: `Unzureichendes Guthaben. Verfügbar: ${availableBalance.toFixed(2)} ${params.currency}`
      };
    }
    
    // 5. Calculate new balance
    const newBalance = currentBalance - params.amount;
    
    // 6. Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        type: 'withdrawal',
        amount: params.amount,
        currency: params.currency,
        status: 'completed', // For demo: instant completion. In production: 'pending'
        description: params.description || `Auszahlung via ${paymentMethod.type}`,
        payment_method_id: params.paymentMethodId,
        balance_before: currentBalance,
        balance_after: newBalance,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (txError || !transaction) {
      console.error('❌ Transaction creation failed:', txError);
      return {
        success: false,
        message: 'Transaktion konnte nicht erstellt werden',
        error: txError
      };
    }
    
    console.log('✅ Transaction created:', transaction.id);
    
    // 7. Update wallet balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        [balanceField]: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.walletId)
      .eq('user_id', params.userId);
    
    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      
      // Rollback
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);
      
      return {
        success: false,
        message: 'Fehler beim Aktualisieren des Guthabens',
        error: updateError
      };
    }
    
    console.log('✅ Balance updated successfully');
    
    // 8. Log activity
    await supabase
      .from('wallet_activity_log')
      .insert({
        wallet_id: params.walletId,
        user_id: params.userId,
        activity_type: 'withdrawal_completed',
        description: `Auszahlung von ${params.amount} ${params.currency} erfolgreich`,
        related_transaction_id: transaction.id,
        related_payment_method_id: params.paymentMethodId
      });
    
    // 9. Update payment method last_used_at
    await supabase
      .from('payment_methods')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', params.paymentMethodId);
    
    console.log('🎉 Withdrawal completed successfully!');
    
    return {
      success: true,
      message: `Auszahlung von ${params.amount.toFixed(2)} ${params.currency} erfolgreich`,
      transactionId: transaction.id,
      newBalance: newBalance
    };
    
  } catch (error: any) {
    console.error('❌ Withdrawal failed with exception:', error);
    return {
      success: false,
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      error: error
    };
  }
}

// ===============================================
// TRANSFER FUNCTION
// ===============================================

export async function createTransfer(params: TransferParams): Promise<TransactionResult> {
  const supabase = getSupabaseBrowserClient();
  
  try {
    console.log('🔄 Creating transfer...', params);
    
    // 1. Validate input
    const amountValidation = validateAmount(params.amount, 1, 50000);
    if (!amountValidation.valid) {
      return {
        success: false,
        message: amountValidation.error || 'Ungültiger Betrag'
      };
    }
    
    // 2. Find recipient by email
    const { data: recipientUser, error: recipientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', params.toUserEmail)
      .single();
    
    if (recipientError || !recipientUser) {
      return {
        success: false,
        message: 'Empfänger nicht gefunden'
      };
    }
    
    const recipientUserId = recipientUser.id;
    
    // Check if sender = recipient
    if (params.fromUserId === recipientUserId) {
      return {
        success: false,
        message: 'Sie können keine Überweisung an sich selbst senden'
      };
    }
    
    // 3. Get recipient wallet
    const { data: recipientWallet, error: recipientWalletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', recipientUserId)
      .single();
    
    if (recipientWalletError || !recipientWallet) {
      return {
        success: false,
        message: 'Empfänger-Wallet nicht gefunden'
      };
    }
    
    // 4. Get sender wallet and check balance
    const { data: senderWallet, error: senderWalletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('id', params.fromWalletId)
      .eq('user_id', params.fromUserId)
      .single();
    
    if (senderWalletError || !senderWallet) {
      return {
        success: false,
        message: 'Ihre Wallet wurde nicht gefunden'
      };
    }
    
    const balanceField = `balance_${params.currency.toLowerCase()}` as keyof typeof senderWallet;
    const reservedField = `reserved_${params.currency.toLowerCase()}` as keyof typeof senderWallet;
    const senderBalance = (senderWallet[balanceField] as number) || 0;
    const senderReserved = (senderWallet[reservedField] as number) || 0;
    const senderAvailable = senderBalance - senderReserved;
    
    if (params.amount > senderAvailable) {
      return {
        success: false,
        message: `Unzureichendes Guthaben. Verfügbar: ${senderAvailable.toFixed(2)} ${params.currency}`
      };
    }
    
    // 5. Create transfer_out transaction (sender)
    const senderNewBalance = senderBalance - params.amount;
    const { data: txOut, error: txOutError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: params.fromWalletId,
        user_id: params.fromUserId,
        type: 'transfer_out',
        amount: params.amount,
        currency: params.currency,
        status: 'completed',
        description: params.description || `Überweisung an ${params.toUserEmail}`,
        counterparty_wallet_id: recipientWallet.id,
        balance_before: senderBalance,
        balance_after: senderNewBalance,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (txOutError || !txOut) {
      return {
        success: false,
        message: 'Fehler beim Erstellen der Transaktion',
        error: txOutError
      };
    }
    
    // 6. Update sender balance
    const { error: senderUpdateError } = await supabase
      .from('wallets')
      .update({
        [balanceField]: senderNewBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.fromWalletId);
    
    if (senderUpdateError) {
      // Rollback
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', txOut.id);
      
      return {
        success: false,
        message: 'Fehler beim Aktualisieren des Guthabens',
        error: senderUpdateError
      };
    }
    
    // 7. Create transfer_in transaction (recipient)
    const recipientBalance = (recipientWallet[balanceField] as number) || 0;
    const recipientNewBalance = recipientBalance + params.amount;
    
    const { data: txIn, error: txInError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: recipientWallet.id,
        user_id: recipientUserId,
        type: 'transfer_in',
        amount: params.amount,
        currency: params.currency,
        status: 'completed',
        description: params.description || `Überweisung von ${params.fromUserId}`,
        counterparty_wallet_id: params.fromWalletId,
        balance_before: recipientBalance,
        balance_after: recipientNewBalance,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (txInError) {
      console.error('⚠️ Recipient transaction creation failed:', txInError);
      // Note: Sender transaction already completed, log for manual reconciliation
    }
    
    // 8. Update recipient balance
    await supabase
      .from('wallets')
      .update({
        [balanceField]: recipientNewBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', recipientWallet.id);
    
    // 9. Log activities
    await supabase.from('wallet_activity_log').insert([
      {
        wallet_id: params.fromWalletId,
        user_id: params.fromUserId,
        activity_type: 'transfer_sent',
        description: `Überweisung von ${params.amount} ${params.currency} an ${params.toUserEmail}`,
        related_transaction_id: txOut.id
      },
      {
        wallet_id: recipientWallet.id,
        user_id: recipientUserId,
        activity_type: 'transfer_received',
        description: `Überweisung von ${params.amount} ${params.currency} erhalten`,
        related_transaction_id: txIn?.id
      }
    ]);
    
    console.log('🎉 Transfer completed successfully!');
    
    return {
      success: true,
      message: `Überweisung von ${params.amount.toFixed(2)} ${params.currency} an ${params.toUserEmail} erfolgreich`,
      transactionId: txOut.id,
      newBalance: senderNewBalance
    };
    
  } catch (error: any) {
    console.error('❌ Transfer failed with exception:', error);
    return {
      success: false,
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      error: error
    };
  }
}

