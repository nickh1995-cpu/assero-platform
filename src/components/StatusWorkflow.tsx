"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./StatusWorkflow.module.css";

interface StatusStep {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  isActive: boolean;
  isCompleted: boolean;
  isNext: boolean;
  canTransition: boolean;
  requirements?: string[];
  estimatedDays?: number;
}

interface StatusWorkflowProps {
  dealId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export function StatusWorkflow({ dealId, currentStatus, onStatusChange }: StatusWorkflowProps) {
  const [steps, setSteps] = useState<StatusStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const statusConfig = {
    interest: {
      name: 'Interesse',
      description: 'Erstes Interesse am Deal',
      icon: '👁️',
      requirements: ['Kontaktaufnahme', 'Basis-Informationen'],
      estimatedDays: 1
    },
    negotiation: {
      name: 'Verhandlung',
      description: 'Preis und Bedingungen verhandeln',
      icon: '🤝',
      requirements: ['Preisverhandlung', 'Bedingungen klären'],
      estimatedDays: 3
    },
    'due-diligence': {
      name: 'Due Diligence',
      description: 'Detaillierte Prüfung des Assets',
      icon: '🔍',
      requirements: ['Dokumentenprüfung', 'Bewertung', 'Rechtliche Prüfung'],
      estimatedDays: 7
    },
    contract: {
      name: 'Vertrag',
      description: 'Vertragsverhandlung und -abschluss',
      icon: '📝',
      requirements: ['Vertragsentwurf', 'Rechtliche Prüfung', 'Unterschrift'],
      estimatedDays: 5
    },
    closed: {
      name: 'Abgeschlossen',
      description: 'Deal erfolgreich abgeschlossen',
      icon: '✅',
      requirements: ['Zahlung', 'Übergabe', 'Dokumentation'],
      estimatedDays: 2
    },
    cancelled: {
      name: 'Storniert',
      description: 'Deal wurde storniert',
      icon: '❌',
      requirements: ['Stornierungsgrund', 'Dokumentation'],
      estimatedDays: 1
    }
  };

  const statusFlow = ['interest', 'negotiation', 'due-diligence', 'contract', 'closed'];

  useEffect(() => {
    updateSteps();
  }, [currentStatus]);

  const updateSteps = () => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    const newSteps: StatusStep[] = statusFlow.map((status, index) => {
      const config = statusConfig[status as keyof typeof statusConfig];
      const isActive = status === currentStatus;
      const isCompleted = index < currentIndex;
      const isNext = index === currentIndex + 1;
      const canTransition = index <= currentIndex + 1;

      return {
        id: status,
        name: config.name,
        label: config.name,
        description: config.description,
        icon: config.icon,
        isActive,
        isCompleted,
        isNext,
        canTransition,
        requirements: config.requirements,
        estimatedDays: config.estimatedDays
      };
    });

    setSteps(newSteps);
  };

  const handleStatusTransition = async (newStatus: string) => {
    if (!canTransitionTo(newStatus)) return;

    setTransitioning(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Update deal status
      const { error: updateError } = await supabase
        .from("dealroom")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", dealId);

      if (updateError) throw updateError;

      // Create status change message
      const { error: messageError } = await supabase
        .rpc('create_status_change_message', {
          p_deal_id: dealId,
          p_old_status: currentStatus,
          p_new_status: newStatus,
          p_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (messageError) {
        console.warn('Could not create status change message:', messageError);
      }

      // Update local state
      onStatusChange(newStatus);
      
    } catch (error) {
      console.error('Error transitioning status:', error);
      alert('Fehler beim Ändern des Status. Bitte versuchen Sie es erneut.');
    } finally {
      setTransitioning(false);
    }
  };

  const canTransitionTo = (targetStatus: string) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    const targetIndex = statusFlow.indexOf(targetStatus);
    
    // Can only move forward one step or backward
    return targetIndex <= currentIndex + 1 && targetIndex >= 0;
  };

  const getStatusProgress = () => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return ((currentIndex + 1) / statusFlow.length) * 100;
  };

  const getEstimatedTimeRemaining = () => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    const remainingSteps = statusFlow.slice(currentIndex);
    
    return remainingSteps.reduce((total, status) => {
      const config = statusConfig[status as keyof typeof statusConfig];
      return total + (config.estimatedDays || 0);
    }, 0);
  };

  return (
    <div className={styles.statusWorkflow}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <div className={styles.progressInfo}>
          <h3 className={styles.sectionTitle}>Deal Status</h3>
          <div className={styles.progressStats}>
            <span className={styles.currentStatus}>
              {statusConfig[currentStatus as keyof typeof statusConfig]?.name || currentStatus}
            </span>
            <span className={styles.progressPercentage}>
              {Math.round(getStatusProgress())}% abgeschlossen
            </span>
          </div>
        </div>
        <div className={styles.timeEstimate}>
          <span className={styles.estimatedTime}>
            ⏱️ ~{getEstimatedTimeRemaining()} Tage verbleibend
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${getStatusProgress()}%` }}
        ></div>
      </div>

      {/* Status Steps */}
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`${styles.stepItem} ${
              step.isActive ? styles.stepActive : 
              step.isCompleted ? styles.stepCompleted : 
              step.isNext ? styles.stepNext : 
              styles.stepInactive
            }`}
          >
            <div className={styles.stepContent}>
              <div className={styles.stepIcon}>
                <span className={styles.stepIconText}>{step.icon}</span>
                {step.isCompleted && (
                  <div className={styles.completedBadge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className={styles.stepInfo}>
                <h4 className={styles.stepName}>{step.name}</h4>
                <p className={styles.stepDescription}>{step.description}</p>
                
                {step.requirements && step.requirements.length > 0 && (
                  <div className={styles.stepRequirements}>
                    <span className={styles.requirementsLabel}>Anforderungen:</span>
                    <ul className={styles.requirementsList}>
                      {step.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className={styles.requirementItem}>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.estimatedDays && (
                  <div className={styles.stepTimeline}>
                    <span className={styles.timelineIcon}>⏱️</span>
                    <span className={styles.timelineText}>
                      ~{step.estimatedDays} Tag{step.estimatedDays !== 1 ? 'e' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={styles.stepActions}>
                {step.canTransition && !step.isActive && !step.isCompleted && (
                  <button
                    className={styles.transitionButton}
                    onClick={() => handleStatusTransition(step.id)}
                    disabled={transitioning}
                  >
                    {transitioning ? 'Wechselt...' : 'Wechseln'}
                  </button>
                )}
                
                {step.isActive && (
                  <div className={styles.currentBadge}>
                    <span>Aktuell</span>
                  </div>
                )}
                
                {step.isCompleted && (
                  <div className={styles.completedBadge}>
                    <span>Abgeschlossen</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={styles.stepConnector}>
                <div className={styles.connectorLine}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h4 className={styles.actionsTitle}>Schnellaktionen</h4>
        <div className={styles.actionsGrid}>
          <button 
            className={styles.actionButton}
            onClick={() => handleStatusTransition('cancelled')}
            disabled={currentStatus === 'cancelled' || transitioning}
          >
            <span className={styles.actionIcon}>❌</span>
            <span className={styles.actionLabel}>Deal stornieren</span>
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={() => handleStatusTransition('closed')}
            disabled={!canTransitionTo('closed') || transitioning}
          >
            <span className={styles.actionIcon}>✅</span>
            <span className={styles.actionLabel}>Deal abschließen</span>
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={() => window.open(`/dealroom?id=${dealId}`, '_blank')}
          >
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Deal öffnen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
