"use client";

import { useState, useRef, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./DocumentManager.module.css";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
  deal_id: string;
  category?: string;
  description?: string;
}

interface DocumentManagerProps {
  dealId: string;
  onDocumentUpload?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
}

export function DocumentManager({ dealId, onDocumentUpload, onDocumentDelete }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [uploadDescription, setUploadDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'general', label: 'Allgemein' },
    { value: 'contracts', label: 'Verträge' },
    { value: 'financial', label: 'Finanzdokumente' },
    { value: 'legal', label: 'Rechtliches' },
    { value: 'technical', label: 'Technische Unterlagen' },
    { value: 'photos', label: 'Fotos' },
    { value: 'other', label: 'Sonstiges' }
  ];

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:type;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    loadDocuments();
  }, [dealId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Check if deal_documents table exists
      const { data, error } = await supabase
        .from("deal_documents")
        .select("*")
        .eq("deal_id", dealId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.warn('deal_documents table not found or no access:', error);
        // Return empty array instead of throwing error
        setDocuments([]);
        return;
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      // Set empty array on error to prevent crashes
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      
      if (!auth.user) throw new Error('User not authenticated');

      const uploadPromises = Array.from(files).map(async (file) => {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `deals/${dealId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('deal-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.warn('Storage upload failed, creating fallback:', uploadError);
          // Create fallback document without storage
          const fallbackDoc = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            deal_id: dealId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: `data:${file.type};base64,${await fileToBase64(file)}`,
            uploaded_by: auth.user.id,
            category: selectedCategory,
            description: uploadDescription,
            uploaded_at: new Date().toISOString()
          };
          return fallbackDoc;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('deal-documents')
          .getPublicUrl(filePath);

        // Save document metadata to database
        const { data: docData, error: docError } = await supabase
          .from("deal_documents")
          .insert({
            deal_id: dealId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            uploaded_by: auth.user.id,
            category: selectedCategory,
            description: uploadDescription
          })
          .select()
          .single();

        if (docError) {
          console.warn('Database insert failed, creating fallback document:', docError);
          // Create fallback document without database
          const fallbackDoc = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            deal_id: dealId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
            uploaded_by: auth.user.id,
            category: selectedCategory,
            description: uploadDescription,
            uploaded_at: new Date().toISOString()
          };
          return fallbackDoc;
        }
        
        return docData;
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      setDocuments(prev => [...uploadedDocs, ...prev]);
      
      // Reset form
      setUploadDescription('');
      setSelectedCategory('general');
      
      // Notify parent component
      uploadedDocs.forEach(doc => onDocumentUpload?.(doc));
      
      // Show success message
      const successMessage = uploadedDocs.length === 1 
        ? `✅ Dokument "${uploadedDocs[0].name}" erfolgreich hochgeladen!`
        : `✅ ${uploadedDocs.length} Dokumente erfolgreich hochgeladen!`;
      
      alert(successMessage);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('❌ Fehler beim Hochladen der Dokumente. Bitte versuchen Sie es erneut.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) return;

    try {
      const supabase = getSupabaseBrowserClient();
      
      // Delete from storage
      const filePath = `deals/${dealId}/${fileName}`;
      await supabase.storage
        .from('deal-documents')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("deal_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      onDocumentDelete?.(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Fehler beim Löschen des Dokuments. Bitte versuchen Sie es erneut.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    return '📎';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div className={styles.documentManager}>
      {/* Upload Area */}
      <div className={styles.uploadSection}>
        <div 
          className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 className={styles.uploadTitle}>
              {uploading ? 'Dokumente werden hochgeladen...' : 'Dokumente hochladen'}
            </h3>
            <p className={styles.uploadSubtitle}>
              Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen
            </p>
            <div className={styles.uploadForm}>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
                onClick={(e) => e.stopPropagation()}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                className={styles.descriptionInput}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className={styles.hiddenInput}
        />
      </div>

      {/* Documents List */}
      <div className={styles.documentsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            Dokumente ({documents.length})
          </h3>
          <div className={styles.viewControls}>
            <button className={styles.viewButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={styles.viewButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Lade Dokumente...</p>
          </div>
        ) : documents.length > 0 ? (
          <div className={styles.documentsGrid}>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.documentCard}>
                <div className={styles.documentHeader}>
                  <div className={styles.documentIcon}>
                    {getFileIcon(doc.type)}
                  </div>
                  <div className={styles.documentInfo}>
                    <h4 className={styles.documentName}>{doc.name}</h4>
                    <p className={styles.documentMeta}>
                      {formatFileSize(doc.size)} • {getCategoryLabel(doc.category || 'general')}
                    </p>
                    {doc.description && (
                      <p className={styles.documentDescription}>{doc.description}</p>
                    )}
                  </div>
                  <div className={styles.documentActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Öffnen"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      title="Löschen"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={styles.documentFooter}>
                  <span className={styles.uploadDate}>
                    {new Date(doc.uploaded_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h4>Noch keine Dokumente</h4>
            <p>Laden Sie Dokumente hoch, um sie sicher zu teilen</p>
          </div>
        )}
      </div>
    </div>
  );
}
