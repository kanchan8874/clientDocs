import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Plus, Upload, ArrowRight, TrendingUp, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { getClients } from '../api/clients.js';
import { getDocuments } from '../api/documents.js';
import Layout from '../components/Layout.js';
import CategoryBadge from '../components/CategoryBadge.js';



const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDocuments: 0,
    loading: true
  });
  const [recentClients, setRecentClients] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Helper function to check if a document is shared with current user
  // Returns true only if:
  // 1. Document is NOT owned by current user
  // 2. Document accessLevel is 'shared' (not 'public')
  // 3. Current user's ID is in the sharedWith array
  const isSharedWithMe = (doc) => {
    // Exclude owner's documents
    if (doc.createdBy?._id === user?.id || doc.createdBy === user?.id) {
      return false;
    }
    // Only shared documents, not public
    if (doc.accessLevel !== 'shared') {
      return false;
    }
    // Check if current user is in sharedWith array
    const sharedWithIds = doc.sharedWith?.map(u => u?._id || u) || [];
    return sharedWithIds.some(id => 
      id === user?.id || id?.toString() === user?.id?.toString()
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clientsRes, documentsRes] = await Promise.all([
        getClients(),
        getDocuments()
      ]);

      const clients = clientsRes.data?.clients || [];
      const docs = documentsRes.data?.documents || [];

      setDocuments(docs);
      setStats({
        totalClients: clients.length,
        totalDocuments: docs.length,
        loading: false
      });

      setRecentClients(clients.slice(0, 5));
      setRecentDocuments(docs.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Layout>
      <section className="space-y-10 md:space-y-12" aria-label="Dashboard overview">
        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-50 via-white to-primary-100 p-8 shadow-soft-glow sm:p-10">
          <div className="pointer-events-none absolute -top-14 right-10 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-56 w-56 rounded-full bg-info/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent shadow-xs">
                ClientDoc Pulse
              </span>
              <h1 className="m-0 text-2xl font-semibold leading-tight tracking-tight text-text sm:text-3xl md:text-4xl">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="m-0 text-base leading-relaxed text-text-muted sm:text-lg">
                Stay on top of your client relationships, shared documents, and team activity in a premium workspace crafted for focus.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-white/80 p-5 shadow-md backdrop-blur-sm sm:min-w-[220px]">
              <div className="flex items-center justify-between text-sm font-medium text-text-subtle">
                <span>Clients</span>
                <span className="text-lg font-semibold text-text">{stats.loading ? '...' : stats.totalClients}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-text-subtle">
                <span>Documents</span>
                <span className="text-lg font-semibold text-text">{stats.loading ? '...' : stats.totalDocuments}</span>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
              >
                Upload document
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <section
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Statistics overview"
          role="region"
        >
          <button
            type="button"
            onClick={() => navigate('/clients')}
            aria-label={`View all clients. Total: ${stats.loading ? 'loading' : stats.totalClients}`}
            className="interactive-card group w-full bg-white/80 p-6 text-left shadow-md backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/clients');
              }
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                <Users size={26} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-text-subtle">Total clients</p>
                <p className="mb-0 text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : stats.totalClients}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={18} className="text-accent" aria-hidden="true" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/documents')}
            aria-label={`View all documents. Total: ${stats.loading ? 'loading' : stats.totalDocuments}`}
            className="interactive-card group w-full bg-white/80 p-6 text-left shadow-md backdrop-blur-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/documents');
              }
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success transition-transform duration-300 group-hover:scale-110">
                <FileText size={26} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-text-subtle">Total documents</p>
                <p className="mb-0 text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : stats.totalDocuments}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={18} className="text-success" aria-hidden="true" />
              </div>
            </div>
          </button>

          <div
            className="surface-card bg-white/90 p-6 shadow-md backdrop-blur-sm"
            role="status"
            aria-label={`Shared documents: ${stats.loading ? 'loading' : documents.filter(isSharedWithMe).length}`}
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-warning-light text-warning">
                <Share2 size={26} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-sm font-medium uppercase tracking-wider text-text-subtle">Shared with you</p>
                <p className="mb-0 text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : documents.filter(isSharedWithMe).length}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={18} className="text-warning" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Quick actions" role="region">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">Quick actions</h2>
            <p className="m-0 text-sm text-text-muted">
              Speed up your workflow with curated shortcuts for frequent tasks.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={() => navigate('/clients')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-primary-50 to-white p-6 text-left shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-surface"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent transition-transform duration-300 group-hover:scale-110">
                  <Plus size={24} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-base font-semibold text-text">Add client</div>
                  <div className="text-sm text-text-muted">Create a new client profile instantly.</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-primary-50 to-white p-6 text-left shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-surface"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-success-light blur-2xl" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success transition-transform duration-300 group-hover:scale-110">
                  <Upload size={24} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-base font-semibold text-text">Upload document</div>
                  <div className="text-sm text-text-muted">Add files and organize with a single click.</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-primary-600 p-6 text-left text-white shadow-soft-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-surface-strong"
            >
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight size={24} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-base font-semibold">Browse workspace</div>
                  <div className="text-sm text-white/80">Jump into your full document library.</div>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="space-y-6" aria-label="Recent clients" role="region">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">Recent clients</h2>
              <button
                onClick={() => navigate('/clients')}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-primary-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
              >
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            {recentClients.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentClients.map((client) => (
                  <div
                    key={client._id}
                    className="surface-card flex items-center gap-5 rounded-3xl bg-white/90 p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-surface backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                      <Users size={20} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="mb-1 text-[0.95rem] font-semibold leading-tight text-text"
                        title={client.name}
                        aria-label={`Client: ${client.name}`}
                      >
                        {client.name.length > 20 ? `${client.name.substring(0, 20)}…` : client.name}
                      </div>
                      <div className="text-sm leading-normal text-text-muted">
                        {client.email || 'No email'} • {client.company || 'No company'}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/clients')}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent to-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card text-center py-12 px-6">
                <Users size={48} className="mx-auto text-neutral-300" aria-hidden="true" />
                <p className="mt-6 mb-4 text-[0.9375rem] text-text-muted">No clients yet</p>
                <button
                  onClick={() => navigate('/clients')}
                  className="rounded-full bg-gradient-to-r from-accent to-primary-600 px-6 py-3 text-[0.9375rem] font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Create your first client
                </button>
              </div>
            )}
          </section>

          <section className="space-y-6" aria-label="Recent documents" role="region">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">Recent documents</h2>
              <button
                onClick={() => navigate('/documents')}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-primary-50 px-4 py-2 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-primary-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
              >
                View all
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            {recentDocuments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="surface-card flex items-center gap-5 rounded-3xl bg-white/90 p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-surface backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success">
                      <FileText size={20} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 text-[0.95rem] font-semibold leading-tight text-text">{doc.title}</div>
                      <div className="flex items-center gap-2 text-sm leading-normal text-text-muted">
                        <CategoryBadge category={doc.category} /> • {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/documents')}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent to-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card text-center py-12 px-6">
                <FileText size={48} className="mx-auto text-neutral-300" aria-hidden="true" />
                <p className="mt-6 mb-4 text-[0.9375rem] text-text-muted">No documents yet</p>
                <button
                  onClick={() => navigate('/documents')}
                  className="rounded-full bg-gradient-to-r from-accent to-primary-600 px-6 py-3 text-[0.9375rem] font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </section>
        </div>
      </section>
    </Layout>
  );
};


export default Dashboard;
