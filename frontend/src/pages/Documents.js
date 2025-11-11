import React, { useState, useEffect } from 'react';
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
      <section className="max-w-[1400px] mx-auto" aria-label="Documents management">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800 m-0 mb-2 tracking-tight">Documents</h1>
            <p className="text-base text-gray-600 m-0">Manage and organize your client documents</p>
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
          <div role="alert" aria-live="assertive" className="bg-red-50 text-red-700 py-3.5 px-4 rounded-md mb-4 border border-red-200 text-[0.9375rem]">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" className="bg-green-50 text-green-700 py-3.5 px-4 rounded-md mb-4 border border-green-200 text-[0.9375rem]">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8 shadow-sm">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={filters.search} 
              onChange={(e) => setFilters({...filters, search: e.target.value})} 
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleFilterChange} 
              className="px-4 py-3 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white cursor-pointer min-w-[150px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="px-4 py-3 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white cursor-pointer min-w-[150px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="px-4 py-3 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white cursor-pointer min-w-[150px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Clients</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
              className="px-4 py-3 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Start Date"
            />
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
              className="px-4 py-3 border border-gray-300 rounded-md text-[0.9375rem] font-sans text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="End Date"
            />
            <button 
              onClick={() => setFilters({ category: '', accessLevel: '', clientId: '', startDate: '', endDate: '', search: '' })} 
              className="px-6 py-3 bg-transparent text-gray-600 border border-gray-300 rounded-md text-[0.9375rem] font-medium transition-all duration-200 font-sans hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 px-8 text-gray-600 text-base flex flex-col items-center gap-4" role="status" aria-live="polite" aria-label="Loading documents">
            <div className="w-10 h-10 border-[3px] border-gray-300 border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-lg border border-gray-300 shadow-sm" role="status" aria-live="polite">
            <div className="mb-6 flex justify-center" aria-hidden="true">
              <FileText size={64} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No documents yet</h2>
            <p className="text-[0.9375rem] text-gray-600 mb-6">Upload your first document to get started!</p>
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
                <h2 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">My Documents ({ownedDocs.length})</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6" role="list" aria-label="My documents list">
                  {ownedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="bg-white rounded-lg p-6 border border-gray-300 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-300 min-w-0">
                        <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                          <FileText size={24} className="text-primary" />
                        </div>
                        <h3 
                          className="text-lg font-semibold text-gray-800 m-0 flex-1 min-w-0 tracking-tight overflow-hidden text-ellipsis line-clamp-2 leading-snug max-h-[3.2em] break-words"
                          title={doc.title}
                          aria-label={`Document: ${doc.title}`}
                        >
                          {doc.title}
                        </h3>
                        <div className="flex gap-2 flex-shrink-0" role="group" aria-label={`Actions for ${doc.title}`}>
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
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <span className="font-medium text-gray-600 flex-shrink-0">Category:</span>
                          <CategoryBadge category={doc.category} />
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <span className="font-medium text-gray-600 flex-shrink-0">Client:</span>
                          <span 
                            className="text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.clientId?.name || 'N/A'}
                            aria-label={`Client: ${doc.clientId?.name || 'N/A'}`}
                          >
                            {doc.clientId?.name 
                              ? (doc.clientId.name.length > 20 ? `${doc.clientId.name.substring(0, 20)}...` : doc.clientId.name)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <span className="font-medium text-gray-600 flex-shrink-0">Access:</span>
                          <span className="text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">{doc.accessLevel}</span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <span className="font-medium text-gray-600 flex-shrink-0">Date:</span>
                          <span className="text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {sharedDocs.length > 0 && (
              <section className="mb-8" aria-label="Shared documents" role="region">
                <h2 className="text-xl font-semibold text-gray-800 mb-5 tracking-tight">Shared With Me ({sharedDocs.length})</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6" role="list" aria-label="Shared documents list">
                  {sharedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="bg-white rounded-lg p-6 border border-gray-300 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-300 min-w-0">
                        <div className="w-12 h-12 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                          <FileText size={24} className="text-green-600" />
                        </div>
                        <h3 
                          className="text-lg font-semibold text-gray-800 m-0 flex-1 min-w-0 tracking-tight overflow-hidden text-ellipsis line-clamp-2 leading-snug max-h-[3.2em] break-words"
                          title={doc.title}
                          aria-label={`Document: ${doc.title}`}
                        >
                          {doc.title}
                        </h3>
                      </div>
                      <dl className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <dt className="sr-only">Category</dt>
                          <dd className="text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">
                            <CategoryBadge category={doc.category} />
                          </dd>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0">
                          <dt className="sr-only">Owner</dt>
                          <dd 
                            className="text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
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
        <form onSubmit={handleUploadSubmit(onUploadSubmit)} className="flex flex-col gap-6" noValidate>
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

          <div className="mb-4">
            <label htmlFor="doc-category" className="text-sm font-medium text-gray-800 mb-1 block">
              Category *
            </label>
            <select
              id="doc-category"
              {...registerUpload('category')}
              className={`px-4 py-3.5 border rounded-md text-sm font-sans text-gray-800 bg-white transition-colors cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${uploadErrors.category ? 'border-red-500' : 'border-gray-300'}`}
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
              <span id="category-error" role="alert" className="text-xs text-red-600 mt-1 block">
                {uploadErrors.category.message}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="doc-client" className="text-sm font-medium text-gray-800 mb-1 block">
              Client *
            </label>
            <select
              id="doc-client"
              {...registerUpload('clientId')}
              className={`px-4 py-3.5 border rounded-md text-sm font-sans text-gray-800 bg-white transition-colors cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${uploadErrors.clientId ? 'border-red-500' : 'border-gray-300'}`}
              aria-label="Select client"
              aria-invalid={uploadErrors.clientId ? 'true' : 'false'}
              aria-describedby={uploadErrors.clientId ? 'client-error' : undefined}
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {uploadErrors.clientId && (
              <span id="client-error" role="alert" className="text-xs text-red-600 mt-1 block">
                {uploadErrors.clientId.message}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="doc-description" className="text-sm font-medium text-gray-800 mb-1 block">
              Description
            </label>
            <textarea
              id="doc-description"
              {...registerUpload('description')}
              className={`px-4 py-3.5 border rounded-md text-sm font-sans resize-y text-gray-800 bg-white transition-colors min-h-[100px] w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${uploadErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter document description (optional, max 300 chars)"
              rows="3"
              aria-label="Document description"
              aria-invalid={uploadErrors.description ? 'true' : 'false'}
              aria-describedby={uploadErrors.description ? 'description-error' : undefined}
            />
            {uploadErrors.description && (
              <span id="description-error" role="alert" className="text-xs text-red-600 mt-1 block">
                {uploadErrors.description.message}
              </span>
            )}
          </div>

          <fieldset className="border-0 p-0 m-0 mb-4">
            <legend className="text-sm font-medium text-gray-800 mb-1">Access Level *</legend>
            <div className="flex gap-6 mt-2" role="radiogroup" aria-label="Document access level">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="private"
                  className="w-[18px] h-[18px] cursor-pointer accent-primary"
                  aria-label="Private access"
                />
                <span>Private</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="shared"
                  className="w-[18px] h-[18px] cursor-pointer accent-primary"
                  aria-label="Shared access"
                />
                <span>Shared</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="public"
                  className="w-[18px] h-[18px] cursor-pointer accent-primary"
                  aria-label="Public access"
                />
                <span>Public</span>
              </label>
            </div>
            {uploadErrors.accessLevel && (
              <span role="alert" className="text-xs text-red-600 mt-1 block">
                {uploadErrors.accessLevel.message}
              </span>
            )}
          </fieldset>

          <div className="mb-4">
            <label htmlFor="doc-file" className="text-sm font-medium text-gray-800 mb-1 block">
              File *
            </label>
            <Controller
              name="file"
              control={uploadControl}
              render={({ field: { onChange, value } }) => (
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
              <p className="text-[13px] text-gray-600 mt-2 mb-0">PDF, PNG, or DOCX files only. Maximum size: 5MB</p>
            )}
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 text-red-700 py-3.5 px-4 rounded-md border border-red-200 text-[0.9375rem]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-2 pt-6 border-t border-gray-300">
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
            <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-300" role="region" aria-label="Document information">
              <p className="text-sm text-gray-800 m-0 font-medium">
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
                <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-300" role="region" aria-label="Already shared with">
                  <p className="text-sm font-semibold text-gray-800 mb-3 m-0">Already shared with:</p>
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
                        <li key={sharedUser?._id || sharedUser || index} className="flex items-center text-sm text-gray-800 p-2 bg-white rounded-sm border border-gray-300" role="listitem">
                          <Users size={16} className="text-gray-600 mr-2" aria-hidden="true" />
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

              <div className="flex justify-end gap-4 mt-2 pt-6 border-t border-gray-300">
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
              <p className="text-sm text-gray-600 leading-relaxed m-0 text-center">
                Are you sure you want to delete <strong>{documentToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-gray-300">
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
            <div className="flex items-start gap-4 pb-5 border-b border-gray-200 flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200/30">
                <FileText size={36} className="text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <h2 
                  className="text-[1.375rem] font-bold text-gray-800 m-0 tracking-tight leading-snug overflow-hidden text-ellipsis line-clamp-2 max-h-[3.85em] break-words" 
                  title={viewingDocument.title}
                >
                  {viewingDocument.title}
                </h2>
                {viewingDocument.description && (
                  <p 
                    className="text-sm text-gray-600 m-0 leading-relaxed overflow-hidden text-ellipsis line-clamp-2 max-h-[2.625em] break-words" 
                    title={viewingDocument.description}
                  >
                    {viewingDocument.description}
                  </p>
                )}
              </div>
            </div>

            {/* Document Details Grid */}
            <dl className="grid grid-cols-3 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 flex-shrink-0 list-none m-0" role="list">
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">Category</dt>
                <dd className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                  <CategoryBadge category={viewingDocument.category} />
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">Client</dt>
                <dd 
                  className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap"
                  title={viewingDocument.clientId?.name || 'N/A'}
                  aria-label={`Client: ${viewingDocument.clientId?.name || 'N/A'}`}
                >
                  {viewingDocument.clientId?.name 
                    ? (viewingDocument.clientId.name.length > 20 ? `${viewingDocument.clientId.name.substring(0, 20)}...` : viewingDocument.clientId.name)
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">Access Level</dt>
                <dd className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className={`inline-block px-3 py-1.5 rounded-md text-[0.8125rem] font-semibold capitalize leading-snug whitespace-nowrap ${
                    viewingDocument.accessLevel === 'public' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : viewingDocument.accessLevel === 'shared'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    {viewingDocument.accessLevel}
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">Upload Date</dt>
                <dd className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                  {new Date(viewingDocument.uploadDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">File Type</dt>
                <dd className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                  {viewingDocument.file?.fileType?.split('/')[1]?.toUpperCase() || 'N/A'}
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 min-w-0" role="listitem">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">File Size</dt>
                <dd className="text-[0.9375rem] font-medium text-gray-800 m-0 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
                  {viewingDocument.file?.fileSize 
                    ? `${(viewingDocument.file.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A'}
                </dd>
              </div>
            </dl>

            {/* Shared With Section */}
            {viewingDocument.accessLevel === 'shared' && viewingDocument.sharedWith && viewingDocument.sharedWith.length > 0 && (
              <div className="flex flex-col gap-2.5 p-4 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0" role="region" aria-label="Shared with users">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wider m-0 leading-snug">Shared With</dt>
                <dd className="flex flex-wrap gap-2 m-0">
                  {viewingDocument.sharedWith.map((sharedUser, index) => (
                    <span 
                      key={sharedUser?._id || index} 
                      className="inline-block px-3 py-1.5 bg-white rounded-md text-sm font-medium text-gray-800 border border-gray-200 shadow-sm leading-snug whitespace-nowrap"
                    >
                      {sharedUser?.name || sharedUser?.email || 'Unknown User'}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-5 border-t border-gray-200 flex-shrink-0" role="group" aria-label="Document actions">
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
