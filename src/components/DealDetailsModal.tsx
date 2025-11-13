"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DocumentManager } from "./DocumentManager";
import { CommunicationHub } from "./CommunicationHub";
import { StatusWorkflow } from "./StatusWorkflow";
import { ParticipantsManager } from "./ParticipantsManager";
import styles from "./DealDetailsModal.module.css";

interface DealDetailsModalProps {
  dealId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DealDetails {
  id: string;
  title: string;
  description: string;
  asset_type: string;
  status: string;
  deal_value: number;
  currency: string;
  expected_close_date: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  documents?: any[];
  participants?: any[];
  timeline?: any[];
}

export function DealDetailsModal({ dealId, isOpen, onClose }: DealDetailsModalProps) {
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'participants'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    deal_value: 0,
    expected_close_date: '',
    notes: ''
  });

  const [mounted, setMounted] = useState(false);
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const previousBodyStylesRef = useRef<{ overflow: string; position: string; top: string }>({
    overflow: '',
    position: '',
    top: '',
  });
  const scrollPositionRef = useRef(0);

  // Create a dedicated portal root on first mount (client-side only)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const portalRoot = document.createElement("div");
    portalRoot.setAttribute("data-modal-root", "deal-details");
    document.body.appendChild(portalRoot);
    portalRootRef.current = portalRoot;
    setMounted(true);

    return () => {
      if (portalRootRef.current) {
        document.body.removeChild(portalRootRef.current);
        portalRootRef.current = null;
      }
    };
  }, []);

  // Lock body scroll & trap focus when modal is open
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const body = document.body;
    previousBodyStylesRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
    };

    scrollPositionRef.current = window.scrollY || window.pageYOffset;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPositionRef.current}px`;
    body.style.width = "100%";

    // ESC key handler
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      const { overflow, position, top } = previousBodyStylesRef.current;
      body.style.overflow = overflow;
      body.style.position = position;
      body.style.top = top;
      body.style.width = "";
      window.scrollTo({ top: scrollPositionRef.current });
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && dealId) {
      loadDealDetails();
    }
    // Reset loading when modal closes
    if (!isOpen) {
      setDeal(null);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dealId]);

  const loadDealDetails = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("deal_pipeline")
        .select("*")
        .eq("id", dealId)
        .single();

      if (error) {
        console.error('Error loading deal details:', error);
        // Set a fallback deal object to prevent crashes
        const fallbackDeal = {
          id: dealId || '',
          title: 'Deal nicht gefunden',
          description: 'Dieser Deal konnte nicht geladen werden.',
          asset_type: 'unknown',
          status: 'error',
          deal_value: 0,
          currency: 'EUR',
          expected_close_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: ''
        };
        setDeal(fallbackDeal);
        return;
      }
      
      setDeal(data);
      setEditForm({
        title: data.title || '',
        description: data.description || '',
        status: data.status || '',
        deal_value: data.deal_value || 0,
        expected_close_date: data.expected_close_date || '',
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Error loading deal details:', error);
      // Set fallback deal on error
      const fallbackDeal = {
        id: dealId || '',
        title: 'Fehler beim Laden',
        description: 'Es gab einen Fehler beim Laden der Deal-Details.',
        asset_type: 'unknown',
        status: 'error',
        deal_value: 0,
        currency: 'EUR',
        expected_close_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: ''
      };
      setDeal(fallbackDeal);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dealId) return;
    
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("deal_pipeline")
        .update(editForm)
        .eq("id", dealId);

      if (error) throw error;
      
      await loadDealDetails();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!dealId) return;
    
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("deal_pipeline")
        .update({ status: newStatus })
        .eq("id", dealId);

      if (error) throw error;
      
      await loadDealDetails();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatPrice = (value: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interest": return "text-blue-600 bg-blue-50";
      case "negotiation": return "text-yellow-600 bg-yellow-50";
      case "due-diligence": return "text-purple-600 bg-purple-50";
      case "contract": return "text-orange-600 bg-orange-50";
      case "closed": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "interest": return "Interesse";
      case "negotiation": return "Verhandlung";
      case "due-diligence": return "Due Diligence";
      case "contract": return "Vertrag";
      case "closed": return "Abgeschlossen";
      case "cancelled": return "Storniert";
      default: return status;
    }
  };

  const getAssetTypeLabel = (assetType: string) => {
    switch (assetType) {
      case "real-estate": return "Immobilie";
      case "luxury-watches": return "Luxusuhr";
      case "vehicles": return "Fahrzeug";
      case "art": return "Kunst";
      case "collectibles": return "Sammlerstück";
      default: return assetType;
    }
  };

  if (!isOpen || !mounted || !portalRootRef.current) return null;

  // Handle overlay click with onMouseDown to prevent click-through issues
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.modalOverlay} onMouseDown={handleOverlayClick}>
      <div className={styles.modalContent}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>
              {isEditing ? 'Deal bearbeiten' : 'Deal Details'}
            </h2>
            {deal && (
              <span className={`${styles.statusBadge} ${getStatusColor(deal.status)}`}>
                {getStatusLabel(deal.status)}
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            {!isEditing ? (
              <button 
                className={styles.btnEdit}
                onClick={() => setIsEditing(true)}
              >
                Bearbeiten
              </button>
            ) : (
              <div className={styles.editActions}>
                <button 
                  className={styles.btnCancel}
                  onClick={() => setIsEditing(false)}
                >
                  Abbrechen
                </button>
                <button 
                  className={styles.btnSave}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            )}
            <button className={styles.btnClose} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Lade Deal-Details...</p>
            </div>
          )}
          
          {!loading && !deal && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Deal nicht gefunden</h3>
              <p>Dieser Deal konnte nicht geladen werden oder existiert nicht.</p>
              <button className={styles.btnPrimary} onClick={onClose}>
                Schließen
              </button>
            </div>
          )}
          
          {!loading && deal && (
            <>
              {/* Tab Navigation */}
              <div className={styles.tabNavigation}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Übersicht
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'documents' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  Dokumente
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'timeline' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'participants' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Teilnehmer
                </button>
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                  <div className={styles.overviewTab}>
                    <div className={styles.overviewGrid}>
                      {/* Basic Info */}
                      <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Grundinformationen</h3>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Titel</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                className={styles.inputField}
                              />
                            ) : (
                              <span className={styles.infoValue}>{deal.title}</span>
                            )}
                          </div>
                          <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Asset-Typ</label>
                            <span className={styles.infoValue}>{getAssetTypeLabel(deal.asset_type)}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Deal-Wert</label>
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.deal_value}
                                onChange={(e) => setEditForm({...editForm, deal_value: Number(e.target.value)})}
                                className={styles.inputField}
                              />
                            ) : (
                              <span className={styles.infoValue}>
                                {formatPrice(deal.deal_value, deal.currency)}
                              </span>
                            )}
                          </div>
                          <div className={styles.infoItem}>
                            <label className={styles.infoLabel}>Erwarteter Abschluss</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={editForm.expected_close_date}
                                onChange={(e) => setEditForm({...editForm, expected_close_date: e.target.value})}
                                className={styles.inputField}
                              />
                            ) : (
                              <span className={styles.infoValue}>
                                {new Date(deal.expected_close_date).toLocaleDateString("de-DE")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Beschreibung</h3>
                        {isEditing ? (
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className={styles.textareaField}
                            rows={4}
                          />
                        ) : (
                          <p className={styles.descriptionText}>{deal.description}</p>
                        )}
                      </div>

                      {/* Status Workflow */}
                      <div className={styles.infoCard}>
                        <StatusWorkflow 
                          dealId={dealId!}
                          currentStatus={deal.status}
                          onStatusChange={(newStatus) => {
                            setDeal(prev => prev ? {...prev, status: newStatus} : null);
                          }}
                        />
                      </div>

                      {/* Notes */}
                      <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Notizen</h3>
                        {isEditing ? (
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                            className={styles.textareaField}
                            rows={3}
                            placeholder="Interne Notizen zum Deal..."
                          />
                        ) : (
                          <p className={styles.notesText}>
                            {deal.notes || 'Keine Notizen vorhanden'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className={styles.documentsTab}>
                    <DocumentManager 
                      dealId={dealId!}
                      onDocumentUpload={(document) => {
                        console.log('Document uploaded:', document);
                      }}
                      onDocumentDelete={(documentId) => {
                        console.log('Document deleted:', documentId);
                      }}
                    />
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className={styles.timelineTab}>
                    <h3 className={styles.cardTitle}>Deal Timeline</h3>
                    <div className={styles.timeline}>
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        <div className={styles.timelineContent}>
                          <h4>Deal erstellt</h4>
                          <p>{new Date(deal.created_at).toLocaleString("de-DE")}</p>
                        </div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        <div className={styles.timelineContent}>
                          <h4>Status: {getStatusLabel(deal.status)}</h4>
                          <p>Letzte Aktualisierung: {new Date(deal.updated_at).toLocaleString("de-DE")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'participants' && (
                  <div className={styles.participantsTab}>
                    <ParticipantsManager 
                      dealId={dealId!}
                      onParticipantUpdate={(participants) => {
                        console.log('Participants updated:', participants);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  , portalRootRef.current);
}
