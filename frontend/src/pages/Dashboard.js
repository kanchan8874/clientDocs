import React, { useState, useEffect } from 'react';
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
      <section 
        className="max-w-[1400px] mx-auto w-full"
        aria-label="Dashboard overview"
      >
        {/* Welcome Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-slate-900 m-0 mb-2 tracking-tight leading-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-base text-slate-600 font-normal leading-relaxed m-0">
              Here's what's happening with your clients and documents today.
            </p>
          </div>
        </header>

        {/* Statistics Cards */}
        <section 
          className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12"
          aria-label="Statistics overview"
          role="region"
        >
          <button
            type="button"
            onClick={() => navigate('/clients')}
            aria-label={`View all clients. Total: ${stats.loading ? 'loading' : stats.totalClients}`}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/35 p-6 text-left font-sans text-slate-900 shadow-soft-glow transition-all duration-300 cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 hover:-translate-y-1 hover:shadow-ambient-glow"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/clients');
              }
            }}
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500/5 via-transparent to-transparent" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-primary-light flex items-center justify-center flex-shrink-0 shadow-inner">
                <Users size={24} color="#1A73E8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-slate-900">{stats.loading ? '...' : stats.totalClients}</div>
                <div className="text-sm font-medium text-slate-600 tracking-wide">Total Clients</div>
              </div>
              <div className="flex items-center ml-auto flex-shrink-0">
                <TrendingUp size={18} color="#1A73E8" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/documents')}
            aria-label={`View all documents. Total: ${stats.loading ? 'loading' : stats.totalDocuments}`}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50/35 p-6 text-left font-sans text-slate-900 shadow-soft-glow transition-all duration-300 cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 hover:-translate-y-1 hover:shadow-ambient-glow"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/documents');
              }
            }}
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-400/10 via-transparent to-transparent" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-green-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <FileText size={24} color="#34A853" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-slate-900">{stats.loading ? '...' : stats.totalDocuments}</div>
                <div className="text-sm font-medium text-slate-600 tracking-wide">Total Documents</div>
              </div>
              <div className="flex items-center ml-auto flex-shrink-0">
                <TrendingUp size={18} color="#34A853" />
              </div>
            </div>
          </button>

          <div 
            className="relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-amber-50/35 p-6 text-slate-900 shadow-soft-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-ambient-glow"
            role="status"
            aria-label={`Shared documents: ${stats.loading ? 'loading' : documents.filter(isSharedWithMe).length}`}
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-amber-400/10 via-transparent to-transparent" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-yellow-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Share2 size={24} color="#F4B400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-slate-900">
                  {stats.loading ? '...' : documents.filter(isSharedWithMe).length}
                </div>
                <div className="text-sm font-medium text-slate-600 tracking-wide">Shared With Me</div>
              </div>
              <div className="flex items-center ml-auto flex-shrink-0">
                <TrendingUp size={18} color="#F4B400" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section 
          className="mb-12"
          aria-label="Quick actions"
          role="region"
        >
          <h2 className="text-[1.375rem] font-semibold text-slate-900 m-0 tracking-tight leading-tight mb-0">Quick Actions</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mt-6">
            <button 
              onClick={() => navigate('/clients')} 
              className="relative flex items-center gap-4 rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/30 p-6 text-left font-sans text-slate-900 shadow-soft-glow transition-all duration-300 cursor-pointer outline-none hover:-translate-y-1 hover:shadow-ambient-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50/70 flex items-center justify-center flex-shrink-0 shadow-inner"><Plus size={24} color="#1A73E8" /></div>
              <div className="flex-1">
                <div className="text-base font-semibold text-slate-900 mb-1">Add Client</div>
                <div className="text-sm text-slate-600">Create a new client profile</div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/documents')} 
              className="relative flex items-center gap-4 rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 text-left font-sans text-slate-900 shadow-soft-glow transition-all duration-300 cursor-pointer outline-none hover:-translate-y-1 hover:shadow-ambient-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50/70 flex items-center justify-center flex-shrink-0 shadow-inner"><Upload size={24} color="#34A853" /></div>
              <div className="flex-1">
                <div className="text-base font-semibold text-slate-900 mb-1">Upload Document</div>
                <div className="text-sm text-slate-600">Add a new document</div>
              </div>
          </button>
        </div>
        </section>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
          {/* Recent Clients */}
          <section className="mb-12" aria-label="Recent clients" role="region">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[1.375rem] font-semibold text-slate-900 m-0 tracking-tight leading-tight">Recent Clients</h2>
              <button 
                onClick={() => navigate('/clients')} 
                className="bg-transparent border-none text-primary text-sm font-semibold cursor-pointer flex items-center font-sans transition-colors duration-200 hover:text-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                View All <ArrowRight size={16} className="ml-1 inline-block align-middle" />
              </button>
            </div>
            {recentClients.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentClients.map((client, index) => (
                  <div 
                    key={client._id} 
                    className="flex items-center gap-4 p-5 rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/25 transition-all duration-300 cursor-pointer shadow-soft-glow hover:-translate-y-1 hover:shadow-ambient-glow"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary-light/80 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <Users size={18} color="#1A73E8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-[0.9375rem] font-semibold text-slate-900 mb-1 leading-tight"
                        title={client.name}
                        aria-label={`Client: ${client.name}`}
                      >
                        {client.name.length > 20 ? `${client.name.substring(0, 20)}...` : client.name}
                      </div>
                      <div className="text-sm text-slate-600 leading-normal">
                        {client.email || 'No email'} • {client.company || 'No company'}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/clients')}
                      className="py-2.5 px-5 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer font-sans transition-all duration-200 shadow-ambient-glow hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <Users size={48} color="#d1d5db" />
                <p className="text-[0.9375rem] text-slate-600 mt-4 mb-6">No clients yet</p>
                <button 
                  onClick={() => navigate('/clients')} 
                  className="py-3 px-6 bg-primary text-white border-none rounded-lg text-[0.9375rem] font-semibold cursor-pointer font-sans transition-colors duration-200 shadow-ambient-glow hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Create Your First Client
          </button>
              </div>
            )}
          </section>

          {/* Recent Documents */}
          <section className="mb-12" aria-label="Recent documents" role="region">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[1.375rem] font-semibold text-slate-900 m-0 tracking-tight leading-tight">Recent Documents</h2>
              <button 
                onClick={() => navigate('/documents')} 
                className="bg-transparent border-none text-primary text-sm font-semibold cursor-pointer flex items-center font-sans transition-colors duration-200 hover:text-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                View All <ArrowRight size={16} className="ml-1 inline-block align-middle" />
          </button>
        </div>
            {recentDocuments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentDocuments.map((doc, index) => (
                  <div 
                    key={doc._id} 
                    className="flex items-center gap-4 p-5 rounded-2xl border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50/20 transition-all duration-300 cursor-pointer shadow-soft-glow hover:-translate-y-1 hover:shadow-ambient-glow"
                  >
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <FileText size={18} color="#34A853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.9375rem] font-semibold text-slate-900 mb-1 leading-tight">{doc.title}</div>
                      <div className="text-sm text-slate-600 leading-normal flex items-center gap-2">
                        <CategoryBadge category={doc.category} /> • {new Date(doc.uploadDate).toLocaleDateString()}
      </div>
    </div>
                    <button
                      onClick={() => navigate('/documents')}
                      className="py-2.5 px-5 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer font-sans transition-all duration-200 shadow-ambient-glow hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <FileText size={48} color="#d1d5db" />
                <p className="text-[0.9375rem] text-slate-600 mt-4 mb-6">No documents yet</p>
                <button 
                  onClick={() => navigate('/documents')} 
                  className="py-3 px-6 bg-primary text-white border-none rounded-lg text-[0.9375rem] font-semibold cursor-pointer font-sans transition-colors duration-200 shadow-ambient-glow hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Upload Your First Document
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
