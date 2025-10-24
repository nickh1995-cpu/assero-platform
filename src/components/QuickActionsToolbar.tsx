"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./QuickActionsToolbar.module.css";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  color: string;
  shortcut?: string;
}

interface QuickActionsToolbarProps {
  onAction?: (actionId: string) => void;
}

export function QuickActionsToolbar({ onAction }: QuickActionsToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'new-deal',
      label: 'Neuer Deal',
      icon: '➕',
      description: 'Einen neuen Deal erstellen',
      color: '#2c5a78',
      shortcut: 'Ctrl+N',
      action: () => {
        router.push('/dealroom?action=new-deal');
        onAction?.('new-deal');
      }
    },
    {
      id: 'new-portfolio',
      label: 'Neues Portfolio',
      icon: '📊',
      description: 'Ein neues Portfolio erstellen',
      color: '#10b981',
      shortcut: 'Ctrl+P',
      action: () => {
        router.push('/dealroom?action=new-portfolio');
        onAction?.('new-portfolio');
      }
    },
    {
      id: 'valuation',
      label: 'Valuation',
      icon: '💰',
      description: 'Asset bewerten',
      color: '#f59e0b',
      shortcut: 'Ctrl+V',
      action: () => {
        router.push('/valuation');
        onAction?.('valuation');
      }
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Portfolio-Analyse öffnen',
      color: '#8b5cf6',
      shortcut: 'Ctrl+A',
      action: () => {
        router.push('/analytics');
        onAction?.('analytics');
      }
    },
    {
      id: 'documents',
      label: 'Dokumente',
      icon: '📄',
      description: 'Dokumentenverwaltung',
      color: '#ef4444',
      shortcut: 'Ctrl+D',
      action: () => {
        router.push('/documents');
        onAction?.('documents');
      }
    },
    {
      id: 'reports',
      label: 'Berichte',
      icon: '📋',
      description: 'Berichte generieren',
      color: '#06b6d4',
      shortcut: 'Ctrl+R',
      action: () => {
        router.push('/reports');
        onAction?.('reports');
      }
    },
    {
      id: 'settings',
      label: 'Einstellungen',
      icon: '⚙️',
      description: 'Plattform-Einstellungen',
      color: '#6b7280',
      shortcut: 'Ctrl+,',
      action: () => {
        router.push('/settings');
        onAction?.('settings');
      }
    },
    {
      id: 'help',
      label: 'Hilfe',
      icon: '❓',
      description: 'Hilfe und Support',
      color: '#84cc16',
      shortcut: 'F1',
      action: () => {
        router.push('/help');
        onAction?.('help');
      }
    }
  ];

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActionClick = (action: QuickAction) => {
    action.action();
    setIsExpanded(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  return (
    <div className={styles.quickActionsToolbar}>
      {/* Main Toggle Button */}
      <button
        className={`${styles.toggleButton} ${isExpanded ? styles.toggleActive : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Quick Actions (Ctrl+K)"
      >
        <span className={styles.toggleIcon}>
          {isExpanded ? '✕' : '⚡'}
        </span>
        <span className={styles.toggleLabel}>Quick Actions</span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className={styles.actionsPanel}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Aktion suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.searchField}
                autoFocus
              />
              {searchQuery && (
                <button
                  className={styles.clearButton}
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions Grid */}
          <div className={styles.actionsGrid}>
            {filteredActions.map((action) => (
              <button
                key={action.id}
                className={styles.actionButton}
                onClick={() => handleActionClick(action)}
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className={styles.actionIcon}>
                  {action.icon}
                </div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>{action.label}</div>
                  <div className={styles.actionDescription}>{action.description}</div>
                  {action.shortcut && (
                    <div className={styles.actionShortcut}>
                      {action.shortcut}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.actionsFooter}>
            <div className={styles.footerInfo}>
              <span className={styles.footerText}>
                {filteredActions.length} Aktion{filteredActions.length !== 1 ? 'en' : ''} verfügbar
              </span>
            </div>
            <div className={styles.footerShortcuts}>
              <span className={styles.shortcutHint}>
                <kbd>Esc</kbd> zum Schließen
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isExpanded && (
        <div 
          className={styles.overlay}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
