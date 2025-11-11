import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users, Edit, Trash2, Mail, Phone, Building2, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients.js';
import { clientSchema } from '../utils/validation.js';
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
  
  // React Hook Form setup
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: formErrors, isSubmitting, isValid },
    reset,
    setError: setFormError,
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

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await getClients();
      setClients(response.data?.clients || []);
      setError('');
    } catch (err) {
      setError('Failed to load clients. Please try again.');
      console.error('Error loading clients:', err);
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

  return (
    <Layout>
      {/* Content */}
      <section className="mx-auto max-w-[1400px]" aria-label="Clients management">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-text sm:text-3xl">Clients</h1>
            <p className="m-0 text-sm text-text-muted sm:text-base">Manage your client relationships and information</p>
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
            <h2 className="mb-2 text-xl font-semibold text-text">No clients yet</h2>
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
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent" aria-hidden="true">
                    <Users size={20} />
                  </div>
                  <h3
                    className="m-0 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-text"
                    title={client.name}
                    aria-label={`Client: ${client.name}`}
                  >
                    {client.name.length > 20 ? `${client.name.substring(0, 20)}…` : client.name}
                  </h3>
                  <div className="flex flex-shrink-0 gap-2" role="group" aria-label={`Actions for ${client.name}`}>
                    <AccessibleButton
                      onClick={() => handleOpenModal(client)}
                      variant="ghost"
                      size="sm"
                      ariaLabel={`Edit ${client.name}`}
                      icon={<Edit size={16} aria-hidden="true" />}
                    />
                    <AccessibleButton
                      onClick={() => handleDeleteClick(client._id)}
                      variant="ghost"
                      size="sm"
                      ariaLabel={`Delete ${client.name}`}
                      icon={<Trash2 size={16} aria-hidden="true" />}
                    />
                  </div>
                </div>
                <dl className="flex flex-col gap-3">
                  {client.email && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text">
                      <dt className="sr-only">Email</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.email}>
                        <Mail size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.email}</span>
                      </dd>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text">
                      <dt className="sr-only">Phone</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.phone}>
                        <Phone size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.phone}</span>
                      </dd>
                    </div>
                  )}
                  {client.company && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text">
                      <dt className="sr-only">Company</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.company}>
                        <Building2 size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.company}</span>
                      </dd>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex min-w-0 items-center text-[0.9375rem] text-text">
                      <dt className="sr-only">Address</dt>
                      <dd className="flex min-w-0 flex-1 items-center text-text" title={client.address}>
                        <MapPin size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{client.address}</span>
                      </dd>
                    </div>
                  )}
                  <div className="flex min-w-0 items-center text-[0.9375rem] text-text">
                    <dt className="sr-only">Date added</dt>
                    <dd className="flex min-w-0 flex-1 items-center text-text">
                      <Calendar size={16} className="mr-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
                      Added {new Date(client.createdAt).toLocaleDateString()}
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
          />

          <AccessibleInput
            id="client-email"
            label="Email"
            type="email"
            {...register('email')}
            error={formErrors.email?.message}
            placeholder="client@example.com"
            ariaLabel="Client email address"
          />

          <AccessibleInput
            id="client-phone"
            label="Phone"
            type="tel"
            {...register('phone')}
            error={formErrors.phone?.message}
            placeholder="1234567890"
            ariaLabel="Client phone number"
            helperText="Enter exactly 10 digits (optional)"
          />

          <AccessibleInput
            id="client-company"
            label="Company"
            type="text"
            {...register('company')}
            placeholder="Company name"
            ariaLabel="Client company name"
          />

          <div className="md:col-span-2">
            <label htmlFor="client-address" className="mb-1 block text-sm font-medium leading-normal text-text">
              Address
            </label>
            <textarea
              id="client-address"
              {...register('address')}
              className={`w-full resize-y rounded-2xl border px-4 py-3.5 text-[0.9375rem] font-sans text-text transition-colors duration-200 ${
                formErrors.address ? 'border-red-600 bg-white' : 'border-border bg-white'
              }`}
              placeholder="Full address"
              rows="3"
              aria-label="Client address"
              aria-invalid={formErrors.address ? 'true' : 'false'}
              aria-describedby={formErrors.address ? 'address-error' : undefined}
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
