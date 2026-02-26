'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  HardHat, 
  Wrench, 
  ChevronDown, 
  MapPin, 
  GripVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const unassignedTasks = [
  {
    id: 1,
    title: "Central Air Installation",
    type: "Installation",
    address: "1224 Oak Avenue, Springfield",
    duration: "4-5 Hours",
    img: "https://picsum.photos/seed/task1/40/40"
  },
  {
    id: 2,
    title: "Seasonal Furnace Check",
    type: "Maintenance",
    address: "45 High St, Shelbyville",
    duration: "1.5 Hours",
    img: "https://picsum.photos/seed/task2/40/40"
  },
  {
    id: 3,
    title: "Ductless Mini-Split",
    type: "Installation",
    address: "89 Pine Dr, Capital City",
    duration: "3 Hours",
    img: "https://picsum.photos/seed/task3/40/40"
  },
  {
    id: 4,
    title: "Commercial Boiler Service",
    type: "Maintenance",
    address: "Main Plaza Mall, Office B",
    duration: "2 Hours",
    img: "https://picsum.photos/seed/task4/40/40",
    opacity: true
  }
];

const calendarDays = [
  { day: 28, prev: true }, { day: 29, prev: true }, { day: 30, prev: true },
  { day: 1 },
  { day: 2, tasks: [{ label: 'Installation - #2045', type: 'install' }, { label: 'Annual Check - #1982', type: 'maint' }] },
  { day: 3, tasks: [{ label: 'AC Repair - #2049', type: 'install' }] },
  { day: 4 },
  { day: 5, today: true, tasks: [{ label: 'Maintenance - #2101', type: 'maint' }, { label: 'Installation - #2103', type: 'install' }] },
  { day: 6 }, { day: 7 }, { day: 8 },
  { day: 9, tasks: [{ label: 'Filter Replace - #2112', type: 'maint' }] },
  { day: 10 },
  { day: 11, tasks: [{ label: 'Unit Install - #2120', type: 'install' }] },
  { day: 12 }, { day: 13 }, { day: 14 }
];

export default function SchedulePage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Calendar Section */}
        <div className="flex flex-1 flex-col overflow-y-auto pb-8">
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Service Schedule</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">October 2023 Overview</p>
              </div>
              <div className="flex items-center self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-bold">Month</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold text-slate-500">Week</button>
                <button className="rounded-lg px-4 py-1.5 text-xs font-bold text-slate-500">Day</button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
                <HardHat size={18} className="text-slate-400" />
                <span className="font-medium">All Technicians</span>
                <ChevronDown size={18} className="text-slate-400" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
                <Wrench size={18} className="text-slate-400" />
                <span className="font-medium">Service Type</span>
                <ChevronDown size={18} className="text-slate-400" />
              </div>
              <div className="hidden h-6 w-[1px] bg-slate-200 md:block"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#135bec]"></span>
                  <span className="text-xs font-semibold text-slate-600">Installation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                  <span className="text-xs font-semibold text-slate-600">Maintenance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid min-w-[800px] grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="flex h-10 items-center justify-center border-b border-r border-slate-200 last:border-r-0 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  {day}
                </div>
              ))}
              {calendarDays.map((d, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-32 border-b border-r border-slate-200 p-2 transition-colors last:border-r-0",
                    d.prev && "bg-slate-50 opacity-50",
                    d.today && "bg-[#135bec]/5 ring-2 ring-inset ring-[#135bec]"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold",
                    d.today ? "text-[#135bec]" : "text-slate-400"
                  )}>
                    {d.day} {d.today && 'Today'}
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    {d.tasks?.map((t, ti) => (
                      <div 
                        key={ti} 
                        className={cn(
                          "truncate rounded border-l-4 px-2 py-1 text-[10px] font-bold",
                          t.type === 'install' 
                            ? "border-[#135bec] bg-[#135bec]/10 text-[#135bec]" 
                            : "border-orange-500 bg-orange-500/10 text-orange-600"
                        )}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unassigned Tasks Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:w-80 lg:border-l lg:border-t-0">
          <div className="border-b border-slate-200 p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">Unassigned Tasks</h3>
              <span className="rounded-full bg-[#135bec]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#135bec]">
                8 New
              </span>
            </div>
            <p className="text-xs text-slate-500">Drag and drop tasks to assign technicians.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 lg:max-h-none">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {unassignedTasks.map((task) => (
                <div 
                  key={task.id}
                  className={cn(
                    "group cursor-move rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md",
                    task.opacity && "opacity-75"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      task.type === 'Installation' ? "bg-[#135bec]/10 text-[#135bec]" : "bg-orange-500/10 text-orange-600"
                    )}>
                      {task.type}
                    </span>
                    <GripVertical size={18} className="text-slate-400 transition-colors group-hover:text-slate-600" />
                  </div>
                  <h4 className="mb-1 text-sm font-bold">{task.title}</h4>
                  <p className="mb-3 flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin size={14} />
                    {task.address}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full bg-slate-200">
                        <Image
                          src={task.img}
                          alt="Default tech"
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-medium italic text-slate-400">No Tech Assigned</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{task.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <button className="w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-bold text-slate-600 transition-colors hover:border-[#135bec] hover:text-[#135bec]">
              View Archive
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
