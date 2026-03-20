import { useState } from 'react';

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
    <div>
      <div className="sm:hidden mb-4">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-slate-300 rounded-lg py-2.5 text-sm"
          defaultValue={tabs[activeTab].name}
          onChange={(e) => setActiveTab(tabs.findIndex(tab => tab.name === e.target.value))}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                className={`${index === activeTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab(index)}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="bg-white rounded-xl">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
