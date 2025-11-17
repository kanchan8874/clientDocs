import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users, Edit, Trash2, Mail, Phone, Building2, MapPin, Calendar, AlertTriangle, Eye, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients.js';
import { clientSchema } from '../utils/validation.js';
import { createTextareaOnChange } from '../utils/textTransform.js';
import Layout from '../components/Layout.js';
import AccessibleModal from '../components/AccessibleModal.js';
import AccessibleInput from '../components/AccessibleInput.js';
import AccessibleButton from '../components/AccessibleButton.js';


const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // View client modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: formErrors, isSubmitting, isValid },
    reset,
    setError: setFormError,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      address: ''
    }
  });

  // Watch client name for character counter
  const clientName = watch('name') || '';
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  // Menu state for client actions
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

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

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getClients();
      setClients(response.data?.clients || []);
      setError('');
    } catch (err) {
      // Don't show error for rate limit (429) errors - just log it
      if (err?.response?.status === 429 || err?.status === 429) {
        console.warn('Rate limit reached. Please wait a moment and refresh.');
        setError('');
      } else if (err?.isNetworkError) {
        // Network error - server not running or connection issue
        setError('Unable to connect to server. Please ensure the backend server is running on http://localhost:5000');
        console.error('Network error loading clients:', err);
      } else {
        setError(err?.message || 'Failed to load clients. Please try again.');
        console.error('Error loading clients:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    reset();
    setError('');
    setSuccess('');
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    // Frontend validation: Check if client email matches current user's email
    if (data.email && data.email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setError('You cannot use your own email address for a client. Please use a different email address.');
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        await updateClient(editingClient._id, data);
        setSuccess('Client updated successfully!');
      } else {
        // Create new client
        await createClient(data);
        setSuccess('Client created successfully!');
      }
      
      handleCloseModal();
      loadClients();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.message ||
                      'Failed to save client. Please try again.';
      setError(errorMsg);
    }
  };

  const handleDeleteClick = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    setClientToDelete({ id: clientId, name: client?.name || 'this client' });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id);
      setSuccess('Client deleted successfully!');
      setShowDeleteModal(false);
      setClientToDelete(null);
      loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete client. Please try again.');
      console.error('Error deleting client:', err);
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  const handleViewClick = (client) => {
    setViewingClient(client);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingClient(null);
  };

  return (
    <Layout>
      {/* Content */}
      <section className="mx-auto max-w-[1400px]" aria-label="Clients management">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-text sm:text-3xl">Clients</h1>
            <p className="m-0 text-sm text-text-muted sm:text-base">Manage your client relationships and information.</p>
          </div>
          <AccessibleButton
            onClick={() => handleOpenModal()}
            variant="primary"
            ariaLabel="Add new client"
            icon={<Plus size={20} aria-hidden="true" />}
            iconPosition="left"
          >
            Add New Client
          </AccessibleButton>
        </header>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[0.9375rem] text-red-700"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-[0.9375rem] text-green-700"
          >
            {success}
          </div>
        )}

        {/* Clients List */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center text-base text-text-muted" role="status" aria-live="polite" aria-label="Loading clients">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-300 border-t-accent" aria-hidden="true"></div>
            <p>Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="glass-card py-16 px-8 text-center" role="status" aria-live="polite">
            <div className="mb-6 flex justify-center text-neutral-300" aria-hidden="true">
              <Users size={64} />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text">No clients yet.</h2>
            <p className="mb-6 text-[0.9375rem] text-text-muted">Create your first client to get started!</p>
            <AccessibleButton
              onClick={() => handleOpenModal()}
              variant="primary"
              ariaLabel="Add your first client"
              icon={<Plus size={18} aria-hidden="true" />}
              iconPosition="left"
            >
              Add Your First Client
            </AccessibleButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Client list">
            {clients.map((client) => (
              <article
                key={client._id}
                role="listitem"
                className="surface-card rounded-3xl bg-white/90 p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-surface backdrop-blur-sm"
              >
                <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-border pb-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent" aria-hidden="true">
                    <Users size={18} />
                  </div>
                  <h3
                    className="m-0 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-text"
                    title={client.name}
                    aria-label={`Client: ${client.name}`}
                  >
                    {client.name}
                  </h3>
                  <div className="relative flex-shrink-0" role="group" aria-label={`Actions for ${client.name}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === client._id ? null : client._id);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      aria-label={`More options for ${client.name}`}
                      aria-expanded={openMenuId === client._id}
                      aria-haspopup="true"
                    >
                      <MoreVertical size={18} aria-hidden="true" />
                    </button>
                    
                    {openMenuId === client._id && (
                      <div 
                        className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-2"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(client);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          role="menuitem"
                          aria-label={`View ${client.name} details`}
                        >
                          <Eye size={16} className="text-slate-500" aria-hidden="true" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(client);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          role="menuitem"
                          aria-label={`Edit ${client.name}`}
                        >
                          <Edit size={16} className="text-slate-500" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(client._id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                          role="menuitem"
                          aria-label={`Delete ${client.name}`}
                        >
                          <Trash2 size={16} className="text-red-500" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <dl className="flex flex-col gap-0">
                  {client.email && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text py-2.5 border-b border-slate-100">
                      <dt className="sr-only">Email</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.email}>
                        <Mail size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.email}</span>
                      </dd>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text py-2.5 border-b border-slate-100">
                      <dt className="sr-only">Phone</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.phone}>
                        <Phone size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.phone}</span>
                      </dd>
                    </div>
                  )}
                  {client.company && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text py-2.5 border-b border-slate-100">
                      <dt className="sr-only">Company</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.company}>
                        <Building2 size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.company}</span>
                      </dd>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text py-2.5 border-b border-slate-100">
                      <dt className="sr-only">Address</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.address}>
                        <MapPin size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.address}</span>
                      </dd>
                    </div>
                  )}
                  <div className="flex min-w-0 items-center text-[0.9375rem] text-text py-2.5">
                    <dt className="sr-only">Date added</dt>
                    <dd className="flex min-w-0 flex-1 items-center text-text">
                      <Calendar size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                      Added On {new Date(client.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Modal for Create/Edit */}
      <AccessibleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        ariaLabel={editingClient ? 'Edit client form' : 'Add new client form'}
        size="md"
      >
        <form onSubmit={handleFormSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2" noValidate>
          <AccessibleInput
            id="client-name"
            label="Client Name"
            type="text"
            {...register('name')}
            error={formErrors.name?.message}
            required
            placeholder="Enter client name"
            ariaLabel="Client name"
            helperText={`${clientName.length}/100 characters (Minimum 3, maximum 100)`}
            maxLength={100}
          />

          <AccessibleInput
            id="client-email"
            label="Email"
            type="email"
            {...register('email')}
            error={formErrors.email?.message}
            placeholder="client@example.com"
            ariaLabel="Client email address"
            maxLength={254}
          />

          <AccessibleInput
            id="client-phone"
            label="Phone"
            type="tel"
            {...register('phone')}
            error={formErrors.phone?.message}
            placeholder="1234567890"
            ariaLabel="Client phone number"
            helperText="Enter exactly 10 digits (optional)."
            maxLength={10}
          />

          <AccessibleInput
            id="client-company"
            label="Company"
            type="text"
            {...register('company')}
            placeholder="Company name"
            ariaLabel="Client company name"
            maxLength={200}
          />

          <div className="md:col-span-2">
            <label htmlFor="client-address" className="mb-1 block text-sm font-medium leading-normal text-text">
              Address
            </label>
            <textarea
              id="client-address"
              {...register('address', {
                onChange: createTextareaOnChange((e) => {
                  setValue('address', e.target.value, { shouldValidate: true });
                }, 'address')
              })}
              className={`w-full resize-y rounded-2xl border px-4 py-3.5 text-[0.9375rem] font-sans text-text transition-colors duration-200 ${
                formErrors.address ? 'border-red-600 bg-white' : 'border-border bg-white'
              }`}
              placeholder="Full address"
              rows="3"
              aria-label="Client address"
              aria-invalid={formErrors.address ? 'true' : 'false'}
              aria-describedby={formErrors.address ? 'address-error' : undefined}
              autoCapitalize="sentences"
            />
            {formErrors.address && (
              <span id="address-error" role="alert" className="mt-1 block text-xs text-red-700">
                {formErrors.address.message}
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
              onClick={handleCloseModal}
              variant="secondary"
              disabled={isSubmitting}
              ariaLabel="Cancel and close form"
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}
              ariaLabel={isSubmitting ? 'Saving client' : editingClient ? 'Update client' : 'Create client'}
            >
              {isSubmitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
            </AccessibleButton>
          </div>
        </form>
      </AccessibleModal>

      {/* View Client Details Modal */}
      <AccessibleModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        title="Client Details"
        ariaLabel="View client details"
        size="md"
      >
        {viewingClient && (
          <div className="space-y-6">
            {/* Client Name Section */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 p-5 shadow-sm">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-primary-500 to-primary-700 shadow-md shadow-accent/20">
                <Users size={24} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="m-0 mb-1 text-lg font-semibold leading-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap" title={viewingClient.name}>
                  {viewingClient.name}
                </h3>
                <p className="m-0 text-sm text-slate-600">Client Information</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Email</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingClient.email || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Phone size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Phone</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingClient.phone || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Building2 size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Company</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingClient.company || <span className="text-slate-400 italic">Not provided</span>}
                </p>
              </div>

              {/* Added On */}
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Calendar size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Added On</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingClient.createdAt 
                    ? new Date(viewingClient.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : <span className="text-slate-400 italic">Not available</span>
                  }
                </p>
              </div>
            </div>

            {/* Address - Full Width */}
            {viewingClient.address && (
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors duration-200 hover:bg-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <MapPin size={16} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Address</span>
                </div>
                <p className="m-0 ml-11 break-words text-sm font-medium leading-relaxed text-slate-900">
                  {viewingClient.address}
                </p>
              </div>
            )}
          </div>
        )}
      </AccessibleModal>

      {/* Delete Confirmation Modal */}
      <AccessibleModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Delete Client"
        ariaLabel="Delete client confirmation"
        size="sm"
      >
        {/* Single-layer confirmation content (no inner card) */}
        <div className="flex flex-col items-center text-center pt-2 gap-3" role="group" aria-label="Delete confirmation">
          <div className="flex justify-center mb-2" aria-hidden="true">
            <AlertTriangle size={48} className="text-red-600" />
          </div>
          <p className="text-[0.9375rem] text-slate-600 leading-relaxed m-0 max-w-[36ch]">
            Are you sure you want to delete <strong>{clientToDelete?.name}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-4 justify-end mt-5">
          <AccessibleButton
            onClick={handleDeleteCancel}
            variant="secondary"
            ariaLabel="Cancel deletion"
          >
            Cancel
          </AccessibleButton>
          <AccessibleButton
            onClick={handleDeleteConfirm}
            variant="danger"
            ariaLabel={`Confirm deletion of ${clientToDelete?.name}`}
          >
            Delete Client
          </AccessibleButton>
    </div>
      </AccessibleModal>
    </Layout>
  );
};


export default Clients;
