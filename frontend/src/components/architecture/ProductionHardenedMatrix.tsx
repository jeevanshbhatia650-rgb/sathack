'use client';

import React, { useState, useMemo } from 'react';
import {
  ENGINEERING_CHECKLIST,
  ChecklistItem,
} from '../../config/engineeringChecklist';
import {
  ShieldCheck,
  Zap,
  Database,
  Terminal,
  Search,
  Check,
  Cpu,
} from 'lucide-react';

type TabKey = 'all' | 'security' | 'resilience' | 'database' | 'devops';

export const ProductionHardenedMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<ChecklistItem | null>(null);

  const filteredItems = useMemo(() => {
    return ENGINEERING_CHECKLIST.filter((item) => {
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.specification.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const tabs: { key: TabKey; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'all',
      label: 'All Guarantees',
      count: ENGINEERING_CHECKLIST.length,
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      key: 'security',
      label: 'Security & Access Control',
      count: ENGINEERING_CHECKLIST.filter((i) => i.category === 'security').length,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      key: 'resilience',
      label: 'Traffic & Resilience',
      count: ENGINEERING_CHECKLIST.filter((i) => i.category === 'resilience').length,
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      key: 'database',
      label: 'Database & Scale',
      count: ENGINEERING_CHECKLIST.filter((i) => i.category === 'database').length,
      icon: <Database className="w-3.5 h-3.5" />,
    },
    {
      key: 'devops',
      label: 'DevOps, CI/CD & QA',
      count: ENGINEERING_CHECKLIST.filter((i) => i.category === 'devops').length,
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <section id="architecture" className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#B4B0F5]" />
          <span>04 / BATTLE-TESTED STANDARDS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--ink-primary)]">
          Never Vibe-Coded.
        </h2>
        <p className="mt-4 text-base text-[var(--ink-secondary)] leading-relaxed">
          The industry is flooded with brittle demo toys. WebWink projects strictly enforce all 58 production engineering safeguards from Day 1.
        </p>
      </div>

      {/* Control Bar: Tabs + Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border-ink)]/20 bg-[var(--bg-surface)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] shadow-sm'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 58 guarantees (e.g. RBAC, Rate Limiting, Docker)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--border-ink)]/20 bg-[var(--bg-surface)] text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)]/60 focus:outline-none focus:border-[#B4B0F5]"
          />
        </div>
      </div>

      {/* 58-Item Technical Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          return (
            <div
              key={item.id}
              onClick={() => setExpandedItem(item)}
              className="cursor-pointer group rounded-2xl border-[1.5px] border-[var(--border-ink)] bg-[var(--bg-surface)] p-5 transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--ink-secondary)]">
                    #{(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--ink-secondary)]">
                    <Check className="w-3 h-3 text-emerald-500" />
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[var(--ink-primary)] group-hover:text-[#8883d6] transition-colors">
                  {item.name}
                </h3>

                <p className="mt-2 text-xs text-[var(--ink-secondary)] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-ink)]/10">
                <span className="text-[10px] font-mono text-[var(--ink-secondary)] line-clamp-1">
                  Spec: {item.specification}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-sm text-[var(--ink-secondary)]">
          No architectural guarantees matched your filter query.
        </div>
      )}

      {/* Detail Drawer Modal for Selected Item */}
      {expandedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-[var(--border-ink)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl text-[var(--ink-primary)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded bg-[#B4B0F5] text-[#111111]">
                {expandedItem.category} Guarantee
              </span>
              <button
                onClick={() => setExpandedItem(null)}
                className="text-xs font-bold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                Close (ESC)
              </button>
            </div>

            <h3 className="mt-4 text-xl font-black text-[var(--ink-primary)]">
              {expandedItem.name}
            </h3>

            <div className="mt-4 space-y-4 text-xs leading-relaxed">
              <div>
                <span className="font-mono font-bold text-[var(--ink-secondary)] uppercase block mb-1">
                  Architectural Principle
                </span>
                <p className="text-[var(--ink-primary)] bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-ink)]/15">
                  {expandedItem.description}
                </p>
              </div>

              <div>
                <span className="font-mono font-bold text-[var(--ink-secondary)] uppercase block mb-1">
                  WebWink Concrete Specification
                </span>
                <p className="text-[var(--ink-primary)] bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-ink)]/15 font-mono text-[11px]">
                  {expandedItem.specification}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setExpandedItem(null)}
                className="px-5 py-2 rounded-full bg-[#111111] text-[#FAF9F5] dark:bg-[#FAF9F5] dark:text-[#111111] text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
