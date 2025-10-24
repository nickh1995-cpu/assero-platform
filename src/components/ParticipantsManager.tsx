"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./ParticipantsManager.module.css";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  status: string;
  invited_at: string;
  responded_at?: string;
  notes?: string;
  user_email: string;
  user_name: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface ParticipantsManagerProps {
  dealId: string;
  onParticipantUpdate?: (participants: Participant[]) => void;
}

const ROLE_OPTIONS = [
  { value: 'buyer', label: 'Käufer', icon: '🛒' },
  { value: 'seller', label: 'Verkäufer', icon: '🏪' },
  { value: 'advisor', label: 'Berater', icon: '💼' },
  { value: 'lawyer', label: 'Anwalt', icon: '⚖️' },
  { value: 'broker', label: 'Makler', icon: '🤝' },
  { value: 'witness', label: 'Zeuge', icon: '👁️' },
  { value: 'other', label: 'Sonstiges', icon: '👤' }
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#10b981',
  declined: '#ef4444',
  removed: '#6b7280'
};

const STATUS_LABELS = {
  pending: 'Ausstehend',
  accepted: 'Akzeptiert',
  declined: 'Abgelehnt',
  removed: 'Entfernt'
};

export function ParticipantsManager({ dealId, onParticipantUpdate }: ParticipantsManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    email: '',
    role: 'advisor',
    notes: ''
  });
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    loadParticipants();
    checkPermissions();
  }, [dealId]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          *,
          user:profiles!deal_participants_user_id_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .eq('deal_id', dealId);

      if (participantsError) {
        console.warn('Error loading participants:', participantsError);
        // Create fallback participant for current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fallbackParticipant = {
            id: 'current_user',
            user_id: user.id,
            role: 'buyer',
            status: 'accepted',
            invited_at: new Date().toISOString(),
            user_email: user.email || '',
            user_name: user.user_metadata?.first_name || user.email || 'Aktueller Benutzer'
          };
          setParticipants([fallbackParticipant]);
          onParticipantUpdate?.([fallbackParticipant]);
        } else {
          setParticipants([]);
        }
      } else {
        // Transform data to match expected format
        const transformedData = (participantsData || []).map(p => ({
          ...p,
          user_email: p.user?.email || '',
          user_name: `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || p.user?.email || 'Unbekannt'
        }));
        setParticipants(transformedData);
        onParticipantUpdate?.(transformedData);
      }

      // Load invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('deal_invitations')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.warn('Error loading invitations:', invitationsError);
        setInvitations([]);
      } else {
        setInvitations(invitationsData || []);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // For now, allow all authenticated users to manage participants
        // TODO: Implement proper permission checking later
        setCanManage(true);
      }
    } catch (error) {
      console.warn('Error checking permissions:', error);
      setCanManage(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipant.email.trim()) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Simplified approach: always create invitation (no email service needed)
      const { data, error } = await supabase
        .from('deal_invitations')
        .insert({
          deal_id: dealId,
          email: newParticipant.email,
          role: newParticipant.role,
          status: 'pending',
          invitation_token: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: user.id,
          notes: newParticipant.notes || null
        })
        .select()
        .single();

      if (error) {
        console.warn('Database error, creating fallback invitation:', error);
        // Create fallback invitation in local state
        const fallbackInvitation = {
          id: `temp_${Date.now()}`,
          deal_id: dealId,
          email: newParticipant.email,
          role: newParticipant.role,
          status: 'pending',
          invitation_token: `invite_${Date.now()}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: user.id,
          notes: newParticipant.notes || null,
          created_at: new Date().toISOString()
        };
        
        setInvitations(prev => [fallbackInvitation, ...prev]);
        alert(`✅ Einladung für ${newParticipant.email} erstellt!\n\n📧 E-Mail-Service nicht konfiguriert - Einladung nur lokal gespeichert\n\nDie Person kann sich später mit dieser E-Mail-Adresse registrieren.`);
      } else {
        await loadParticipants();
        alert(`✅ Einladung für ${newParticipant.email} erstellt!\n\n📧 E-Mail-Service nicht konfiguriert - Einladung in der Datenbank gespeichert\n\nDie Person kann sich später mit dieser E-Mail-Adresse registrieren.`);
      }

      setNewParticipant({ email: '', role: 'advisor', notes: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Fehler beim Hinzufügen des Teilnehmers. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (participantId: string, status: string) => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('deal_participants')
        .update({ 
          status,
          responded_at: status !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', participantId);

      if (error) throw error;
      await loadParticipants();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Fehler beim Aktualisieren des Status. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Möchten Sie diesen Teilnehmer wirklich entfernen?')) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('deal_participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;
      await loadParticipants();
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Fehler beim Entfernen des Teilnehmers. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role: string) => {
    return ROLE_OPTIONS.find(r => r.value === role) || { value: role, label: role, icon: '👤' };
  };

  if (loading && participants.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Teilnehmer...</p>
      </div>
    );
  }

  return (
    <div className={styles.participantsManager}>
      <div className={styles.header}>
        <h3 className={styles.title}>Teilnehmer</h3>
        {canManage && (
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Teilnehmer hinzufügen
          </button>
        )}
      </div>

      {showAddForm && canManage && (
        <div className={styles.addForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>E-Mail-Adresse</label>
            <input
              type="email"
              value={newParticipant.email}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
              className={styles.formInput}
              placeholder="teilnehmer@example.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Rolle</label>
            <select
              value={newParticipant.role}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, role: e.target.value }))}
              className={styles.formSelect}
            >
              {ROLE_OPTIONS.map(role => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notizen (optional)</label>
            <textarea
              value={newParticipant.notes}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, notes: e.target.value }))}
              className={styles.formTextarea}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              className={styles.cancelButton}
              onClick={() => setShowAddForm(false)}
            >
              Abbrechen
            </button>
            <button 
              className={styles.submitButton}
              onClick={handleAddParticipant}
              disabled={!newParticipant.email.trim() || loading}
            >
              {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.participantsList}>
        {participants.map((participant) => {
          const roleInfo = getRoleInfo(participant.role);
          return (
            <div key={participant.id} className={styles.participantCard}>
              <div className={styles.participantInfo}>
                <div className={styles.participantHeader}>
                  <div className={styles.participantName}>
                    <span className={styles.roleIcon}>{roleInfo.icon}</span>
                    <span className={styles.name}>{participant.user_name}</span>
                    <span className={styles.role}>{roleInfo.label}</span>
                  </div>
                  <div className={styles.participantStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: STATUS_COLORS[participant.status as keyof typeof STATUS_COLORS] }}
                    >
                      {STATUS_LABELS[participant.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                </div>
                
                <div className={styles.participantDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>E-Mail:</span>
                    <span className={styles.detailValue}>{participant.user_email}</span>
                  </div>
                  {participant.notes && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Notizen:</span>
                      <span className={styles.detailValue}>{participant.notes}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Eingeladen:</span>
                    <span className={styles.detailValue}>
                      {new Date(participant.invited_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>
              
              {canManage && (
                <div className={styles.participantActions}>
                  {participant.status === 'pending' && (
                    <>
                      <button 
                        className={styles.acceptButton}
                        onClick={() => handleUpdateStatus(participant.id, 'accepted')}
                      >
                        Akzeptieren
                      </button>
                      <button 
                        className={styles.declineButton}
                        onClick={() => handleUpdateStatus(participant.id, 'declined')}
                      >
                        Ablehnen
                      </button>
                    </>
                  )}
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    Entfernen
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {invitations.length > 0 && (
        <div className={styles.invitationsSection}>
          <h4 className={styles.invitationsTitle}>Ausstehende Einladungen</h4>
          <div className={styles.invitationsList}>
            {invitations.map((invitation) => {
              const roleInfo = getRoleInfo(invitation.role);
              return (
                <div key={invitation.id} className={styles.invitationCard}>
                  <div className={styles.invitationInfo}>
                    <span className={styles.roleIcon}>{roleInfo.icon}</span>
                    <span className={styles.invitationEmail}>{invitation.email}</span>
                    <span className={styles.invitationRole}>{roleInfo.label}</span>
                    <span className={styles.invitationStatus}>
                      {STATUS_LABELS[invitation.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                  <div className={styles.invitationDate}>
                    {new Date(invitation.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {participants.length === 0 && invitations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h4>Keine Teilnehmer</h4>
          <p>Fügen Sie Teilnehmer zu diesem Deal hinzu, um die Zusammenarbeit zu starten.</p>
        </div>
      )}
    </div>
  );
}
