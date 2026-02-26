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
  X,
  Plus,
  Minus,
  MapPin
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '@/lib/supabase';

interface Address {
  id?: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_primary: boolean;
}

interface Client {
  id: string;
  name: string;
  cpf?: string;
  type: 'Conta Comercial' | 'Residencial';
  phone: string;
  email: string;
  addresses: Address[];
  lastService?: string;
  serviceType?: string;
  status: 'Ativo' | 'Inativo' | 'Lead';
  img: string;
}

const initialClients: Client[] = [
  {
    id: '1',
    name: "João da Silva",
    cpf: "123.456.789-00",
    type: "Conta Comercial",
    phone: "(11) 98765-4321",
    email: "joao.silva@empresa.com.br",
    addresses: [
      {
        street: "Av. Paulista",
        number: "1000",
        complement: "Sala 101",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zip_code: "01310-100",
        is_primary: true
      }
    ],
    lastService: "12 Out, 2023",
    serviceType: "Revisão de Manutenção",
    status: "Ativo",
    img: "https://picsum.photos/seed/johnathan/40/40"
  },
  {
    id: '2',
    name: "Maria Oliveira",
    type: "Residencial",
    phone: "(21) 91234-5678",
    email: "maria.o@email.com.br",
    addresses: [
      {
        street: "Rua das Flores",
        number: "45",
        complement: "",
        neighborhood: "Jardim Botânico",
        city: "Rio de Janeiro",
        state: "RJ",
        zip_code: "22460-000",
        is_primary: true
      }
    ],
    lastService: "28 Set, 2023",
    serviceType: "Instalação de AC",
    status: "Lead",
    img: "https://picsum.photos/seed/sarahj/40/40"
  }
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalAddresses, setModalAddresses] = useState<Address[]>([]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*, addresses(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
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
      cpf: formData.get('cpf') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      type: formData.get('type') as any,
      status: formData.get('status') as any,
    };

    // Extract addresses from form
    const addresses: Address[] = [];
    const streetInputs = formData.getAll('street') as string[];
    const numberInputs = formData.getAll('number') as string[];
    const complementInputs = formData.getAll('complement') as string[];
    const neighborhoodInputs = formData.getAll('neighborhood') as string[];
    const cityInputs = formData.getAll('city') as string[];
    const stateInputs = formData.getAll('state') as string[];
    const zipInputs = formData.getAll('zip_code') as string[];
    const primaryIndex = parseInt(formData.get('primary_address_index') as string || '0');

    streetInputs.forEach((street, index) => {
      if (street) {
        addresses.push({
          street,
          number: numberInputs[index],
          complement: complementInputs[index],
          neighborhood: neighborhoodInputs[index],
          city: cityInputs[index],
          state: stateInputs[index],
          zip_code: zipInputs[index],
          is_primary: index === primaryIndex
        });
      }
    });

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        let clientId = editingClient?.id;

        if (editingClient) {
          const { error } = await supabase
            .from('clients')
            .update(clientData)
            .eq('id', editingClient.id);
          if (error) throw error;

          // Delete old addresses and insert new ones (simple approach)
          await supabase.from('addresses').delete().eq('client_id', clientId);
        } else {
          const { data, error } = await supabase
            .from('clients')
            .insert([{
              ...clientData,
              img: `https://picsum.photos/seed/${Math.random()}/40/40`
            }])
            .select();
          if (error) throw error;
          clientId = data[0].id;
        }

        if (clientId && addresses.length > 0) {
          const { error: addrError } = await supabase
            .from('addresses')
            .insert(addresses.map(addr => ({ ...addr, client_id: clientId })));
          if (addrError) throw addrError;
        }

        await fetchClients();
      } else {
        // Local-only mode
        const newClientData = { ...clientData, addresses };
        if (editingClient) {
          setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...newClientData } : c));
        } else {
          const newClient: Client = {
            id: Math.random().toString(36).substr(2, 9),
            ...newClientData,
            img: `https://picsum.photos/seed/${Math.random()}/40/40`
          };
          setClients(prev => [newClient, ...prev]);
        }
      }
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Falha ao salvar cliente. Verifique o console para detalhes.');
    }
  };

  const handleDeleteClient = (id: string) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    const id = clientToDelete;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.warn('Supabase delete failed, trying local delete:', error);
          setClients(prev => prev.filter(c => c.id !== id));
        } else {
          await fetchClients();
        }
      } else {
        setClients(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setClients(prev => prev.filter(c => c.id !== id));
    } finally {
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setModalAddresses(client.addresses || []);
    setIsModalOpen(true);
  };

  const addAddressField = () => {
    setModalAddresses([...modalAddresses, {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      is_primary: modalAddresses.length === 0
    }]);
  };

  const removeAddressField = (index: number) => {
    const newAddresses = modalAddresses.filter((_, i) => i !== index);
    // Ensure at least one is primary if list is not empty
    if (newAddresses.length > 0 && !newAddresses.some(a => a.is_primary)) {
      newAddresses[0].is_primary = true;
    }
    setModalAddresses(newAddresses);
  };

  const setPrimaryAddress = (index: number) => {
    setModalAddresses(modalAddresses.map((addr, i) => ({
      ...addr,
      is_primary: i === index
    })));
  };

  return (
    <div className="space-y-8">
      {/* Page Title and Primary Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h2>
          <p className="text-slate-500">Gerencie sua base de clientes e histórico de serviços</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-[#135bec] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#135bec]/90"
        >
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#135bec]/10 text-[#135bec] md:h-12 md:w-12">
              <Users size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +12%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total de Clientes</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">{clients.length}</h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 md:h-12 md:w-12">
              <ClipboardCheck size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +5%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Manutenções Ativas</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">
            {clients.filter(c => c.status === 'Ativo').length}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 md:h-12 md:w-12">
              <Zap size={24} />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-500">
              <TrendingUp size={16} />
              +18%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Novos Leads (Mês)</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">
            {clients.filter(c => c.status === 'Lead').length}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar clientes..." 
            className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5">
            <span className="text-xs font-semibold uppercase text-slate-500">Status:</span>
            <select className="cursor-pointer border-none bg-transparent p-0 pr-8 text-sm font-medium focus:ring-0">
              <option>Todos</option>
              <option>Ativo</option>
              <option>Inativo</option>
              <option>Lead</option>
            </select>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#135bec]">
            <Filter size={18} />
            <span className="hidden sm:inline">Mais Filtros</span>
          </button>
        </div>
      </div>

      {/* Client List Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Cliente</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contato</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Endereço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Último Serviço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
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
                    {client.addresses?.find(a => a.is_primary) ? (
                      <>
                        <p className="text-sm text-slate-600">
                          {client.addresses.find(a => a.is_primary)?.street}, {client.addresses.find(a => a.is_primary)?.number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {client.addresses.find(a => a.is_primary)?.neighborhood}, {client.addresses.find(a => a.is_primary)?.city}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Nenhum endereço</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm text-slate-600">{client.lastService}</p>
                    <p className="text-xs text-slate-500">{client.serviceType}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      client.status === 'Ativo' ? 'bg-green-100 text-green-800' :
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
          <p className="text-sm text-slate-500">Exibindo {filteredClients.length} de {clients.length} clientes</p>
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
                  {editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Nome Completo</label>
                    <input 
                      name="name"
                      required
                      defaultValue={editingClient?.name}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">CPF (Opcional)</label>
                    <input 
                      name="cpf"
                      defaultValue={editingClient?.cpf}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">E-mail</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      defaultValue={editingClient?.email}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="joao@exemplo.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Telefone</label>
                    <input 
                      name="phone"
                      required
                      defaultValue={editingClient?.phone}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Tipo de Cliente</label>
                    <select 
                      name="type"
                      defaultValue={editingClient?.type || 'Residencial'}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                    >
                      <option value="Residencial">Residencial</option>
                      <option value="Conta Comercial">Conta Comercial</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                    <select 
                      name="status"
                      defaultValue={editingClient?.status || 'Lead'}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-[#135bec]/20"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <MapPin size={16} className="text-[#135bec]" />
                      Endereços
                    </h4>
                    <button 
                      type="button"
                      onClick={addAddressField}
                      className="text-xs font-bold text-[#135bec] hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Adicionar Endereço
                    </button>
                  </div>

                  {modalAddresses.map((addr, index) => (
                    <div key={index} className="relative space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="primary_address_index" 
                            value={index}
                            checked={addr.is_primary}
                            onChange={() => setPrimaryAddress(index)}
                            className="h-4 w-4 text-[#135bec] focus:ring-[#135bec]"
                          />
                          <span className="text-xs font-bold text-slate-600">Endereço Principal</span>
                        </label>
                        {modalAddresses.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeAddressField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Minus size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Rua</label>
                          <input 
                            name="street"
                            required
                            defaultValue={addr.street}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="Rua..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Número</label>
                          <input 
                            name="number"
                            defaultValue={addr.number}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Complemento</label>
                          <input 
                            name="complement"
                            defaultValue={addr.complement}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="Apto, Sala..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Bairro</label>
                          <input 
                            name="neighborhood"
                            defaultValue={addr.neighborhood}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="Bairro"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Cidade</label>
                          <input 
                            name="city"
                            defaultValue={addr.city}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="Cidade"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Estado</label>
                          <input 
                            name="state"
                            defaultValue={addr.state}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">CEP</label>
                          <input 
                            name="zip_code"
                            defaultValue={addr.zip_code}
                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 rounded-lg bg-[#135bec] py-2.5 font-semibold text-white hover:bg-[#135bec]/90"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={28} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Confirmar Exclusão</h3>
              <p className="mb-8 text-slate-500">
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados associados serão removidos.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700"
                >
                  Excluir Cliente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
