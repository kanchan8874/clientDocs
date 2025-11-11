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
            <h1 className="text-3xl font-semibold text-gray-800 m-0 mb-2 tracking-tight leading-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-base text-gray-600 font-normal leading-relaxed m-0">
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
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer text-left w-full outline-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 border-none font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/clients');
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] bg-primary-light flex items-center justify-center flex-shrink-0">
                <Users size={24} color="#1A73E8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-gray-800">{stats.loading ? '...' : stats.totalClients}</div>
                <div className="text-sm font-medium text-gray-600 tracking-wide">Total Clients</div>
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
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer text-left w-full outline-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 border-none font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/documents');
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] bg-green-50 flex items-center justify-center flex-shrink-0">
                <FileText size={24} color="#34A853" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-gray-800">{stats.loading ? '...' : stats.totalDocuments}</div>
                <div className="text-sm font-medium text-gray-600 tracking-wide">Total Documents</div>
              </div>
              <div className="flex items-center ml-auto flex-shrink-0">
                <TrendingUp size={18} color="#34A853" />
              </div>
            </div>
          </button>

          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            role="status"
            aria-label={`Shared documents: ${stats.loading ? 'loading' : documents.filter(isSharedWithMe).length}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <Share2 size={24} color="#F4B400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-3xl font-bold mb-1 leading-none tracking-tight text-gray-800">
                  {stats.loading ? '...' : documents.filter(isSharedWithMe).length}
                </div>
                <div className="text-sm font-medium text-gray-600 tracking-wide">Shared With Me</div>
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
          <h2 className="text-[1.375rem] font-semibold text-gray-800 m-0 tracking-tight leading-tight mb-0">Quick Actions</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 mt-6">
            <button 
              onClick={() => navigate('/clients')} 
              className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all duration-200 shadow-sm text-left font-sans outline-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0"><Plus size={24} color="#1A73E8" /></div>
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-800 mb-1">Add Client</div>
                <div className="text-sm text-gray-600">Create a new client profile</div>
              </div>
            </button>

            <button 
              onClick={() => navigate('/documents')} 
              className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all duration-200 shadow-sm text-left font-sans outline-none hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0"><Upload size={24} color="#34A853" /></div>
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-800 mb-1">Upload Document</div>
                <div className="text-sm text-gray-600">Add a new document</div>
              </div>
          </button>
        </div>
        </section>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
          {/* Recent Clients */}
          <section className="mb-12" aria-label="Recent clients" role="region">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[1.375rem] font-semibold text-gray-800 m-0 tracking-tight leading-tight">Recent Clients</h2>
              <button 
                onClick={() => navigate('/clients')} 
                className="bg-transparent border-none text-gray-600 text-sm font-medium cursor-pointer flex items-center font-sans transition-colors duration-200 hover:text-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                View All <ArrowRight size={16} className="ml-1 inline-block align-middle" />
              </button>
            </div>
            {recentClients.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentClients.map((client, index) => (
                  <div 
                    key={client._id} 
                    className="flex items-center gap-4 p-5 rounded-[10px] border border-gray-200 bg-white transition-all duration-200 cursor-pointer shadow-xs hover:bg-white hover:translate-x-1 hover:shadow-md"
                  >
                    <div className="w-11 h-11 rounded-md bg-primary-light/80 flex items-center justify-center flex-shrink-0">
                      <Users size={18} color="#1A73E8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-[0.9375rem] font-semibold text-gray-800 mb-1 leading-tight"
                        title={client.name}
                        aria-label={`Client: ${client.name}`}
                      >
                        {client.name.length > 20 ? `${client.name.substring(0, 20)}...` : client.name}
                      </div>
                      <div className="text-sm text-gray-600 leading-normal">
                        {client.email || 'No email'} • {client.company || 'No company'}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/clients')}
                      className="py-2.5 px-5 bg-primary text-white border-none rounded-md text-sm font-medium cursor-pointer font-sans transition-all duration-200 shadow-md hover:bg-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <Users size={48} color="#d1d5db" />
                <p className="text-[0.9375rem] text-gray-600 mt-4 mb-6">No clients yet</p>
                <button 
                  onClick={() => navigate('/clients')} 
                  className="py-3 px-6 bg-primary text-white border-none rounded-md text-[0.9375rem] font-medium cursor-pointer font-sans transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  Create Your First Client
          </button>
              </div>
            )}
          </section>

          {/* Recent Documents */}
          <section className="mb-12" aria-label="Recent documents" role="region">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[1.375rem] font-semibold text-gray-800 m-0 tracking-tight leading-tight">Recent Documents</h2>
              <button 
                onClick={() => navigate('/documents')} 
                className="bg-transparent border-none text-gray-600 text-sm font-medium cursor-pointer flex items-center font-sans transition-colors duration-200 hover:text-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              >
                View All <ArrowRight size={16} className="ml-1 inline-block align-middle" />
          </button>
        </div>
            {recentDocuments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentDocuments.map((doc, index) => (
                  <div 
                    key={doc._id} 
                    className="flex items-center gap-4 p-5 rounded-[10px] border border-gray-200 bg-white transition-all duration-200 cursor-pointer shadow-xs hover:bg-white hover:translate-x-1 hover:shadow-md"
                  >
                    <div className="w-11 h-11 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} color="#34A853" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.9375rem] font-semibold text-gray-800 mb-1 leading-tight">{doc.title}</div>
                      <div className="text-sm text-gray-600 leading-normal flex items-center gap-2">
                        <CategoryBadge category={doc.category} /> • {new Date(doc.uploadDate).toLocaleDateString()}
      </div>
    </div>
                    <button
                      onClick={() => navigate('/documents')}
                      className="py-2.5 px-5 bg-primary text-white border-none rounded-md text-sm font-medium cursor-pointer font-sans transition-all duration-200 shadow-md hover:bg-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <FileText size={48} color="#d1d5db" />
                <p className="text-[0.9375rem] text-gray-600 mt-4 mb-6">No documents yet</p>
                <button 
                  onClick={() => navigate('/documents')} 
                  className="py-3 px-6 bg-primary text-white border-none rounded-md text-[0.9375rem] font-medium cursor-pointer font-sans transition-colors duration-200 hover:bg-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
