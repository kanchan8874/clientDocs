import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Share2, Trash2, Download, AlertTriangle, Search, Users, Eye, Tag, Calendar, Lock, HardDrive, File, Edit, MoreVertical } from 'lucide-react';
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
import { getUserByEmail, getAllUsers } from '../api/auth.js';
import { documentSchema, documentUpdateSchema } from '../utils/validation.js';
import { createTextareaOnChange } from '../utils/textTransform.js';
import Layout from '../components/Layout.js';
import CategoryBadge from '../components/CategoryBadge.js';
import FileUpload from '../components/FileUpload.js';
import AccessibleModal from '../components/AccessibleModal.js';
import AccessibleButton from '../components/AccessibleButton.js';
import AccessibleInput from '../components/AccessibleInput.js';
import SearchableDropdown from '../components/SearchableDropdown.js';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
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
    setError: setUploadError,
    watch: watchUpload,
    setValue: setUploadValue
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
    reset: resetEdit,
    control: editControl,
    setValue: setEditValue
  } = useForm({
    resolver: zodResolver(documentUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: '',
      clientId: '',
      accessLevel: 'private'
    }
  });
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingDocument, setSharingDocument] = useState(null);
  const [shareUserId, setShareUserId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  // Menu state for document actions
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [filters, setFilters] = useState({
    category: '',
    accessLevel: '',
    clientId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Load data when filters change (excluding search - handled client-side)
  useEffect(() => {
    loadData();
  }, [filters.category, filters.accessLevel, filters.clientId, filters.startDate, filters.endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load clients and users in parallel, but handle errors separately
      // so if one fails, the other can still succeed
      const [clientsRes, usersRes] = await Promise.allSettled([
        getClients(),
        getAllUsers()
      ]);
      
      // Handle clients result
      if (clientsRes.status === 'fulfilled') {
        setClients(clientsRes.value.data?.clients || []);
      } else {
        console.warn('Failed to load clients:', clientsRes.reason);
        setClients([]);
      }
      
      // Handle users result
      if (usersRes.status === 'fulfilled') {
        const usersData = usersRes.value.data?.users || usersRes.value?.users || [];
        console.log('Loaded users:', usersData.length, usersData);
        // Filter out current user from the list
        const filteredUsers = usersData.filter(u => {
          const userId = u.id || u._id;
          return userId !== user?.id && userId?.toString() !== user?.id?.toString();
        });
        setUsers(filteredUsers);
        console.log('Filtered users (excluding current):', filteredUsers.length, filteredUsers);
      } else {
        console.error('Failed to load users:', usersRes.reason);
        setUsers([]);
        // Don't show error for users failure, just log it
      }
      
      const filtersToSend = {};
      if (filters.category) filtersToSend.category = filters.category;
      if (filters.accessLevel) filtersToSend.accessLevel = filters.accessLevel;
      if (filters.clientId) filtersToSend.clientId = filters.clientId;
      if (filters.startDate) filtersToSend.startDate = filters.startDate;
      if (filters.endDate) filtersToSend.endDate = filters.endDate;
      // Search is handled client-side, not sent to backend
      
      const documentsRes = await getDocuments(filtersToSend);
      // API client interceptor returns response.data directly
      // Backend returns: { success: true, data: { documents: [...] } }
      const docs = documentsRes?.data?.documents || documentsRes?.documents || [];
      
      // Store all documents (search filtering happens in render)
      setDocuments(Array.isArray(docs) ? docs : []);
      setError('');
    } catch (err) {
      console.error('Error loading documents:', err);
      const errorMessage = err?.message || err?.data?.message || 'Failed to load documents.';
      // Only show error if it's not a rate limit error (429)
      if (err?.response?.status !== 429) {
        setError(errorMessage);
      }
      // On error, clear documents to show error state
      setDocuments([]);
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
                      'Upload failed.';
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
      setError('Download failed.');
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
      setError('Failed to load document details.');
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingDocument(null);
  };

  const handleOpenEditModal = (doc) => {
    setEditingDocument(doc);
    // Extract clientId - handle both object and string formats
    let clientId = '';
    if (doc.clientId) {
      if (typeof doc.clientId === 'object' && doc.clientId._id) {
        clientId = doc.clientId._id;
      } else if (typeof doc.clientId === 'string') {
        clientId = doc.clientId;
      }
    }
    
    const formData = {
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || '',
      clientId: clientId,
      accessLevel: doc.accessLevel || 'private'
    };
    
    // Reset form with data
    resetEdit(formData);
    
    // Explicitly set values using setValue to ensure form state is updated
    // Use setTimeout to ensure form is ready
    setTimeout(() => {
      setEditValue('title', formData.title, { shouldValidate: false });
      setEditValue('description', formData.description, { shouldValidate: false });
      setEditValue('category', formData.category, { shouldValidate: false });
      setEditValue('clientId', clientId, { shouldValidate: false });
      setEditValue('accessLevel', formData.accessLevel, { shouldValidate: false });
    }, 0);
    
    setShowEditModal(true);
    setShowViewModal(false);
    setError('');
    setSuccess('');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDocument(null);
    resetEdit();
    setError('');
    setSuccess('');
  };

  const onEditSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      // Extract clientId from form data or fallback to existing document's clientId
      let clientId = data.clientId;
      
      // If clientId is empty, try to get it from editingDocument
      if (!clientId || clientId.trim() === '') {
        if (editingDocument?.clientId) {
          if (typeof editingDocument.clientId === 'object' && editingDocument.clientId._id) {
            clientId = editingDocument.clientId._id;
          } else if (typeof editingDocument.clientId === 'string') {
            clientId = editingDocument.clientId;
          }
        }
      }
      
      // Final validation - clientId must be present
      if (!clientId || clientId.trim() === '') {
        setError('Please select a client. Client is required.');
        return;
      }

      // Prepare update data with ensured clientId
      const updateData = {
        title: data.title,
        description: data.description || '',
        category: data.category,
        clientId: clientId,
        accessLevel: data.accessLevel
      };

      await updateDocument(editingDocument._id, updateData);
      setSuccess('Document updated successfully!');
      handleCloseEditModal();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.message ||
                      'Failed to update document. Please try again.';
      setError(errorMsg);
    }
  };

  const handleOpenShareModal = async (doc) => {
    try {
      // Fetch fresh document data with populated sharedWith users
      const response = await getDocument(doc._id);
      const freshDoc = response.data?.document;
      
      setSharingDocument(freshDoc || doc);
      setShareUserId('');
      setShowShareModal(true);
      setError('');
    } catch (err) {
      // If fetch fails, use the document from state
      console.error('Error fetching document details:', err);
      setSharingDocument(doc);
      setShareUserId('');
      setShowShareModal(true);
      setError('');
    }
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setSharingDocument(null);
    setShareUserId('');
    setError('');
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSharing(true);

    if (!shareUserId) {
      setError('Please select a user to share with.');
      setSharing(false);
      return;
    }

    try {
      // Find selected user
      const selectedUser = users.find(u => u.id === shareUserId || u._id === shareUserId);
      
      if (!selectedUser) {
        setError('Selected user not found.');
        setSharing(false);
        return;
      }

      // Check if user is trying to share with themselves
      if (selectedUser.id === user?.id || selectedUser._id === user?.id) {
        setError('You cannot share a document with yourself.');
        setSharing(false);
        return;
      }

      const targetUserId = selectedUser.id || selectedUser._id;

      // Get existing shared users (if any)
      // Handle both populated objects and ID strings
      const existingSharedIds = sharingDocument.sharedWith?.map(u => {
        if (typeof u === 'object' && u !== null && u._id) {
          return u._id.toString();
        }
        return u.toString();
      }) || [];
      
      // Check if already shared with this user
      if (existingSharedIds.includes(targetUserId.toString())) {
        setError(`Document is already shared with ${selectedUser.name}.`);
        setSharing(false);
        return;
      }
      
      // Combine with new user ID (remove duplicates)
      const userIds = [...new Set([...existingSharedIds, targetUserId.toString()])];

      // Share document
      const shareResponse = await shareDocument(sharingDocument._id, userIds);
      
      // Update sharing document with fresh populated data from response
      if (shareResponse.data?.document) {
        setSharingDocument(shareResponse.data.document);
      }
      
      // Show toast notification
      setToastMessage(`Document shared successfully with ${selectedUser.name}!`);
      setShowToast(true);
      loadData();
      
      // Trigger notification refresh event
      window.dispatchEvent(new CustomEvent('notificationRefresh'));
      
      setTimeout(() => { handleCloseShareModal(); }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.message ||
                      'Failed to share document. Please try again.';
      setError(errorMsg);
    } finally {
      setSharing(false);
    }
  };

  const isOwner = (doc) => doc.createdBy?._id === user?.id || doc.createdBy === user?.id;
  
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

  // Filter documents based on search query (client-side)
  const filterDocumentsBySearch = (docs) => {
    if (!filters.search || !filters.search.trim()) {
      return docs;
    }
    const searchTerm = filters.search.trim().toLowerCase();
    return docs.filter(doc => {
      const titleMatch = doc.title?.toLowerCase().includes(searchTerm);
      const descriptionMatch = doc.description?.toLowerCase().includes(searchTerm);
      const clientNameMatch = doc.clientId?.name?.toLowerCase().includes(searchTerm);
      return titleMatch || descriptionMatch || clientNameMatch;
    });
  };

  // Helper function to check if a document is public (not owned, not shared, but public)
  const isPublicDocument = (doc) => {
    if (isOwner(doc)) return false; // Exclude owner's documents
    if (isSharedWithMe(doc)) return false; // Exclude shared documents
    return doc.accessLevel === 'public'; // Only public documents
  };

  // Apply search filter to all documents first, then separate by ownership
  const filteredDocuments = filterDocumentsBySearch(documents);
  const ownedDocs = filteredDocuments.filter(doc => isOwner(doc));
  const sharedDocs = filteredDocuments.filter(isSharedWithMe);
  const publicDocs = filteredDocuments.filter(isPublicDocument);
  
  // Check if search is active and no results found
  const isSearchActive = filters.search && filters.search.trim();
  const hasNoResults = isSearchActive && ownedDocs.length === 0 && sharedDocs.length === 0 && publicDocs.length === 0;

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId) {
        // Check if click is outside the menu button and dropdown
        const menuContainer = event.target.closest('.relative');
        const menuDropdown = event.target.closest('[role="menu"]');
        if (!menuContainer && !menuDropdown) {
          setOpenMenuId(null);
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && openMenuId) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }, 0);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [openMenuId]);

  return (
    <Layout>
      {/* Toast Notification */}
      {showToast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-20 right-4 z-[9999] bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-md"
          style={{
            animation: 'slide-in-right 0.3s ease-out'
          }}
        >
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium m-0">{toastMessage}</p>
          <button
            onClick={() => {
              setShowToast(false);
              setToastMessage('');
            }}
            className="ml-auto flex-shrink-0 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <section className="max-w-[1400px] mx-auto" aria-label="Documents management">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 m-0 mb-2 tracking-tight">Documents</h1>
            <p className="text-base text-slate-600 m-0">Manage and organize your client documents.</p>
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
        <div className="surface-card p-6 mb-8">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 transform text-slate-500" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={filters.search} 
              onChange={(e) => {
                const searchValue = e.target.value;
                setFilters({...filters, search: searchValue});
              }}
              className="w-full rounded-md border border-slate-200 bg-white pl-12 pr-4 py-3.5 text-[0.9375rem] font-sans text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <div className="min-w-[160px]">
              <SearchableDropdown
                id="filter-category"
                label=""
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'Proposal', label: 'Proposal' },
                  { value: 'Invoice', label: 'Invoice' },
                  { value: 'Report', label: 'Report' },
                  { value: 'Contract', label: 'Contract' }
                ]}
              value={filters.category} 
                onChange={(value) => setFilters({...filters, category: value})}
                placeholder="All Categories"
                ariaLabel="Filter by category"
                maxHeight="180px"
                showSearch={false}
                className=""
              />
            </div>
            <div className="min-w-[160px]">
              <SearchableDropdown
                id="filter-access"
                label=""
                options={[
                  { value: '', label: 'All Access' },
                  { value: 'private', label: 'My Documents' },
                  { value: 'shared', label: 'Shared' },
                  { value: 'public', label: 'Public' }
                ]}
              value={filters.accessLevel} 
                onChange={(value) => setFilters({...filters, accessLevel: value})}
                placeholder="All Access"
                ariaLabel="Filter by access level"
                maxHeight="180px"
                showSearch={false}
                className=""
              />
            </div>
            <div className="min-w-[180px]">
              <SearchableDropdown
                id="filter-client"
                label=""
                options={[
                  { value: '', label: 'All Clients' },
                  ...clients.map(c => ({ value: c._id, label: c.name, _id: c._id }))
                ]}
              value={filters.clientId} 
                onChange={(value) => setFilters({...filters, clientId: value})}
                placeholder="All Clients"
                ariaLabel="Filter by client"
                maxHeight="180px"
                showSearch={false}
                className=""
              />
            </div>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[0.9375rem] font-sans text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Start Date"
            />
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[0.9375rem] font-sans text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="End Date"
            />
            <button 
              onClick={() => setFilters({ category: '', accessLevel: '', clientId: '', startDate: '', endDate: '', search: '' })} 
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-[0.9375rem] font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-16 px-8 text-base text-slate-600" role="status" aria-live="polite" aria-label="Loading documents">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-300 border-t-primary" aria-hidden="true"></div>
            <p>Loading documents...</p>
          </div>
        ) : hasNoResults ? (
          <div className="surface-card text-center py-16 px-8" role="status" aria-live="polite">
            <div className="mb-6 flex justify-center" aria-hidden="true">
              <FileText size={64} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No documents found.</h2>
            <p className="mb-6 text-[0.9375rem] text-slate-600">
              No documents match your search query: <strong className="text-slate-900">"{filters.search}"</strong>
            </p>
            <AccessibleButton
              onClick={() => setFilters({ ...filters, search: '' })}
              variant="secondary"
              ariaLabel="Clear search"
            >
              Clear Search
            </AccessibleButton>
          </div>
        ) : documents.length === 0 ? (
          <div className="surface-card text-center py-16 px-8" role="status" aria-live="polite">
            <div className="mb-6 flex justify-center" aria-hidden="true">
              <FileText size={64} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No documents yet.</h2>
            <p className="mb-6 text-[0.9375rem] text-slate-600">Upload your first document to get started!</p>
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
                <h2 className="text-xl font-semibold text-slate-900 mb-5 tracking-tight">My Documents ({ownedDocs.length})</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6" role="list" aria-label="My documents list">
                  {ownedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="surface-card p-6 transition-all duration-200 hover:-translate-y-0.5 min-h-[280px] flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-50" aria-hidden="true">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <h3 
                          className="text-lg font-semibold text-slate-900 m-0 flex-1 min-w-0 tracking-tight overflow-hidden text-ellipsis line-clamp-2 leading-snug max-h-[3.2em] break-words"
                          title={doc.title}
                          aria-label={`Document: ${doc.title}`}
                        >
                          {doc.title}
                        </h3>
                        <div className="relative flex-shrink-0" role="group" aria-label={`Actions for ${doc.title}`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === doc._id ? null : doc._id);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                            aria-label={`More options for ${doc.title}`}
                            aria-expanded={openMenuId === doc._id}
                            aria-haspopup="true"
                          >
                            <MoreVertical size={18} aria-hidden="true" />
                          </button>
                          
                          {openMenuId === doc._id && (
                            <div 
                              className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-2"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenShareModal(doc);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                role="menuitem"
                                aria-label={`Share ${doc.title}`}
                              >
                                <Share2 size={16} className="text-slate-500" aria-hidden="true" />
                                <span>Share</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDocument(doc);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                role="menuitem"
                                aria-label={`View ${doc.title}`}
                              >
                                <Eye size={16} className="text-slate-500" aria-hidden="true" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(doc);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                role="menuitem"
                                aria-label={`Edit ${doc.title}`}
                              >
                                <Edit size={16} className="text-slate-500" aria-hidden="true" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(doc._id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                role="menuitem"
                                aria-label={`Delete ${doc.title}`}
                              >
                                <Trash2 size={16} className="text-red-500" aria-hidden="true" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0 mb-4">
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Category:</span>
                          <CategoryBadge category={doc.category} />
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Client:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.clientId?.name || 'N/A'}
                            aria-label={`Client: ${doc.clientId?.name || 'N/A'}`}
                          >
                            {doc.clientId?.name 
                              ? (doc.clientId.name.length > 20 ? `${doc.clientId.name.substring(0, 20)}...` : doc.clientId.name)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Access:</span>
                          <span className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">{doc.accessLevel}</span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5">
                          <span className="font-medium text-slate-600 flex-shrink-0">Date:</span>
                          <span className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">
                            {doc.uploadDate 
                              ? new Date(doc.uploadDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {sharedDocs.length > 0 && (
              <section className="mb-8" aria-label="Shared documents" role="region">
                <h2 className="text-xl font-semibold text-slate-900 mb-5 tracking-tight">Shared With Me ({sharedDocs.length})</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6" role="list" aria-label="Shared documents list">
                  {sharedDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="surface-card p-6 transition-all duration-200 hover:-translate-y-0.5 min-h-[280px] flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600" aria-hidden="true">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                              <Share2 size={12} aria-hidden="true" />
                              Shared Document
                            </span>
                          </div>
                          <h3 
                            className="text-lg font-semibold text-slate-900 m-0 flex-1 min-w-0 tracking-tight overflow-hidden text-ellipsis line-clamp-2 leading-snug max-h-[3.2em] break-words"
                            title={doc.title}
                            aria-label={`Document: ${doc.title}`}
                          >
                            {doc.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0 mb-4">
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Category:</span>
                          <CategoryBadge category={doc.category} />
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Shared By:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.createdBy?.name || 'Unknown'}
                            aria-label={`Shared by: ${doc.createdBy?.name || 'Unknown'}`}
                          >
                            {doc.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Client:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.clientId?.name || 'Not assigned'}
                            aria-label={`Client: ${doc.clientId?.name || 'Not assigned'}`}
                          >
                            {doc.clientId?.name || 'Not assigned'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Access:</span>
                          <span className="text-slate-900 font-medium capitalize">{doc.accessLevel || 'private'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5">
                          <span className="font-medium text-slate-600 flex-shrink-0">Shared On:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.updatedAt ? new Date(doc.updatedAt).toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Unknown'}
                            aria-label={`Shared on: ${doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Unknown'}`}
                          >
                            {doc.updatedAt 
                              ? new Date(doc.updatedAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <AccessibleButton
                        onClick={() => handleDownload(doc._id)}
                        variant="primary"
                        size="sm"
                        ariaLabel={`Download ${doc.title}`}
                        icon={<Download size={16} aria-hidden="true" />}
                        iconPosition="left"
                        className="w-full mt-4"
                      >
                        Download Document
                      </AccessibleButton>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {publicDocs.length > 0 && (
              <section className="mb-8" aria-label="Public documents" role="region">
                <h2 className="text-xl font-semibold text-slate-900 mb-5 tracking-tight">Public Documents ({publicDocs.length})</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-6" role="list" aria-label="Public documents list">
                  {publicDocs.map(doc => (
                    <article 
                      key={doc._id}
                      role="listitem"
                      className="surface-card p-6 transition-all duration-200 hover:-translate-y-0.5 min-h-[280px] flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200 min-w-0">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-green-50 text-green-600" aria-hidden="true">
                          <FileText size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                              <Users size={12} aria-hidden="true" />
                              Public Document
                            </span>
                          </div>
                          <h3 
                            className="text-lg font-semibold text-slate-900 m-0 flex-1 min-w-0 tracking-tight overflow-hidden text-ellipsis line-clamp-2 leading-snug max-h-[3.2em] break-words"
                            title={doc.title}
                            aria-label={`Document: ${doc.title}`}
                          >
                            {doc.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0 mb-4">
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Category:</span>
                          <CategoryBadge category={doc.category} />
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Created By:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.createdBy?.name || 'Unknown'}
                            aria-label={`Created by: ${doc.createdBy?.name || 'Unknown'}`}
                          >
                            {doc.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Client:</span>
                          <span 
                            className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]"
                            title={doc.clientId?.name || 'Not assigned'}
                            aria-label={`Client: ${doc.clientId?.name || 'Not assigned'}`}
                          >
                            {doc.clientId?.name || 'Not assigned'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5 border-b border-slate-100">
                          <span className="font-medium text-slate-600 flex-shrink-0">Access:</span>
                          <span className="text-slate-900 font-medium capitalize">{doc.accessLevel || 'public'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[0.9375rem] gap-2 min-w-0 py-2.5">
                          <span className="font-medium text-slate-600 flex-shrink-0">Date:</span>
                          <span className="text-slate-900 font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-right max-w-[60%]">
                            {doc.uploadDate 
                              ? new Date(doc.uploadDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <AccessibleButton
                        onClick={() => handleDownload(doc._id)}
                        variant="primary"
                        size="sm"
                        ariaLabel={`Download ${doc.title}`}
                        icon={<Download size={16} aria-hidden="true" />}
                        iconPosition="left"
                        className="w-full mt-4"
                      >
                        Download Document
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
        size="md"
      >
        <form onSubmit={handleUploadSubmit(onUploadSubmit)} className="grid gap-4 md:grid-cols-2" noValidate>
          <AccessibleInput
            id="doc-title"
            label="Title"
            type="text"
            {...registerUpload('title')}
            error={uploadErrors.title?.message}
            required
            placeholder="Enter document title"
            ariaLabel="Document title"
            helperText="Minimum 3 characters, maximum 100 characters."
            className="md:col-span-2"
          />

          <div>
            <Controller
              name="category"
              control={uploadControl}
              render={({ field }) => (
                <SearchableDropdown
              id="doc-category"
                  label="Category"
                  options={[
                    { value: 'Proposal', label: 'Proposal' },
                    { value: 'Invoice', label: 'Invoice' },
                    { value: 'Report', label: 'Report' },
                    { value: 'Contract', label: 'Contract' }
                  ]}
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Select Category"
                  error={uploadErrors.category?.message}
                  required
                  ariaLabel="Document category"
                  maxHeight="200px"
                  showSearch={false}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="clientId"
              control={uploadControl}
              render={({ field }) => (
                <SearchableDropdown
              id="doc-client"
                  label="Client"
                  options={clients.map(c => ({ value: c._id, label: c.name, _id: c._id }))}
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Select Client"
                  error={uploadErrors.clientId?.message}
                  required
                  ariaLabel="Select client"
                  maxHeight="250px"
                  showSearch={false}
                />
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="doc-description" className="mb-1 block text-sm font-medium text-text">
              Description
            </label>
            <textarea
              id="doc-description"
              {...registerUpload('description', {
                onChange: createTextareaOnChange((e) => {
                  setUploadValue('description', e.target.value, { shouldValidate: true });
                }, 'description')
              })}
              className={`min-h-[100px] w-full resize-y rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${uploadErrors.description ? 'border-red-500 bg-white' : 'border-border bg-white'}`}
              placeholder="Enter document description (optional, max 300 characters)"
              rows="3"
              aria-label="Document description"
              aria-invalid={uploadErrors.description ? 'true' : 'false'}
              aria-describedby={uploadErrors.description ? 'description-error' : undefined}
              autoCapitalize="sentences"
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
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="private"
                  className="h-[18px] w-[18px] cursor-pointer accent-accent"
                  aria-label="Private access"
                />
                <span>Private</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  {...registerUpload('accessLevel')}
                  value="shared"
                  className="h-[18px] w-[18px] cursor-pointer accent-accent"
                  aria-label="Shared access"
                />
                <span>Shared</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
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
              <p className="mt-2 mb-0 text-[13px] text-text-muted">PDF, PNG, or DOCX files only. Maximum size: 5MB.</p>
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
              <SearchableDropdown
                id="shareUser"
                label="Select User"
                options={users.map(userItem => ({
                  value: userItem.id || userItem._id,
                  label: `${userItem.name} (${userItem.email})`,
                  name: userItem.name,
                  email: userItem.email
                }))}
                value={shareUserId}
                onChange={(value) => setShareUserId(value)}
                placeholder="Search and select a user"
                searchPlaceholder="Search users..."
                error={error && !shareUserId ? error : undefined}
                required
                ariaLabel="Select user to share document with"
                showSearch={true}
                maxHeight="250px"
              />
              {users.length === 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  {loading ? 'Loading users...' : 'No other users available to share with.'}
                </p>
              )}

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

              <div className="flex justify-end gap-4 mt-2 pt-6 border-t border-slate-200">
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
              <p className="text-sm text-slate-600 leading-relaxed m-0 text-center">
                Are you sure you want to delete <strong>{documentToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-slate-200">
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
        title="Document Details"
        ariaLabel="View document details"
        size="md"
      >
        {viewingDocument && (
          <div className="space-y-6">
            {/* Document Name Section */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 p-5 shadow-sm">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-primary-500 to-primary-700 shadow-md shadow-accent/20">
                <FileText size={24} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="m-0 mb-1 text-lg font-semibold leading-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap" title={viewingDocument.title}>
                  {viewingDocument.title}
                </h3>
                <p className="m-0 text-sm text-slate-600">Document Information</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Tag size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Category</span>
                </div>
                <div className="ml-11">
                  <CategoryBadge category={viewingDocument.category} />
              </div>
              </div>

              {/* Client */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Users size={16} aria-hidden="true" />
              </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Client</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingDocument.clientId?.name || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              {/* Access Level */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Lock size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access Level</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900 capitalize">
                  {viewingDocument.accessLevel || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              {/* Upload Date */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Calendar size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Upload Date</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingDocument.uploadDate 
                    ? new Date(viewingDocument.uploadDate).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                      })
                    : <span className="text-slate-400 italic">Not available</span>
                  }
                </p>
              </div>

              {/* File Type */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <File size={16} aria-hidden="true" />
              </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">File Type</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingDocument.file?.fileType?.split('/')[1]?.toUpperCase() || <span className="text-slate-400 italic">Not available</span>}
                </p>
              </div>

              {/* File Size */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <HardDrive size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">File Size</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingDocument.file?.fileSize 
                    ? `${(viewingDocument.file.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : <span className="text-slate-400 italic">Not available</span>
                  }
                </p>
              </div>
            </div>

            {/* Description - Full Width */}
            {viewingDocument.description && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <FileText size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Description</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingDocument.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
              <AccessibleButton
                onClick={() => handleOpenEditModal(viewingDocument)}
                variant="secondary"
                ariaLabel={`Edit ${viewingDocument.title}`}
                icon={<Edit size={18} aria-hidden="true" />}
                iconPosition="left"
              >
                Edit Document
              </AccessibleButton>
              <AccessibleButton
                onClick={() => {
                  handleDownload(viewingDocument._id);
                  handleCloseViewModal();
                }}
                variant="primary"
                ariaLabel={`Download ${viewingDocument.title}`}
                icon={<Download size={18} aria-hidden="true" />}
                iconPosition="left"
              >
                Download Document
              </AccessibleButton>
            </div>
          </div>
        )}
      </AccessibleModal>

      {/* Edit Document Modal */}
      <AccessibleModal
        isOpen={showEditModal && !!editingDocument}
        onClose={handleCloseEditModal}
        title="Edit Document"
        ariaLabel="Edit document form"
        size="md"
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="grid gap-4 md:grid-cols-2" noValidate>
          <AccessibleInput
            id="edit-title"
            label="Title"
            type="text"
            {...registerEdit('title')}
            error={editErrors.title?.message}
            required
            placeholder="Enter document title"
            ariaLabel="Document title"
            helperText="Minimum 3 characters, maximum 100 characters."
            className="md:col-span-2"
          />

          <div>
            <Controller
              name="category"
              control={editControl}
              render={({ field }) => (
                <SearchableDropdown
                  id="edit-category"
                  label="Category"
                  options={[
                    { value: 'Proposal', label: 'Proposal' },
                    { value: 'Invoice', label: 'Invoice' },
                    { value: 'Report', label: 'Report' },
                    { value: 'Contract', label: 'Contract' }
                  ]}
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Select Category"
                  error={editErrors.category?.message}
                  required
                  ariaLabel="Document category"
                  maxHeight="200px"
                  showSearch={false}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="clientId"
              control={editControl}
              render={({ field }) => (
                <SearchableDropdown
                  id="edit-client"
                  label="Client"
                  options={clients.map(c => ({ value: c._id, label: c.name, _id: c._id }))}
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value)}
                  placeholder="Select Client"
                  error={editErrors.clientId?.message}
                  required
                  ariaLabel="Select client"
                  maxHeight="250px"
                  showSearch={false}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="accessLevel"
              control={editControl}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Access Level *</label>
                  <div className="mt-2 flex flex-wrap gap-4" role="radiogroup" aria-label="Document access level">
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="radio"
                        {...field}
                        value="private"
                        className="h-[18px] w-[18px] cursor-pointer accent-accent"
                        aria-label="Private access"
                      />
                      <span>Private</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="radio"
                        {...field}
                        value="shared"
                        className="h-[18px] w-[18px] cursor-pointer accent-accent"
                        aria-label="Shared access"
                      />
                      <span>Shared</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="radio"
                        {...field}
                        value="public"
                        className="h-[18px] w-[18px] cursor-pointer accent-accent"
                        aria-label="Public access"
                      />
                      <span>Public</span>
                    </label>
                  </div>
                  {editErrors.accessLevel && (
                    <span role="alert" className="mt-1 block text-xs text-red-600">
                      {editErrors.accessLevel.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-description" className="mb-1 block text-sm font-medium text-text">
              Description
            </label>
            <textarea
              id="edit-description"
              {...registerEdit('description', {
                onChange: createTextareaOnChange((e) => {
                  setEditValue('description', e.target.value, { shouldValidate: true });
                }, 'description')
              })}
              className={`min-h-[100px] w-full resize-y rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${editErrors.description ? 'border-red-500 bg-white' : 'border-border bg-white'}`}
              placeholder="Enter document description (optional, max 300 characters)"
              rows="3"
              aria-label="Document description"
              aria-invalid={editErrors.description ? 'true' : 'false'}
              aria-describedby={editErrors.description ? 'description-error' : undefined}
              autoCapitalize="sentences"
            />
            {editErrors.description && (
              <span id="description-error" role="alert" className="mt-1 block text-xs text-red-600">
                {editErrors.description.message}
              </span>
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
              onClick={handleCloseEditModal}
              variant="secondary"
              disabled={isEditing}
              ariaLabel="Cancel edit"
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={isEditing || !isEditValid}
              loading={isEditing}
              ariaLabel={isEditing ? 'Updating document' : 'Update document'}
            >
              {isEditing ? 'Updating...' : 'Update Document'}
            </AccessibleButton>
          </div>
        </form>
      </AccessibleModal>
    </Layout>
  );
};

export default Documents;
