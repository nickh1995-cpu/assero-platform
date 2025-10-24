"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./RoleBasedNavigation.module.css";

interface UserRole {
  role: 'buyer' | 'seller' | 'admin';
  profile: any;
  permissions: string[];
}

interface RoleBasedNavigationProps {
  onRoleChange?: (role: UserRole) => void;
}

export function RoleBasedNavigation({ onRoleChange }: RoleBasedNavigationProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user's primary role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role_type')
          .eq('user_id', user.id)
          .eq('is_primary_role', true)
          .single();

        if (roleData) {
          // Get role permissions
          const { data: permissions } = await supabase
            .from('role_permissions')
            .select('permission')
            .eq('role_type', roleData.role_type);

          // Get user profile
          let profile = null;
          if (roleData.role_type === 'buyer') {
            const { data: buyerProfile } = await supabase
              .from('buyer_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            profile = buyerProfile;
          } else if (roleData.role_type === 'seller') {
            const { data: sellerProfile } = await supabase
              .from('seller_profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            profile = sellerProfile;
          }

          const userRoleData: UserRole = {
            role: roleData.role_type,
            profile,
            permissions: permissions?.map(p => p.permission) || []
          };

          setUserRole(userRoleData);
          onRoleChange?.(userRoleData);
        }
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = async (newRole: 'buyer' | 'seller') => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role_type', newRole)
          .single();

        if (existingRole) {
          // Switch to existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ is_primary_role: false })
            .eq('user_id', user.id);

          if (!error) {
            await supabase
              .from('user_roles')
              .update({ is_primary_role: true })
              .eq('id', existingRole.id);

            loadUserRole();
            setShowRoleSwitcher(false);
          }
        } else {
          // Create new role
          const { error } = await supabase
            .from('user_roles')
            .update({ is_primary_role: false })
            .eq('user_id', user.id);

          if (!error) {
            const { error: createError } = await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role_type: newRole,
                is_primary_role: true
              });

            if (!createError) {
              loadUserRole();
              setShowRoleSwitcher(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  const getNavigationItems = () => {
    if (!userRole) return [];

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
      { id: 'profile', label: 'Profil', icon: '👤', path: '/profile' },
      { id: 'settings', label: 'Einstellungen', icon: '⚙️', path: '/settings' }
    ];

    if (userRole.role === 'buyer') {
      return [
        ...baseItems,
        { id: 'dealroom', label: 'Dealroom', icon: '🏢', path: '/dealroom' },
        { id: 'portfolio', label: 'Portfolio', icon: '💼', path: '/portfolio' },
        { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' },
        { id: 'recommendations', label: 'Empfehlungen', icon: '🤖', path: '/recommendations' }
      ];
    } else if (userRole.role === 'seller') {
      return [
        ...baseItems,
        { id: 'listings', label: 'Inserate', icon: '📋', path: '/listings' },
        { id: 'seller-dashboard', label: 'Verkäufer-Dashboard', icon: '🏪', path: '/seller-dashboard' },
        { id: 'inquiries', label: 'Anfragen', icon: '💬', path: '/inquiries' },
        { id: 'sales-analytics', label: 'Verkaufs-Analytics', icon: '📊', path: '/sales-analytics' }
      ];
    } else if (userRole.role === 'admin') {
      return [
        ...baseItems,
        { id: 'admin-dashboard', label: 'Admin-Dashboard', icon: '🔧', path: '/admin-dashboard' },
        { id: 'user-management', label: 'Benutzerverwaltung', icon: '👥', path: '/user-management' },
        { id: 'platform-settings', label: 'Plattform-Einstellungen', icon: '⚙️', path: '/platform-settings' }
      ];
    }

    return baseItems;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'buyer': return '🛒';
      case 'seller': return '🏪';
      case 'admin': return '🔧';
      default: return '👤';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer': return 'Käufer';
      case 'seller': return 'Verkäufer';
      case 'admin': return 'Administrator';
      default: return 'Benutzer';
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Lade Navigation...</p>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className={styles.noRoleContainer}>
        <div className={styles.noRoleContent}>
          <div className={styles.noRoleIcon}>👤</div>
          <h3>Keine Rolle zugewiesen</h3>
          <p>Bitte wählen Sie eine Rolle aus oder kontaktieren Sie den Support.</p>
          <button className={styles.contactButton}>
            Support kontaktieren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.roleBasedNavigation}>
      {/* Role Header */}
      <div className={styles.roleHeader}>
        <div className={styles.roleInfo}>
          <div className={styles.roleIcon}>{getRoleIcon(userRole.role)}</div>
          <div className={styles.roleDetails}>
            <div className={styles.roleLabel}>{getRoleLabel(userRole.role)}</div>
            <div className={styles.roleDescription}>
              {userRole.role === 'buyer' && 'Investieren Sie in Luxus-Assets'}
              {userRole.role === 'seller' && 'Verkaufen Sie Ihre Luxus-Assets'}
              {userRole.role === 'admin' && 'Verwalten Sie die Plattform'}
            </div>
          </div>
        </div>
        <button 
          className={styles.roleSwitcherButton}
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
          Rolle wechseln
        </button>
      </div>

      {/* Role Switcher */}
      {showRoleSwitcher && (
        <div className={styles.roleSwitcher}>
          <div className={styles.switcherHeader}>
            <h3>Rolle wechseln</h3>
            <button 
              className={styles.switcherClose}
              onClick={() => setShowRoleSwitcher(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className={styles.switcherOptions}>
            <button 
              className={`${styles.switcherOption} ${userRole.role === 'buyer' ? styles.switcherActive : ''}`}
              onClick={() => handleRoleSwitch('buyer')}
            >
              <div className={styles.switcherIcon}>🛒</div>
              <div className={styles.switcherContent}>
                <div className={styles.switcherTitle}>Käufer</div>
                <div className={styles.switcherDescription}>
                  Zugang zum Dealroom und Portfolio-Management
                </div>
              </div>
            </button>
            <button 
              className={`${styles.switcherOption} ${userRole.role === 'seller' ? styles.switcherActive : ''}`}
              onClick={() => handleRoleSwitch('seller')}
            >
              <div className={styles.switcherIcon}>🏪</div>
              <div className={styles.switcherContent}>
                <div className={styles.switcherTitle}>Verkäufer</div>
                <div className={styles.switcherDescription}>
                  Inserate verwalten und Verkaufs-Analytics
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className={styles.navigationItems}>
        {getNavigationItems().map((item) => (
          <button
            key={item.id}
            className={styles.navigationItem}
            onClick={() => handleNavigation(item.path)}
          >
            <div className={styles.itemIcon}>{item.icon}</div>
            <div className={styles.itemLabel}>{item.label}</div>
          </button>
        ))}
      </div>

      {/* User Profile Summary */}
      <div className={styles.userSummary}>
        <div className={styles.summaryHeader}>
          <h4>Profil-Übersicht</h4>
        </div>
        <div className={styles.summaryContent}>
          {userRole.profile && (
            <>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Name:</span>
                <span className={styles.summaryValue}>
                  {userRole.profile.contact_person || 'Nicht angegeben'}
                </span>
              </div>
              {userRole.profile.company_name && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Firma:</span>
                  <span className={styles.summaryValue}>
                    {userRole.profile.company_name}
                  </span>
                </div>
              )}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Status:</span>
                <span className={`${styles.summaryValue} ${styles.verificationStatus}`}>
                  {userRole.profile.verification_status === 'verified' ? 'Verifiziert' : 'Ausstehend'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
