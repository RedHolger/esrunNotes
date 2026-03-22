import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Tab {
  name: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <div className="relative">
          <select
            id="tabs"
            name="tabs"
            className="block w-full appearance-none bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/30 rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            defaultValue={tabs[activeTab].name}
            onChange={(e) => setActiveTab(tabs.findIndex(tab => tab.name === e.target.value))}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="absolute inset-0 flex items-end">
            <div className="w-full h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          </div>
          <nav className="relative flex space-x-8" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                className={`group relative whitespace-nowrap py-4 px-1 text-sm font-semibold transition-all duration-300 ${
                  index === activeTab
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab.name}

                {/* Active indicator with gradient */}
                {index === activeTab && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-full shadow-lg shadow-primary-500/50" />
                )}

                {/* Hover indicator */}
                {index !== activeTab && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-300 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm">
        <div className="animate-fade-in">
          {tabs[activeTab].content}
        </div>
      </div>
    </div>
  );
}
