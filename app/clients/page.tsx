'use client';

import { 
  UserPlus, 
  Search, 
  Bell, 
  TrendingUp, 
  Users, 
  ClipboardCheck, 
  Zap,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  type: 'Commercial Account' | 'Residential';
  phone: string;
  email: string;
  address: string;
  sub: string;
  lastService?: string;
  serviceType?: string;
  status: 'Active' | 'Inactive' | 'Lead';
  img: string;
}

const initialClients: Client[] = [
  {
    id: '1',
    name: "Johnathan Smith",
    type: "Commercial Account",
    phone: "(555) 123-4567",
    email: "j.smith@corp.com",
    address: "123 Industrial Way",
    sub: "North Sector, 94043",
    lastService: "Oct 12, 2023",
    serviceType: "Maintenance Check",
    status: "Active",
    img: "https://picsum.photos/seed/johnathan/40/40"
  },
  {
    id: '2',
    name: "Sarah Jenkins",
    type: "Residential",
    phone: "(555) 987-6543",
    email: "sarah.j@email.com",
    address: "45 Oak Street",
    sub: "Pinecrest Estates",
    lastService: "Sep 28, 2023",
    serviceType: "AC Installation",
    status: "Lead",
    img: "https://picsum.photos/seed/sarahj/40/40"
  }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if supabase is configured before calling
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback to initial data if supabase fails or is not configured
      // Only set if we don't have clients yet
      setClients(prev => prev.length > 0 ? prev : initialClients);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as any,
      status: formData.get('status') as any,
      address: formData.get('address') as string,
      sub: formData.get('sub') as string,
    };

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (editingClient) {
          const { error } = await supabase
            .from('clients')
            .update(clientData)
            .eq('id', editingClient.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('clients')
            .insert([{
              ...clientData,
              img: `https://picsum.photos/seed/${Math.random()}/40/40`
            }]);
          if (error) throw error;
        }
        await fetchClients();
      } else {
        // Local-only mode
        if (editingClient) {
          setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
        } else {
          const newClient: Client = {
            id: Math.random().toString(36).substr(2, 9),
            ...clientData,
            img: `https://picsum.photos/seed/${Math.random()}/40/40`
          };
          setClients(prev => [newClient, ...prev]);
        }
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Check console for details.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);
          
          // If the ID is not a UUID (like '1', '2' from mock data), 
          // Supabase might return an error or just fail to delete.
          // We should also handle local deletion for mock data.
          if (error) {
            console.warn('Supabase delete failed, trying local delete:', error);
            setClients(prev => prev.filter(c => c.id !== id));
          } else {
            await fetchClients();
          }
        } else {
          // Local-only mode
          setClients(prev => prev.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        // Fallback to local delete if Supabase throws (e.g. missing keys)
        setClients(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Title and Primary Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h2>
          <p className="text-slate-500">Manage your customer database and service history</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#135bec] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#135bec]/90"
        >
          <UserPlus size={20} />
          New Client
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#135bec]/10 text-[#135bec]">
              <Users size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +12%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Clients</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{clients.length}</h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ClipboardCheck size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +5%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Active Maintenance</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">
            {clients.filter(c => c.status === 'Active').length}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Zap size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +18%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">New Leads (Month)</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">
            {clients.filter(c => c.status === 'Lead').length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 min-w-[200px]">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Status:</span>
          <select className="cursor-pointer border-none bg-transparent p-0 pr-8 text-sm font-medium focus:ring-0">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Lead</option>
          </select>
        </div>
        <div className="ml-auto">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#135bec]">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Client List Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Last Service</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={client.img}
                          alt={client.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm text-slate-600">{client.phone}</p>
                    <p className="text-xs text-slate-500">{client.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm text-slate-600">{client.address}</p>
                    <p className="text-xs text-slate-500">{client.sub}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm text-slate-600">{client.lastService}</p>
                    <p className="text-xs text-slate-500">{client.serviceType}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      client.status === 'Active' ? 'bg-green-100 text-green-800' :
                      client.status === 'Lead' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(client)}
                        className="p-2 text-slate-400 hover:text-[#135bec] hover:bg-[#135bec]/10 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm text-slate-500">Showing {filteredClients.length} of {clients.length} clients</p>
          <div className="flex gap-2">
            <button className="rounded border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="rounded border border-slate-300 p-1.5 text-slate-500 transition-colors hover:bg-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                    <input 
                      name="name"
                      required
                      defaultValue={editingClient?.name}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      defaultValue={editingClient?.email}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Phone Number</label>
                    <input 
                      name="phone"
                      required
                      defaultValue={editingClient?.phone}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Client Type</label>
                    <select 
                      name="type"
                      defaultValue={editingClient?.type || 'Residential'}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial Account">Commercial Account</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500">Address</label>
                  <input 
                    name="address"
                    required
                    defaultValue={editingClient?.address}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Neighborhood / Suite</label>
                    <input 
                      name="sub"
                      defaultValue={editingClient?.sub}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="e.g. Suite 101"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                    <select 
                      name="status"
                      defaultValue={editingClient?.status || 'Lead'}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 rounded-lg bg-[#135bec] py-2.5 font-semibold text-white hover:bg-[#135bec]/90"
                  >
                    {editingClient ? 'Save Changes' : 'Create Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
