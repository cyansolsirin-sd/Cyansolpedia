import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shuffle, Heart, Search } from 'lucide-react';
import PairedSorter from './components/PairedSorter';
import ShipNameGenerator from './components/ShipNameGenerator';

type ModuleType = 'home' | 'sorter' | 'ship-generator';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (activeModule) {
      case 'sorter':
        return (
          <div className="space-y-6 relative z-10">
            <h2 className="text-2xl font-black text-[var(--color-text)] pb-2">
              The Paired Sorter
            </h2>
            <PairedSorter />
          </div>
        );
      case 'ship-generator':
        return (
          <div className="space-y-6 relative z-10">
            <h2 className="text-2xl font-black text-[var(--color-text)] pb-2">
              Ship Name Generator
            </h2>
            <ShipNameGenerator />
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-6 relative z-10">
            <h2 className="text-2xl font-black text-[var(--color-text)] pb-2">
              Dashboard
            </h2>
            <div className="neu-box p-8">
              <p className="mb-4 text-[var(--color-text)] font-semibold">Welcome to your personal digital toolbox. Select a module from the sidebar to begin.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div 
                  onClick={() => setActiveModule('sorter')}
                  className="neu-box-sunken p-6 cursor-pointer hover:shadow-none transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] shadow-[6px_6px_12px_var(--color-shadow-dark),-6px_-6px_12px_var(--color-shadow-light)] flex items-center justify-center mb-4 group-hover:text-[var(--color-accent-pink)] transition-colors text-[var(--color-text)]">
                    <Shuffle size={28} />
                  </div>
                  <h3 className="font-black text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent-pink)] transition-colors">
                    The Paired Sorter
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2 font-semibold">Rank a list of items through pairwise comparisons.</p>
                </div>

                <div 
                  onClick={() => setActiveModule('ship-generator')}
                  className="neu-box-sunken p-6 cursor-pointer hover:shadow-none transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] shadow-[6px_6px_12px_var(--color-shadow-dark),-6px_-6px_12px_var(--color-shadow-light)] flex items-center justify-center mb-4 group-hover:text-[var(--color-accent-teal)] transition-colors text-[var(--color-text)]">
                    <Heart size={28} />
                  </div>
                  <h3 className="font-black text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent-teal)] transition-colors">
                    Ship Name Generator
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2 font-semibold">Generate and score ship names from two character names.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Memphis Background Accents */}
      <div className="memphis-dot bg-[var(--color-accent-pink)] w-32 h-32 top-10 left-10 blur-xl"></div>
      <div className="memphis-dot bg-[var(--color-accent-blue)] w-48 h-48 bottom-20 right-10 blur-2xl"></div>
      <div className="memphis-dot bg-[var(--color-accent-yellow)] w-24 h-24 top-1/3 right-1/4 blur-lg"></div>
      <div className="memphis-cross text-[var(--color-accent-purple)] top-24 right-1/3 scale-150"></div>
      <div className="memphis-cross text-[var(--color-accent-teal)] bottom-1/3 left-1/4 scale-125"></div>

      {/* Top Header */}
      <header className="p-4 md:px-8 flex flex-col md:flex-row justify-between items-center z-10 gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 
            className="text-3xl font-black cursor-pointer flex items-center gap-2 text-[var(--color-text)] drop-shadow-sm"
            onClick={() => setActiveModule('home')}
          >
            Cyansolpedia <Settings size={20} className="text-[var(--color-text-muted)]" />
          </h1>
        </div>
        
        {/* Search Bar - Placeholder for Module Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search modules..." 
            className="neu-input pl-12 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 p-4 md:p-6 z-10">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col gap-4 relative">
            
            <div 
              onClick={() => setActiveModule('home')}
              className={`sticky-note p-4 cursor-pointer font-bold text-lg flex items-center justify-between ${activeModule === 'home' ? 'active text-[var(--color-accent-pink)]' : 'text-[var(--color-text)]'}`}
            >
              Dashboard <Settings size={18} className={activeModule === 'home' ? 'text-[var(--color-accent-pink)]' : 'text-[var(--color-text-muted)]'} />
            </div>
            
            <div className="my-2 w-full ml-2 border-b-2 border-dashed border-[var(--color-shadow-dark)] opacity-50" />

            <div 
              onClick={() => setActiveModule('sorter')}
              className={`sticky-note p-4 cursor-pointer font-bold text-lg ${activeModule === 'sorter' ? 'active text-[var(--color-accent-pink)]' : 'text-[var(--color-text)]'}`}
            >
              Module 1: Sorter
            </div>

            <div 
              onClick={() => setActiveModule('ship-generator')}
              className={`sticky-note p-4 cursor-pointer font-bold text-lg ${activeModule === 'ship-generator' ? 'active text-[var(--color-accent-teal)]' : 'text-[var(--color-text)]'}`}
            >
              Module 2: Ship Name Generator
            </div>

          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
