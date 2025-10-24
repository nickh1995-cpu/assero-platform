"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./TeamWorkspace.module.css";

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  permissions: string[];
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  members: TeamMember[];
  settings: WorkspaceSettings;
}

interface WorkspaceSettings {
  allow_guest_access: boolean;
  require_approval: boolean;
  default_permissions: string[];
  notification_settings: NotificationSettings;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  mention_notifications: boolean;
  update_notifications: boolean;
}

interface TeamWorkspaceProps {
  workspaceId: string;
  onWorkspaceUpdate?: (workspace: Workspace) => void;
  onMemberUpdate?: (member: TeamMember) => void;
}

export function TeamWorkspace({ 
  workspaceId, 
  onWorkspaceUpdate, 
  onMemberUpdate 
}: TeamWorkspaceProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'settings' | 'activity'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'analyst' | 'viewer'>('viewer');

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("team_workspaces")
        .select(`
          *,
          members:workspace_members(
            *,
            user:profiles(*)
          )
        `)
        .eq("id", workspaceId)
        .single();

      if (error) throw error;
      setWorkspace(data);
      onWorkspaceUpdate?.(data);
    } catch (error) {
      console.error('Error loading workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteRole) return;

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("workspace_invitations")
        .insert({
          workspace_id: workspaceId,
          email: inviteEmail,
          role: inviteRole,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        });

      if (error) throw error;
      
      alert('Einladung gesendet!');
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Fehler beim Senden der Einladung.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Mitglied wirklich entfernen?')) return;

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      
      loadWorkspace();
      alert('Mitglied entfernt!');
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Fehler beim Entfernen des Mitglieds.');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      
      loadWorkspace();
      alert('Rolle aktualisiert!');
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Fehler beim Aktualisieren der Rolle.');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'analyst': return 'Analyst';
      case 'viewer': return 'Betrachter';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'manager': return '#f59e0b';
      case 'analyst': return '#2c5a78';
      case 'viewer': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Abwesend';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3>Workspace nicht gefunden</h3>
        <p>Der angeforderte Workspace existiert nicht oder Sie haben keinen Zugriff.</p>
      </div>
    );
  }

  return (
    <div className={styles.teamWorkspace}>
      {/* Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerLeft}>
          <h2 className={styles.workspaceTitle}>{workspace.name}</h2>
          <div className={styles.workspaceDescription}>{workspace.description}</div>
          <div className={styles.workspaceMeta}>
            <span className={styles.memberCount}>
              {workspace.members.length} Mitglieder
            </span>
            <span className={styles.createdDate}>
              Erstellt am {formatDate(workspace.created_at)}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.inviteButton}
            onClick={() => setShowInviteModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Einladen
          </button>
          <button className={styles.settingsButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Einstellungen
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {[
            { id: 'overview', label: 'Übersicht', icon: '📊' },
            { id: 'members', label: 'Mitglieder', icon: '👥' },
            { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
            { id: 'activity', label: 'Aktivität', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${selectedTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setSelectedTab(tab.id as any)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {selectedTab === 'overview' && (
            <div className={styles.overviewContent}>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Team-Übersicht</h3>
                    <div className={styles.cardIcon}>👥</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Gesamtmitglieder:</span>
                      <span className={styles.statValue}>{workspace.members.length}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Online:</span>
                      <span className={styles.statValue}>
                        {workspace.members.filter(m => m.status === 'online').length}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Administratoren:</span>
                      <span className={styles.statValue}>
                        {workspace.members.filter(m => m.role === 'admin').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Aktuelle Aktivität</h3>
                    <div className={styles.cardIcon}>📈</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>💬</div>
                      <div className={styles.activityText}>
                        <div className={styles.activityTitle}>Neue Nachrichten</div>
                        <div className={styles.activitySubtitle}>3 ungelesene Nachrichten</div>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>📊</div>
                      <div className={styles.activityText}>
                        <div className={styles.activityTitle}>Portfolio-Updates</div>
                        <div className={styles.activitySubtitle}>2 neue Bewertungen</div>
                      </div>
                    </div>
                    <div className={styles.activityItem}>
                      <div className={styles.activityIcon}>🔔</div>
                      <div className={styles.activityText}>
                        <div className={styles.activityTitle}>Benachrichtigungen</div>
                        <div className={styles.activitySubtitle}>5 neue Alerts</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'members' && (
            <div className={styles.membersContent}>
              <div className={styles.membersHeader}>
                <h3 className={styles.membersTitle}>Team-Mitglieder</h3>
                <button 
                  className={styles.addMemberButton}
                  onClick={() => setShowInviteModal(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Mitglied hinzufügen
                </button>
              </div>

              <div className={styles.membersList}>
                {workspace.members.map((member) => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div 
                          className={styles.statusIndicator}
                          style={{ backgroundColor: getStatusColor(member.status) }}
                        ></div>
                      </div>
                      <div className={styles.memberDetails}>
                        <h4 className={styles.memberName}>{member.name}</h4>
                        <div className={styles.memberEmail}>{member.email}</div>
                        <div className={styles.memberMeta}>
                          <span 
                            className={styles.memberRole}
                            style={{ color: getRoleColor(member.role) }}
                          >
                            {getRoleLabel(member.role)}
                          </span>
                          <span className={styles.memberStatus}>
                            {getStatusLabel(member.status)}
                          </span>
                          <span className={styles.memberLastSeen}>
                            Zuletzt gesehen: {formatDate(member.last_seen)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.memberActions}>
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Betrachter</option>
                      </select>
                      <button 
                        className={styles.removeButton}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className={styles.settingsContent}>
              <h3 className={styles.settingsTitle}>Workspace-Einstellungen</h3>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <h4 className={styles.settingTitle}>Zugriff</h4>
                  <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      <input type="checkbox" defaultChecked={workspace.settings.allow_guest_access} />
                      <span className={styles.checkmark}></span>
                      Gästezugriff erlauben
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      <input type="checkbox" defaultChecked={workspace.settings.require_approval} />
                      <span className={styles.checkmark}></span>
                      Genehmigung für neue Mitglieder erforderlich
                    </label>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <h4 className={styles.settingTitle}>Benachrichtigungen</h4>
                  <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      <input type="checkbox" defaultChecked={workspace.settings.notification_settings.email_notifications} />
                      <span className={styles.checkmark}></span>
                      E-Mail-Benachrichtigungen
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      <input type="checkbox" defaultChecked={workspace.settings.notification_settings.push_notifications} />
                      <span className={styles.checkmark}></span>
                      Push-Benachrichtigungen
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label className={styles.settingLabel}>
                      <input type="checkbox" defaultChecked={workspace.settings.notification_settings.mention_notifications} />
                      <span className={styles.checkmark}></span>
                      Erwähnungs-Benachrichtigungen
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'activity' && (
            <div className={styles.activityContent}>
              <h3 className={styles.activityTitle}>Team-Aktivität</h3>
              <div className={styles.activityTimeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>💬</div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>Neue Nachricht von Max Mustermann</div>
                    <div className={styles.timelineSubtitle}>Vor 2 Stunden</div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>📊</div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>Portfolio-Update durch Anna Schmidt</div>
                    <div className={styles.timelineSubtitle}>Vor 4 Stunden</div>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>👥</div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineTitle}>Neues Mitglied: Tom Weber</div>
                    <div className={styles.timelineSubtitle}>Gestern</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Mitglied einladen</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowInviteModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>E-Mail-Adresse</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="mitglied@beispiel.de"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rolle</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className={styles.formSelect}
                >
                  <option value="viewer">Betrachter</option>
                  <option value="analyst">Analyst</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowInviteModal(false)}
              >
                Abbrechen
              </button>
              <button 
                className={styles.inviteButton}
                onClick={handleInviteMember}
              >
                Einladung senden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
