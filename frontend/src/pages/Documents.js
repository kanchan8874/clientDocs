import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Share2, Trash2, Download, AlertTriangle, Search, Users, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getClients } from '../api/clients.js';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  downloadDocument
} from '../api/documents.js';
import { getUserByEmail } from '../api/auth.js';
import { documentSchema, documentUpdateSchema } from '../utils/validation.js';
import Layout from '../components/Layout.js';
import CategoryBadge from '../components/CategoryBadge.js';
import FileUpload from '../components/FileUpload.js';
import AccessibleModal from '../components/AccessibleModal.js';
import AccessibleButton from '../components/AccessibleButton.js';
import AccessibleInput from '../components/AccessibleInput.js';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // React Hook Form for upload
  const {
    register: registerUpload,
    handleSubmit: handleUploadSubmit,
    formState: { errors: uploadErrors, isSubmitting: isUploading, isValid: isUploadValid },
    reset: resetUpload,
    control: uploadControl,
    setError: setUploadError
  } = useForm({
    resolver: zodResolver(documentSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: '',
      clientId: '',
      accessLevel: 'private',
      file: null
    }
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  
  // React Hook Form for edit
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    formState: { errors: editErrors, isSubmitting: isEditing, isValid: isEditValid },
    reset: resetEdit
  } = useForm({
    resolver: zodResolver(documentUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: '',
      accessLevel: 'private'
    }
  });
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingDocument, setSharingDocument] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  const [filters, setFilters] = useState({
    category: '',
    accessLevel: '',
    clientId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [filters.category, filters.accessLevel, filters.clientId, filters.startDate, filters.endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const clientsRes = await getClients();
      setClients(clientsRes.data?.clients || []);
      
      const filtersToSend = {};
      if (filters.category) filtersToSend.category = filters.category;
      if (filters.accessLevel) filtersToSend.accessLevel = filters.accessLevel;
      if (filters.clientId) filtersToSend.clientId = filters.clientId;
      if (filters.startDate) filtersToSend.startDate = filters.startDate;
      if (filters.endDate) filtersToSend.endDate = filters.endDate;
      
      const documentsRes = await getDocuments(filtersToSend);
      let docs = documentsRes.data?.documents || [];
      
      if (filters.search) {
        docs = docs.filter(doc =>
          doc.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setDocuments(docs);
      setError('');
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenUploadModal = () => {
    resetUpload();
    setShowUploadModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    resetUpload();
    setError('');
    setSuccess('');
  };

  const onUploadSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('clientId', data.clientId);
      formData.append('accessLevel', data.accessLevel);
      formData.append('file', data.file);

      await uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      handleCloseUploadModal();
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.message ||
                      'Upload failed';
      setError(errorMsg);
    }
  };

  const handleDeleteClick = (docId) => {
    const doc = documents.find(d => d._id === docId);
    setDocumentToDelete({ id: docId, title: doc?.title || 'this document' });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete.id);
      setSuccess('Document deleted successfully!');
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document. Please try again.');
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  const handleDownload = async (docId) => {
    try {
      await downloadDocument(docId);
      setSuccess('Document downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Download failed');
    }
  };

  // View document modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  const handleViewDocument = async (doc) => {
    try {
      // Fetch fresh document data
      const response = await getDocument(doc._id);
      setViewingDocument(response.data?.document || doc);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load document details');
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingDocument(null);
  };

  const handleOpenShareModal = async (doc) => {
    try {
      // Fetch fresh document data with populated sharedWith users
      const response = await getDocument(doc._id);
      const freshDoc = response.data?.document;
      
      setSharingDocument(freshDoc || doc);
      setShareEmail('');
      setShowShareModal(true);
      setError('');
    } catch (err) {
      // If fetch fails, use the document from state
      console.error('Error fetching document details:', err);
      setSharingDocument(doc);
      setShareEmail('');
      setShowShareModal(true);
      setError('');
    }
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharingDocument(null);
    setShareEmail('');
    setError('');
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSharing(true);

    if (!shareEmail.trim()) {
      setError('Please enter a user email');
      setSharing(false);
      return;
    }

    // Check if user is trying to share with themselves
    if (shareEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError('You cannot share a document with yourself. Please enter a different user\'s email.');
      setSharing(false);
      return;
    }

    try {
      // Get user by email
      const userRes = await getUserByEmail(shareEmail.trim());
      const targetUserId = userRes.data.user.id;

      // Get existing shared users (if any)
      // Handle both populated objects and ID strings
      const existingSharedIds = sharingDocument.sharedWith?.map(u => {
        if (typeof u === 'object' && u !== null && u._id) {
          return u._id.toString();
        }
        return u.toString();
      }) || [];
      
      // Combine with new user ID (remove duplicates)
      const userIds = [...new Set([...existingSharedIds, targetUserId])];

      // Share document
      const shareResponse = await shareDocument(sharingDocument._id, userIds);
      
      // Update sharing document with fresh populated data from response
      if (shareResponse.data?.document) {
        setSharingDocument(shareResponse.data.document);
      }
      
      setSuccess(`Document shared successfully with ${userRes.data.user.name}!`);
      // Don't close modal immediately, let user see the updated shared list
      loadData();
      setTimeout(() => {
        setSuccess('');
        handleCloseShareModal();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to share document. Please check if the email is correct.';
      setError(errorMsg);
    } finally {
      setSharing(false);
    }
  };

  const isOwner = (doc) => doc.createdBy?._id === user?.id || doc.createdBy === user?.id;
  const ownedDocs = documents.filter(doc => isOwner(doc));
  
  // Helper function to check if a document is shared with current user
  // Returns true only if:
  // 1. Document is NOT owned by current user
  // 2. Document accessLevel is 'shared' (not 'public')
  // 3. Current user's ID is in the sharedWith array
  const isSharedWithMe = (doc) => {
    if (isOwner(doc)) return false; // Exclude owner's documents
    if (doc.accessLevel !== 'shared') return false; // Only shared documents, not public
    // Check if current user is in sharedWith array
    const sharedWithIds = doc.sharedWith?.map(u => u?._id || u) || [];
    return sharedWithIds.some(id => 
      id === user?.id || id?.toString() === user?.id?.toString()
    );
  };
  
  const sharedDocs = documents.filter(isSharedWithMe);

  return (
    <Layout>
      <section className="mx-auto max-w-[1400px]" aria-label="Documents management">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-text sm:text-3xl">Documents</h1>
            <p className="m-0 text-sm text-text-muted sm:text-base">Manage and organize your client documents</p>
          </div>
          <AccessibleButton
            onClick={handleOpenUploadModal}
            variant="primary"
            ariaLabel="Upload new document"
            icon={<Upload size={20} aria-hidden="true" />}
            iconPosition="left"
          >
            Upload Document
          </AccessibleButton>
        </header>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[0.9375rem] text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-[0.9375rem] text-green-700">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="surface-card mb-8 bg-white/90 p-6 shadow-md backdrop-blur-sm">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 transform text-text-subtle" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={filters.search} 
              onChange={(e) => setFilters({...filters, search: e.target.value})} 
              className="w-full rounded-2xl border border-border bg-white pl-12 pr-4 py-3.5 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange} 
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:min-w-[150px]"
            >
              <option value="">All Categories</option>
              <option value="Proposal">Proposal</option>
              <option value="Invoice">Invoice</option>
              <option value="Report">Report</option>
              <option value="Contract">Contract</option>
            </select>
            <select 
              name="accessLevel" 
              value={filters.accessLevel} 
              onChange={handleFilterChange} 
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:min-w-[150px]"
            >
              <option value="">All Access</option>
              <option value="private">My Documents</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
            <select 
              name="clientId" 
              value={filters.clientId} 
              onChange={handleFilterChange} 
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:min-w-[150px]"
            >
              <option value="">All Clients</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:w-auto"
              placeholder="Start Date"
            />
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[0.9375rem] font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:w-auto"
              placeholder="End Date"
            />
            <button 
              onClick={() => setFilters({ category: '', accessLevel: '', clientId: '', startDate: '', endDate: '', search: '' })} 
              className="w-full rounded-2xl border border-border bg-white px-6 py-3 text-[0.9375rem] font-medium text-text-muted transition-all duration-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-base text-text-muted" role="status" aria-live="polite" aria-label="Loading documents">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-300 border-t-accent" aria-hidden="true"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-card py-16 px-8 text-center" role="status" aria-live="polite">
            <div className="mb-6 flex justify-center text-neutral-300" aria-hidden="true">
              <FileText size={64} />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text">No documents yet</h2>
            <p className="mb-6 text-[0.9375rem] text-text-muted">Upload your first document to get started!</p>
            <AccessibleButton
              onClick={handleOpenUploadModal}
              variant="primary"
              ariaLabel="Upload your first document"
              icon={<Upload size={18} aria-hidden="true" />}
              iconPosition="left"
            >
              Upload Document
            </AccessibleButton>
          </div>
        ) : (
          <>
            {ownedDocs.length > 0 && (
              <section className="mb-8" aria-label="My documents" role="region">
                <h2 className="mb-5 text-xl font-semibold tracking-tight text-text">My Documents ({ownedDocs.length})</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label="My documents list">
                  {ownedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="surface-card rounded-3xl bg-white/90 p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-surface backdrop-blur-sm"
                    >
                      <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-border pb-5">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-accent" aria-hidden="true">
                          <FileText size={24} />
                        </div>
                        <h3 
                          className="m-0 max-h-[3.2em] flex-1 min-w-0 overflow-hidden text-ellipsis break-words text-lg font-semibold leading-snug tracking-tight text-text line-clamp-2"
                          title={doc.title}
                          aria-label={`Document: ${doc.title}`}
                        >
                          {doc.title}
                        </h3>
                        <div className="flex flex-shrink-0 gap-2" role="group" aria-label={`Actions for ${doc.title}`}>
                          <AccessibleButton
                            onClick={() => handleOpenShareModal(doc)}
                            variant="ghost"
                            size="sm"
                            ariaLabel={`Share ${doc.title}`}
                            icon={<Share2 size={16} aria-hidden="true" />}
                          />
                          <AccessibleButton
                            onClick={() => handleDeleteClick(doc._id)}
                            variant="ghost"
                            size="sm"
                            ariaLabel={`Delete ${doc.title}`}
                            icon={<Trash2 size={16} aria-hidden="true" />}
                          />
                          <AccessibleButton
                            onClick={() => handleViewDocument(doc)}
                            variant="ghost"
                            size="sm"
                            ariaLabel={`View ${doc.title}`}
                            icon={<Eye size={16} aria-hidden="true" />}
                          />
                        </div>
                      </div>
                      <div className="mb-4 flex flex-col gap-3">
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <span className="flex-shrink-0 font-medium text-text-muted">Category:</span>
                          <CategoryBadge category={doc.category} />
                        </div>
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <span className="flex-shrink-0 font-medium text-text-muted">Client:</span>
                          <span 
                            className="min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right font-medium text-text"
                            title={doc.clientId?.name || 'N/A'}
                            aria-label={`Client: ${doc.clientId?.name || 'N/A'}`}
                          >
                            {doc.clientId?.name 
                              ? (doc.clientId.name.length > 20 ? `${doc.clientId.name.substring(0, 20)}...` : doc.clientId.name)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <span className="flex-shrink-0 font-medium text-text-muted">Access:</span>
                          <span className="min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right font-medium capitalize text-text">{doc.accessLevel}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <span className="flex-shrink-0 font-medium text-text-muted">Date:</span>
                          <span className="min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right font-medium text-text">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {sharedDocs.length > 0 && (
              <section className="mb-8" aria-label="Shared documents" role="region">
                <h2 className="mb-5 text-xl font-semibold tracking-tight text-text">Shared With Me ({sharedDocs.length})</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Shared documents list">
                  {sharedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="surface-card rounded-3xl bg-white/90 p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-surface backdrop-blur-sm"
                    >
                      <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-border pb-5">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success" aria-hidden="true">
                          <FileText size={24} />
                        </div>
                        <h3 
                          className="m-0 max-h-[3.2em] flex-1 min-w-0 overflow-hidden text-ellipsis break-words text-lg font-semibold leading-snug tracking-tight text-text line-clamp-2"
                          title={doc.title}
                          aria-label={`Document: ${doc.title}`}
                        >
                          {doc.title}
                        </h3>
                      </div>
                      <dl className="mb-4 flex flex-col gap-3">
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <dt className="sr-only">Category</dt>
                          <dd className="min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right font-medium text-text">
                            <CategoryBadge category={doc.category} />
                          </dd>
                        </div>
                        <div className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
                          <dt className="sr-only">Owner</dt>
                          <dd 
                            className="min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right font-medium text-text"
                            title={doc.createdBy?.name || 'Unknown'}
                            aria-label={`Owner: ${doc.createdBy?.name || 'Unknown'}`}
                          >
                            {doc.createdBy?.name || 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                      <AccessibleButton
                        onClick={() => handleDownload(doc._id)}
                        variant="primary"
                        size="sm"
                        ariaLabel={`Download ${doc.title}`}
                        icon={<Download size={16} aria-hidden="true" />}
                        iconPosition="left"
                        className="w-full mt-4"
                      >
                        Download
                      </AccessibleButton>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>

      <AccessibleModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        title="Upload Document"
        ariaLabel="Upload document form"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit(onUploadSubmit)} className="grid gap-5 md:grid-cols-2" noValidate>
          <div className="md:col-span-2">
            <AccessibleInput
              id="doc-title"
              label="Title"
              type="text"
              {...registerUpload('title')}
              error={uploadErrors.title?.message}
              required
              placeholder="Enter document title"
              ariaLabel="Document title"
              helperText="Minimum 3 characters, maximum 100 characters"
            />
          </div>

          <div>
            <label htmlFor="doc-category" className="mb-1 block text-sm font-medium text-text">
              Category *
            </label>
            <select
              id="doc-category"
              {...registerUpload('category')}
              className={`w-full cursor-pointer rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${uploadErrors.category ? 'border-red-500 bg-white' : 'border-border bg-white'}`}
              aria-label="Document category"
              aria-invalid={uploadErrors.category ? 'true' : 'false'}
              aria-describedby={uploadErrors.category ? 'category-error' : undefined}
            >
              <option value="">Select Category</option>
              <option value="Proposal">Proposal</option>
              <option value="Invoice">Invoice</option>
              <option value="Report">Report</option>
              <option value="Contract">Contract</option>
            </select>
            {uploadErrors.category && (
              <span id="category-error" role="alert" className="mt-1 block text-xs text-red-600">
                {uploadErrors.category.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="doc-client" className="mb-1 block text-sm font-medium text-text">
              Client *
            </label>
            <select
              id="doc-client"
              {...registerUpload('clientId')}
              className={`w-full cursor-pointer rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${uploadErrors.clientId ? 'border-red-500 bg-white' : 'border-border bg-white'}`}
              aria-label="Select client"
              aria-invalid={uploadErrors.clientId ? 'true' : 'false'}
              aria-describedby={uploadErrors.clientId ? 'client-error' : undefined}
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {uploadErrors.clientId && (
              <span id="client-error" role="alert" className="mt-1 block text-xs text-red-600">
                {uploadErrors.clientId.message}
              </span>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="doc-description" className="mb-1 block text-sm font-medium text-text">
              Description
            </label>
            <textarea
              id="doc-description"
              {...registerUpload('description')}
              className={`min-h-[100px] w-full resize-y rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${uploadErrors.description ? 'border-red-500 bg-white' : 'border-border bg-white'}`}
              placeholder="Enter document description (optional, max 300 chars)"
              rows="3"
              aria-label="Document description"
              aria-invalid={uploadErrors.description ? 'true' : 'false'}
              aria-describedby={uploadErrors.description ? 'description-error' : undefined}
            />
            {uploadErrors.description && (
              <span id="description-error" role="alert" className="mt-1 block text-xs text-red-600">
                {uploadErrors.description.message}
              </span>
            )}
          </div>

          <fieldset className="md:col-span-2 m-0 border-0 p-0">
            <legend className="mb-1 text-sm font-medium text-text">Access Level *</legend>
            <div className="mt-2 flex flex-wrap gap-4" role="radiogroup" aria-label="Document access level">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="private"
                  className="h-[18px] w-[18px] cursor-pointer accent-accent"
                  aria-label="Private access"
                />
                <span>Private</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="shared"
                  className="h-[18px] w-[18px] cursor-pointer accent-accent"
                  aria-label="Shared access"
                />
                <span>Shared</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="public"
                  className="h-[18px] w-[18px] cursor-pointer accent-accent"
                  aria-label="Public access"
                />
                <span>Public</span>
              </label>
            </div>
            {uploadErrors.accessLevel && (
              <span role="alert" className="mt-1 block text-xs text-red-600">
                {uploadErrors.accessLevel.message}
              </span>
            )}
          </fieldset>

          <div className="md:col-span-2">
            <label htmlFor="doc-file" className="mb-1 block text-sm font-medium text-text">
              File *
            </label>
            <Controller
              name="file"
              control={uploadControl}
              render={({ field: { onChange } }) => (
                <FileUpload
                  id="doc-file"
                  onFileSelect={(file) => onChange(file)}
                  accept=".pdf,.png,.docx"
                  maxSize={5 * 1024 * 1024}
                  ariaLabel="Select document file"
                  error={uploadErrors.file?.message}
                />
              )}
            />
            {!uploadErrors.file && (
              <p className="mt-2 mb-0 text-[13px] text-text-muted">PDF, PNG, or DOCX files only. Maximum size: 5MB</p>
            )}
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[0.9375rem] text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-2 mt-2 flex flex-col justify-end gap-3 border-t border-border pt-6 sm:flex-row">
            <AccessibleButton
              type="button"
              onClick={handleCloseUploadModal}
              variant="secondary"
              disabled={isUploading}
              ariaLabel="Cancel upload"
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={isUploading || !isUploadValid}
              loading={isUploading}
              ariaLabel={isUploading ? 'Uploading document' : 'Upload document'}
              icon={<Upload size={18} aria-hidden="true" />}
              iconPosition="left"
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </AccessibleButton>
          </div>
        </form>
      </AccessibleModal>

      {/* Share Modal */}
      <AccessibleModal
        isOpen={showShareModal && !!sharingDocument}
        onClose={handleCloseShareModal}
        title="Share Document"
        ariaLabel="Share document form"
        size="md"
      >
        {sharingDocument && (
          <>
            <div className="mb-6 rounded-2xl border border-border bg-primary-50 p-4" role="region" aria-label="Document information">
              <p className="m-0 text-sm font-medium text-text">
                <strong>Document:</strong> {sharingDocument.title}
              </p>
            </div>

            <form onSubmit={handleShareSubmit} className="flex flex-col gap-6" noValidate>
              <AccessibleInput
                id="shareEmail"
                label="User Email"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                placeholder="Enter user email to share with"
                disabled={sharing}
                ariaLabel="User email to share document with"
                helperText="User must be registered in the system"
              />

              {sharingDocument.sharedWith && sharingDocument.sharedWith.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-primary-50 p-4" role="region" aria-label="Already shared with">
                  <p className="m-0 mb-3 text-sm font-semibold text-text">Already shared with:</p>
                  <ul className="flex flex-col gap-2" role="list">
                    {sharingDocument.sharedWith.map((sharedUser, index) => {
                      let displayName = 'Unknown User';
                      
                      if (typeof sharedUser === 'object' && sharedUser !== null) {
                        if (sharedUser.name) {
                          displayName = sharedUser.name;
                        } else if (sharedUser.email) {
                          displayName = sharedUser.email;
                        }
                      } else if (typeof sharedUser === 'string') {
                        displayName = 'Loading user...';
                      }
                      
                      return (
                        <li key={sharedUser?._id || sharedUser || index} className="flex items-center rounded-xl border border-border bg-white p-2 text-sm text-text shadow-xs" role="listitem">
                          <Users size={16} className="mr-2 text-text-subtle" aria-hidden="true" />
                          <span>{displayName}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {error && (
                <div role="alert" aria-live="assertive" className="bg-red-50 text-red-700 py-3.5 px-4 rounded-md border border-red-200 text-[0.9375rem]">
                  {error}
                </div>
              )}

              <div className="mt-2 flex justify-end gap-4 border-t border-border pt-6">
                <AccessibleButton
                  type="button"
                  onClick={handleCloseShareModal}
                  variant="secondary"
                  disabled={sharing}
                  ariaLabel="Cancel sharing"
                >
                  Cancel
                </AccessibleButton>
                <AccessibleButton
                  type="submit"
                  variant="primary"
                  disabled={sharing}
                  loading={sharing}
                  ariaLabel={sharing ? 'Sharing document' : 'Share document'}
                  icon={<Share2 size={18} aria-hidden="true" />}
                  iconPosition="left"
                >
                  {sharing ? 'Sharing...' : 'Share Document'}
                </AccessibleButton>
              </div>
            </form>
          </>
        )}
      </AccessibleModal>

      {/* Delete Confirmation Modal */}
      <AccessibleModal
        isOpen={showDeleteModal && !!documentToDelete}
        onClose={handleDeleteCancel}
        title="Delete Document"
        ariaLabel="Delete document confirmation"
        size="sm"
      >
        {documentToDelete && (
          <>
            <div className="mb-6" role="alert">
              <div className="flex justify-center mb-4" aria-hidden="true">
                <AlertTriangle size={48} className="text-red-600" />
              </div>
              <p className="m-0 text-center text-sm leading-relaxed text-text-muted">
                Are you sure you want to delete <strong>{documentToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-4 border-t border-border pt-6">
              <AccessibleButton
                type="button"
                onClick={handleDeleteCancel}
                variant="secondary"
                ariaLabel="Cancel deletion"
              >
                Cancel
              </AccessibleButton>
              <AccessibleButton
                type="button"
                onClick={handleDeleteConfirm}
                variant="danger"
                ariaLabel={`Delete document ${documentToDelete.title}`}
              >
                Delete Document
              </AccessibleButton>
            </div>
          </>
        )}
      </AccessibleModal>

      {/* View Document Modal */}
      <AccessibleModal
        isOpen={showViewModal && !!viewingDocument}
        onClose={handleCloseViewModal}
        title=""
        ariaLabel="View document details"
        size="lg"
      >
        {viewingDocument && (
          <div className="flex flex-col gap-5 max-h-[calc(90vh-120px)] overflow-hidden">
            {/* Document Header */}
            <div className="flex flex-shrink-0 items-start gap-4 border-b border-border pb-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-white shadow-sm">
                <FileText size={36} className="text-accent" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <h2 
                  className="m-0 max-h-[3.85em] overflow-hidden text-ellipsis break-words text-[1.375rem] font-bold leading-snug tracking-tight text-text line-clamp-2" 
                  title={viewingDocument.title}
                >
                  {viewingDocument.title}
                </h2>
                {viewingDocument.description && (
                  <p 
                    className="m-0 max-h-[2.625em] overflow-hidden text-ellipsis break-words text-sm leading-relaxed text-text-muted line-clamp-2" 
                    title={viewingDocument.description}
                  >
                    {viewingDocument.description}
                  </p>
                )}
              </div>
            </div>

            {/* Document Details Grid */}
            <dl className="m-0 grid flex-shrink-0 grid-cols-3 gap-4 rounded-2xl border border-border bg-primary-50 p-5 list-none" role="list">
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">Category</dt>
                <dd className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text">
                  <CategoryBadge category={viewingDocument.category} />
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">Client</dt>
                <dd 
                  className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text"
                  title={viewingDocument.clientId?.name || 'N/A'}
                  aria-label={`Client: ${viewingDocument.clientId?.name || 'N/A'}`}
                >
                  {viewingDocument.clientId?.name 
                    ? (viewingDocument.clientId.name.length > 20 ? `${viewingDocument.clientId.name.substring(0, 20)}...` : viewingDocument.clientId.name)
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">Access Level</dt>
                <dd className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text">
                  <span className={`inline-block px-3 py-1.5 rounded-md text-[0.8125rem] font-semibold capitalize leading-snug whitespace-nowrap ${
                    viewingDocument.accessLevel === 'public' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : viewingDocument.accessLevel === 'shared'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-300'
                      : 'bg-primary-50 text-text border border-border'
                  }`}>
                    {viewingDocument.accessLevel}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">Upload Date</dt>
                <dd className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text">
                  {new Date(viewingDocument.uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">File Type</dt>
                <dd className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text">
                  {viewingDocument.file?.fileType?.split('/')[1]?.toUpperCase() || 'N/A'}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">File Size</dt>
                <dd className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.9375rem] font-medium leading-relaxed text-text">
                  {viewingDocument.file?.fileSize 
                    ? `${(viewingDocument.file.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A'}
                </dd>
              </div>
            </dl>

            {/* Shared With Section */}
            {viewingDocument.accessLevel === 'shared' && viewingDocument.sharedWith && viewingDocument.sharedWith.length > 0 && (
              <div className="flex flex-col gap-2.5 flex-shrink-0 rounded-2xl border border-border bg-primary-50 p-4" role="region" aria-label="Shared with users">
                <dt className="m-0 text-xs font-semibold uppercase leading-snug tracking-wider text-text-subtle">Shared With</dt>
                <dd className="m-0 flex flex-wrap gap-2">
                  {viewingDocument.sharedWith.map((sharedUser, index) => (
                    <span 
                      key={sharedUser?._id || index} 
                      className="inline-block whitespace-nowrap rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-medium leading-snug text-text shadow-xs"
                    >
                      {sharedUser?.name || sharedUser?.email || 'Unknown User'}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-shrink-0 gap-3 border-t border-border pt-5" role="group" aria-label="Document actions">
              <AccessibleButton
                onClick={() => {
                  handleDownload(viewingDocument._id);
                  handleCloseViewModal();
                }}
                variant="primary"
                size="md"
                ariaLabel={`Download ${viewingDocument.title}`}
                icon={<Download size={18} aria-hidden="true" />}
                iconPosition="left"
                className="flex-1"
              >
                Download Document
              </AccessibleButton>
            </div>
          </div>
        )}
      </AccessibleModal>
    </Layout>
  );
};

export default Documents;
