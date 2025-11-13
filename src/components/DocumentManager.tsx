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
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (dealId) {
      loadDocuments();
    }
  }, [dealId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        console.error('Supabase client not available');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('deal_documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        setDocuments([]);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      console.error('Supabase client not available');
      setUploading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Bitte melden Sie sich an, um Dokumente hochzuladen.');
        setUploading(false);
        return;
      }

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);

        // Convert to base64 for storage
        const base64 = await fileToBase64(file);

        // Insert document record
        const { data: docData, error: insertError } = await supabase
          .from('deal_documents')
          .insert({
            deal_id: dealId,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            file_data: base64,
            uploaded_by: user.id,
            uploaded_at: new Date().toISOString(),
            category: selectedCategory,
            description: uploadDescription || null
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error uploading ${file.name}:`, insertError);
          alert(`Fehler beim Hochladen von ${file.name}: ${insertError.message}`);
          continue;
        }

        // Generate URL (for now, we'll create a data URL)
        const url = `data:${file.type};base64,${base64}`;
        
        const newDoc: Document = {
          id: docData.id,
          name: docData.name,
          type: docData.type,
          size: docData.size,
          url: url,
          uploaded_at: docData.uploaded_at,
          uploaded_by: docData.uploaded_by,
          deal_id: docData.deal_id,
          category: docData.category,
          description: docData.description
        };

        setDocuments(prev => [newDoc, ...prev]);
        onDocumentUpload?.(newDoc);
      }

      // Reset form
      setUploadDescription('');
      setSelectedCategory('general');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Dokumente erfolgreich hochgeladen!');
    } catch (error: any) {
      console.error('Error uploading files:', error);
      alert(`Fehler beim Hochladen: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    if (!confirm(`Möchten Sie "${docName}" wirklich löschen?`)) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }

    try {
      const { error } = await supabase
        .from('deal_documents')
        .delete()
        .eq('id', docId);

      if (error) {
        console.error('Error deleting document:', error);
        alert(`Fehler beim Löschen: ${error.message}`);
      } else {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        onDocumentDelete?.(docId);
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      alert(`Fehler beim Löschen: ${error.message}`);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleUploadClick = () => {
    if (uploading) return;
    if (!fileInputRef.current) {
      console.error('File input not available');
      return;
    }
    
    console.log('Opening file picker...');
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      );
    } else if (type.includes('pdf')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13,2 13,9 20,9"/>
      </svg>
    );
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div className={styles.documentManager}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`file-upload-${dealId}`}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
          }
        }}
        className={styles.hiddenInput}
        accept="*/*"
        disabled={uploading}
      />

      {/* Upload Area */}
      <div className={styles.uploadSection}>
        <div 
          className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
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
            
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className={styles.uploadButton}
            >
              {uploading ? 'Wird hochgeladen...' : 'Datei auswählen'}
            </button>

            <div className={styles.uploadForm}>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className={styles.documentsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            Dokumente ({documents.length})
          </h3>
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