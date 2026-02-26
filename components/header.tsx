'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';

export function Header() {
  const { user } = useAuth();
  const userName = user?.name || 'Alex Rivera';
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex flex-1 items-center gap-4">
        <h2 className="text-xl font-bold">Operational Dashboard</h2>
        <div className="relative ml-4 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices, clients..."
            className="w-full rounded-lg border-none bg-[#f6f6f8] py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#135bec]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
        </button>
        
        <div className="mx-2 h-8 w-[1px] bg-slate-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-xs text-slate-500">Ops Manager</p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200">
            <Image
              src={`https://picsum.photos/seed/${userName}/100/100`}
              alt={userName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
