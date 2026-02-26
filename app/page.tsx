'use client';

import React from 'react';
import { 
  Wrench, 
  Clock, 
  UserCheck, 
  DollarSign,
  MoreVertical,
  Map as MapIcon,
  Package
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { motion } from 'motion/react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const serviceDistribution = [
  { name: 'Instalação', value: 65, color: '#135bec' },
  { name: 'Manutenção', value: 25, color: '#93c5fd' },
  { name: 'Emergência', value: 10, color: '#f1f5f9' },
];

const upcomingServices = [
  {
    client: "Hotel Beira Rio",
    sub: "Suíte 405",
    type: "Instalação Completa",
    time: "09:00",
    tech: "João Silva",
    techImg: "https://picsum.photos/seed/john/40/40",
    status: "Agendado",
    statusColor: "blue"
  },
  {
    client: "Sarah Jenkins",
    sub: "Residencial",
    type: "Manutenção de AC",
    time: "10:30",
    tech: "Miguel Rocha",
    techImg: "https://picsum.photos/seed/mike/40/40",
    status: "A Caminho",
    statusColor: "yellow"
  },
  {
    client: "Centro Comercial Prime",
    sub: "Bloco C",
    type: "Reparo de Emergência",
    time: "11:15",
    tech: "Sara Tancredi",
    techImg: "https://picsum.photos/seed/sara/40/40",
    status: "Em Progresso",
    statusColor: "emerald"
  },
  {
    client: "Biblioteca Municipal",
    sub: "Saguão Principal",
    type: "Troca de Filtros",
    time: "13:45",
    tech: "Kim Wexler",
    techImg: "https://picsum.photos/seed/kim/40/40",
    status: "Agendado",
    statusColor: "blue"
  }
];

export default function Dashboard() {
  const [clientCount, setClientCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setClientCount(count);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    { 
      label: "Serviços Hoje", 
      value: "12", 
      change: "+2%", 
      icon: Wrench, 
      color: "blue" 
    },
    { 
      label: "Orçamentos Pendentes", 
      value: "28", 
      change: "+5%", 
      icon: Clock, 
      color: "orange" 
    },
    { 
      label: "Total de Clientes", 
      value: clientCount !== null ? clientCount.toString() : "...", 
      change: "+12%", 
      icon: UserCheck, 
      color: "purple" 
    },
    { 
      label: "Receita Mensal", 
      value: "R$ 42.500", 
      change: "+12%", 
      icon: DollarSign, 
      color: "emerald" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-lg p-2 ${
                metric.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                metric.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                metric.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                <metric.icon size={20} />
              </div>
              {metric.change && (
                <span className="rounded bg-green-50 px-2 py-1 text-xs font-bold text-green-500">
                  {metric.change}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <h3 className="mt-1 text-2xl font-bold">{metric.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Service Distribution Chart */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-bold">Distribuição de Serviços</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative h-48 w-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">120</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Serviços</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {serviceDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Services Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h3 className="font-bold">Próximos Serviços Hoje</h3>
            <button className="text-sm font-semibold text-[#135bec] hover:underline">Ver Agenda</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Tipo de Serviço</th>
                  <th className="px-6 py-3">Horário</th>
                  <th className="px-6 py-3">Técnico</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingServices.map((service, i) => (
                  <tr key={i} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{service.client}</span>
                        <span className="text-xs text-slate-500">{service.sub}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{service.type}</td>
                    <td className="px-6 py-4 text-sm font-medium">{service.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-slate-200">
                          <Image
                            src={service.techImg}
                            alt={service.tech}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-xs">{service.tech}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${
                        service.statusColor === 'blue' ? 'bg-blue-50 text-blue-600' :
                        service.statusColor === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 p-4 text-center">
            <button className="text-sm font-medium text-slate-500 transition-colors hover:text-[#135bec]">
              Carregar mais serviços
            </button>
          </div>
        </div>
      </div>

      {/* Footer Stats & Map Hook */}
      
    </div>
  );
}
