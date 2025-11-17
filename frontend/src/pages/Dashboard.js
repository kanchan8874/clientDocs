import { useState, useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);

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
    isMountedRef.current = true;
    
    // Delay initial load to avoid React Strict Mode double mount
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        loadDashboardData();
      }
    }, 100);

    return () => {
      isMountedRef.current = false;
      clearTimeout(loadTimer);
    };
  }, []);

  const loadDashboardData = async () => {
    if (!isMountedRef.current) return;

    try {
      const [clientsRes, documentsRes] = await Promise.all([
        getClients(),
        getDocuments()
      ]);

      if (!isMountedRef.current) return;

      const clients = clientsRes.data?.clients || [];
      const docs = documentsRes.data?.documents || [];

      setDocuments(docs);
      
      // Calculate accurate counts
      const isOwner = (doc) => doc.createdBy?._id === user?.id || doc.createdBy === user?.id;
      const ownedCount = docs.filter(doc => isOwner(doc)).length;
      const sharedCount = docs.filter(isSharedWithMe).length;
      const publicCount = docs.filter(doc => !isOwner(doc) && doc.accessLevel === 'public').length;
      
      // Total = owned + shared + public (no duplicates)
      const totalDocuments = ownedCount + sharedCount + publicCount;

      setStats({
        totalClients: clients.length,
        totalDocuments: totalDocuments,
        loading: false
      });

      setRecentClients(clients.slice(0, 4));
      setRecentDocuments(docs.slice(0, 4));
    } catch (error) {
      // Silently handle rate limit errors
      if (error.response?.status === 429 || error.status === 429 || error.message?.includes('Too many requests')) {
        if (isMountedRef.current) {
          setStats(prev => ({ ...prev, loading: false }));
        }
        return;
      }
      
      // Handle network errors
      if (error?.isNetworkError) {
        console.error('Network error loading dashboard data. Please ensure backend server is running on http://localhost:5000');
      } else {
        console.error('Error loading dashboard data:', error);
      }
      
      if (isMountedRef.current) {
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
  };

  return (
    <Layout>
      <section className="space-y-8 md:space-y-10 lg:space-y-12" aria-label="Dashboard overview">
        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6 sm:p-8 md:p-10 shadow-soft-glow">
          <div className="pointer-events-none absolute -top-14 right-10 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-56 w-56 rounded-full bg-info/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 md:gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2 sm:space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-accent shadow-xs">
                ClientDoc Pulse
              </span>
              <h1 className="m-0 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight text-text">
                Welcome back,{' '}
                <span 
                  className="inline-block max-w-[120px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap align-bottom"
                  title={user?.name || 'User'}
                >
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </h1>
              <p className="m-0 text-sm sm:text-base md:text-lg leading-relaxed text-text-muted">
                Stay on top of your client relationships, shared documents, and team activity in a premium workspace crafted for focus.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-white/80 p-4 sm:p-5 shadow-md backdrop-blur-sm sm:min-w-[220px] w-full sm:w-auto">
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
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-primary-600 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-soft-glow transition-all duration-200 hover:shadow-surface-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
              >
                Upload document
                <ArrowRight size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
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
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                <Users size={22} className="sm:w-[26px] sm:h-[26px]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-xs sm:text-sm font-medium uppercase tracking-wider text-text-subtle">Total clients</p>
                <p className="mb-0 text-2xl sm:text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : stats.totalClients}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-accent" aria-hidden="true" />
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
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success transition-transform duration-300 group-hover:scale-110">
                <FileText size={22} className="sm:w-[26px] sm:h-[26px]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-xs sm:text-sm font-medium uppercase tracking-wider text-text-subtle">Total documents</p>
                <p className="mb-0 text-2xl sm:text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : stats.totalDocuments}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-success" aria-hidden="true" />
              </div>
            </div>
          </button>

          <div
            className="surface-card bg-white/90 p-6 shadow-md backdrop-blur-sm"
            role="status"
            aria-label={`Shared documents: ${stats.loading ? 'loading' : documents.filter(isSharedWithMe).length}`}
          >
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-warning-light text-warning">
                <Share2 size={22} className="sm:w-[26px] sm:h-[26px]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-xs sm:text-sm font-medium uppercase tracking-wider text-text-subtle">Shared with you</p>
                <p className="mb-0 text-2xl sm:text-3xl font-semibold leading-none tracking-tight text-text">
                  {stats.loading ? '...' : documents.filter(isSharedWithMe).length}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-warning" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Quick actions" role="region">
          <h2 className="text-lg sm:text-xl md:text-[1.375rem] font-semibold leading-tight tracking-tight text-text">Quick actions</h2>
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={() => navigate('/clients')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-primary-50 to-white p-4 sm:p-6 text-left shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-surface"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
              <div className="relative z-10 flex items-center gap-3 sm:gap-5">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent transition-transform duration-300 group-hover:scale-110">
                  <Plus size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-sm sm:text-base font-semibold text-text">Add client</div>
                  <div className="text-xs sm:text-sm text-text-muted">Create a new client profile instantly.</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-primary-50 to-white p-4 sm:p-6 text-left shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-surface"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-success-light blur-2xl" />
              <div className="relative z-10 flex items-center gap-3 sm:gap-5">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-success-light text-success transition-transform duration-300 group-hover:scale-110">
                  <Upload size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-sm sm:text-base font-semibold text-text">Upload document</div>
                  <div className="text-xs sm:text-sm text-text-muted">Add files and organize with a single click.</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-primary-600 p-4 sm:p-6 text-left text-white shadow-soft-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-surface-strong"
            >
              <div className="relative z-10 flex items-center gap-3 sm:gap-5">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition-transform duration-300 group-hover:scale-110">
                  <ArrowRight size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-sm sm:text-base font-semibold">Browse workspace</div>
                  <div className="text-xs sm:text-sm text-white/80">Jump into your full document library.</div>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2 xl:items-stretch">
          {/* Recent Clients Section */}
          <section className="flex flex-col space-y-4 sm:space-y-5" aria-label="Recent clients" role="region">
            {/* Header with icon, title, and View All button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/20">
                  <Users size={18} className="sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight text-slate-900">Recent Clients</h2>
              </div>
              <button
                onClick={() => navigate('/clients')}
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-blue-500/60 bg-transparent px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-blue-600 transition-all duration-300 ease-out hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2"
                aria-label="View all clients"
              >
                <span className="relative z-10 transition-colors duration-300">View All</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </div>

            {/* Glassmorphism container with gradient background - No scroll, exactly 4 cards */}
            <div className="relative flex-1 overflow-visible rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white via-blue-50/15 to-white/95 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-[0_4px_12px_rgba(59,130,246,0.08),0_2px_4px_rgba(0,0,0,0.05)] hover:border-blue-200/70">
              {/* Subtle gradient overlay */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-blue-400/6 blur-3xl transition-opacity duration-500" aria-hidden="true" />
              <div className="pointer-events-none absolute -left-6 -bottom-6 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-blue-300/4 blur-2xl transition-opacity duration-500" aria-hidden="true" />
              
              {/* Cards grid - 4 cards max, no scroll, fixed height */}
              {recentClients.length > 0 ? (
                <div className="relative grid grid-cols-1 gap-3 sm:gap-4">
                  {recentClients.map((client) => (
                    <div
                      key={client._id}
                      className="group/item relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-100/70 bg-white/90 p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-200/50 hover:bg-white hover:shadow-[0_4px_12px_rgba(59,130,246,0.12),0_2px_4px_rgba(0,0,0,0.08)]"
                    >
                      {/* Icon with soft blue gradient */}
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:shadow-lg group-hover/item:shadow-blue-500/30">
                        <Users size={16} className="sm:w-[18px] sm:h-[18px] text-white" aria-hidden="true" />
                      </div>
                      
                      {/* Client info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="mb-0.5 sm:mb-1 text-sm sm:text-[0.9375rem] font-semibold leading-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-200 ease-out group-hover/item:text-blue-700"
                          title={client.name}
                          aria-label={`Client: ${client.name}`}
                        >
                          {client.name}
                        </h3>
                        <p 
                          className="text-xs leading-relaxed text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap"
                          title={`${client.email || 'No email'}${client.company ? ` • ${client.company}` : ''}`}
                        >
                          {client.email || 'No email'}{client.company ? ` • ${client.company}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                  <div className="mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Users size={28} className="sm:w-8 sm:h-8 text-slate-400" aria-hidden="true" />
                  </div>
                  <p className="mb-3 sm:mb-4 text-sm font-medium text-slate-600">No clients yet.</p>
                  <button
                    onClick={() => navigate('/clients')}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-200 ease-out hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2"
                  >
                    Create your first client
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Documents Section */}
          <section className="flex flex-col space-y-4 sm:space-y-5" aria-label="Recent documents" role="region">
            {/* Header with icon, title, and View All button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/20">
                  <FileText size={18} className="sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight text-slate-900">Recent Documents</h2>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/60 bg-transparent px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-emerald-600 transition-all duration-300 ease-out hover:border-emerald-500 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2"
                aria-label="View all documents"
              >
                <span className="relative z-10 transition-colors duration-300">View All</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            </div>

            {/* Glassmorphism container with gradient background - No scroll, exactly 4 cards */}
            <div className="relative flex-1 overflow-visible rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white via-emerald-50/15 to-white/95 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-[0_4px_12px_rgba(34,197,94,0.08),0_2px_4px_rgba(0,0,0,0.05)] hover:border-emerald-200/70">
              {/* Subtle gradient overlay */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-emerald-400/6 blur-3xl transition-opacity duration-500" aria-hidden="true" />
              <div className="pointer-events-none absolute -left-6 -bottom-6 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-emerald-300/4 blur-2xl transition-opacity duration-500" aria-hidden="true" />
              
              {/* Cards grid - 4 cards max, no scroll, fixed height */}
              {recentDocuments.length > 0 ? (
                <div className="relative grid grid-cols-1 gap-3 sm:gap-4">
                  {recentDocuments.map((doc) => {
                    // Check if document is owned by current user or shared
                    const isOwned = doc.createdBy?._id === user?.id || doc.createdBy === user?.id;
                    const isShared = !isOwned && doc.accessLevel === 'shared' && doc.sharedWith?.some(id => 
                      (typeof id === 'object' ? id._id : id) === user?.id || 
                      (typeof id === 'object' ? id._id : id)?.toString() === user?.id?.toString()
                    );
                    
                    return (
                      <div
                        key={doc._id}
                        className="group/item relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-100/70 bg-white/90 p-3.5 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-200/50 hover:bg-white hover:shadow-[0_4px_12px_rgba(34,197,94,0.12),0_2px_4px_rgba(0,0,0,0.08)]"
                      >
                        {/* Icon with soft green gradient */}
                        <div className="flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 transition-all duration-300 ease-out group-hover/item:scale-110 group-hover/item:shadow-lg group-hover/item:shadow-emerald-500/30">
                          <FileText size={16} className="sm:w-[18px] sm:h-[18px] text-white" aria-hidden="true" />
                        </div>
                        
                        {/* Document info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                            <h3
                              className="text-sm sm:text-[0.9375rem] font-semibold leading-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-200 ease-out group-hover/item:text-emerald-700 flex-1 min-w-0"
                              title={doc.title}
                              aria-label={`Document: ${doc.title}`}
                            >
                              {doc.title}
                            </h3>
                            {isShared && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold flex-shrink-0" title="Shared Document">
                                <Share2 size={10} aria-hidden="true" />
                                <span className="hidden sm:inline">Shared</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs leading-relaxed text-slate-600">
                            <CategoryBadge category={doc.category} />
                            {doc.clientId?.name && (
                              <span 
                                className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-emerald-700"
                                title={`Client: ${doc.clientId.name}`}
                              >
                                • {doc.clientId.name}
                              </span>
                            )}
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap" title={doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}>• {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                  <div className="mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <FileText size={28} className="sm:w-8 sm:h-8 text-slate-400" aria-hidden="true" />
                  </div>
                  <p className="mb-3 sm:mb-4 text-sm font-medium text-slate-600">No documents yet.</p>
                  <button
                    onClick={() => navigate('/documents')}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 ease-out hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2"
                  >
                    Upload your first document
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
};


export default Dashboard;
