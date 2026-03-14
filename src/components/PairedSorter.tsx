import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, RefreshCw, Trophy, Equal, Square, Circle, Triangle } from 'lucide-react';

// --- Types ---
interface Item {
  id: string;
  text: string;
  elo: number;
  matches: number;
}

type Phase = 'input' | 'sorting' | 'results';

// --- Constants ---
const INITIAL_ELO = 1200;
const K_FACTOR = 32;

export default function PairedSorter() {
  const [phase, setPhase] = useState<Phase>('input');
  const [inputText, setInputText] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [currentPair, setCurrentPair] = useState<[Item, Item] | null>(null);
  const [seenPairs, setSeenPairs] = useState<Set<string>>(new Set());
  const [comparisonCount, setComparisonCount] = useState(0);

  // --- Logic ---

  const handleStart = () => {
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      alert('Please enter at least two items to sort.');
      return;
    }

    const newItems: Item[] = lines.map((text, index) => ({
      id: `item-${index}-${Date.now()}`,
      text,
      elo: INITIAL_ELO,
      matches: 0,
    }));

    setItems(newItems);
    setPhase('sorting');
    setSeenPairs(new Set<string>());
    setComparisonCount(0);
    pickNextPair(newItems, new Set<string>());
  };

  const pickNextPair = (currentItems: Item[], currentSeen: Set<string>) => {
    if (currentItems.length < 2) return;

    // Sort by matches to ensure everyone gets compared
    const sortedByMatches = [...currentItems].sort((a, b) => a.matches - b.matches);
    
    // Pick the one with the least matches
    const itemA = sortedByMatches[0];

    // Find a suitable opponent (similar Elo, preferably not seen)
    let bestOpponent = sortedByMatches[1];
    let smallestEloDiff = Infinity;

    for (let i = 1; i < sortedByMatches.length; i++) {
      const candidate = sortedByMatches[i];
      const pairId1 = `${itemA.id}-${candidate.id}`;
      const pairId2 = `${candidate.id}-${itemA.id}`;
      
      if (!currentSeen.has(pairId1) && !currentSeen.has(pairId2)) {
        const eloDiff = Math.abs(itemA.elo - candidate.elo);
        if (eloDiff < smallestEloDiff) {
          smallestEloDiff = eloDiff;
          bestOpponent = candidate;
        }
      }
    }

    // If all pairs seen for itemA, just pick the next one with closest Elo
    if (smallestEloDiff === Infinity) {
       for (let i = 1; i < sortedByMatches.length; i++) {
         const candidate = sortedByMatches[i];
         const eloDiff = Math.abs(itemA.elo - candidate.elo);
         if (eloDiff < smallestEloDiff) {
           smallestEloDiff = eloDiff;
           bestOpponent = candidate;
         }
       }
    }

    // Randomize left/right position
    if (Math.random() > 0.5) {
      setCurrentPair([itemA, bestOpponent]);
    } else {
      setCurrentPair([bestOpponent, itemA]);
    }
  };

  const handleChoice = (winnerIndex: number | null) => {
    if (!currentPair) return;

    const [itemA, itemB] = currentPair;
    
    // Calculate expected scores
    const expectedA = 1 / (1 + Math.pow(10, (itemB.elo - itemA.elo) / 400));
    const expectedB = 1 / (1 + Math.pow(10, (itemA.elo - itemB.elo) / 400));

    // Determine actual scores
    let scoreA = 0.5;
    let scoreB = 0.5;
    if (winnerIndex === 0) {
      scoreA = 1;
      scoreB = 0;
    } else if (winnerIndex === 1) {
      scoreA = 0;
      scoreB = 1;
    }

    // Update Elos
    const newEloA = itemA.elo + K_FACTOR * (scoreA - expectedA);
    const newEloB = itemB.elo + K_FACTOR * (scoreB - expectedB);

    const updatedItems = items.map(item => {
      if (item.id === itemA.id) return { ...item, elo: newEloA, matches: item.matches + 1 };
      if (item.id === itemB.id) return { ...item, elo: newEloB, matches: item.matches + 1 };
      return item;
    });

    const newSeen = new Set<string>(seenPairs);
    newSeen.add(`${itemA.id}-${itemB.id}`);

    setItems(updatedItems);
    setSeenPairs(newSeen);
    setComparisonCount(prev => prev + 1);

    pickNextPair(updatedItems, newSeen);
  };

  const handleFinish = () => {
    setPhase('results');
  };

  const handleReset = () => {
    setPhase('input');
    setInputText('');
    setItems([]);
    setCurrentPair(null);
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.elo - a.elo);
  }, [items]);

  // --- Render Helpers ---

  const renderInputPhase = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="neu-box p-8 space-y-6"
    >
      <h3 className="text-2xl font-black text-[var(--color-accent-pink)] border-b-2 border-dashed border-[var(--color-shadow-dark)] pb-4">
        Input Your List
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] font-bold">Paste your options below, one per line. We will help you sort them.</p>
      <textarea
        className="neu-input w-full h-64 resize-y font-medium"
        placeholder="Isabella of France&#10;Margaret of Anjou&#10;Anne Boleyn&#10;Henrietta Maria of France"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div className="flex justify-end pt-2">
        <button
          onClick={handleStart}
          disabled={inputText.trim().length === 0}
          className="neu-button flex items-center gap-2 text-lg"
        >
          开始排序 <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );

  const renderSortingPhase = () => {
    if (!currentPair) return null;
    const [itemA, itemB] = currentPair;
    const canFinish = items.every(i => i.matches >= 1) && comparisonCount >= items.length;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="neu-box overflow-hidden"
      >
        <div className="bg-[var(--color-bg)] p-6 border-b-2 border-dashed border-[var(--color-shadow-dark)] flex justify-between items-center">
          <span className="font-black text-lg text-[var(--color-text)]">Which one do you prefer?</span>
          <span className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_var(--color-shadow-dark),inset_-2px_-2px_4px_var(--color-shadow-light)]">Comparison #{comparisonCount + 1}</span>
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8 w-full justify-center items-stretch bg-[var(--color-bg)]">
          <button
            onClick={() => handleChoice(0)}
            className="flex-1 min-h-[160px] p-6 neu-button flex items-center justify-center text-center group"
          >
            <span className="text-2xl font-black text-[var(--color-text)] group-hover:text-[var(--color-accent-pink)] transition-colors">
              {itemA.text}
            </span>
          </button>

          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full neu-box-sunken flex items-center justify-center">
              <span className="text-[var(--color-text-muted)] font-black italic">VS</span>
            </div>
          </div>

          <button
            onClick={() => handleChoice(1)}
            className="flex-1 min-h-[160px] p-6 neu-button flex items-center justify-center text-center group"
          >
            <span className="text-2xl font-black text-[var(--color-text)] group-hover:text-[var(--color-accent-teal)] transition-colors">
              {itemB.text}
            </span>
          </button>
        </div>

        <div className="p-6 bg-[var(--color-bg)] border-t-2 border-dashed border-[var(--color-shadow-dark)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => handleChoice(null)}
            className="neu-button flex items-center gap-2 text-sm"
          >
            <Equal size={16} /> They are equally good
          </button>

          <AnimatePresence>
            {canFinish && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleFinish}
                className="text-[var(--color-accent-pink)] hover:text-[var(--color-accent-teal)] transition-colors text-sm font-black flex items-center gap-1"
              >
                Finish & View Rankings <ArrowRight size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderResultsPhase = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neu-box overflow-hidden"
    >
      <div className="bg-[var(--color-bg)] p-6 border-b-2 border-dashed border-[var(--color-shadow-dark)] flex justify-between items-center">
        <span className="flex items-center gap-2 text-[var(--color-accent-pink)] font-black text-xl">
          <Trophy size={24} /> Final Rankings
        </span>
        <button
          onClick={handleReset}
          className="neu-button text-sm flex items-center gap-2"
          title="Restart"
        >
          <RefreshCw size={14} /> Restart
        </button>
      </div>

      <div className="p-6 bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-text-muted)] mb-6 font-bold">Based on {comparisonCount} comparisons.</p>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          {sortedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-4 neu-box-sunken"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-[4px_4px_8px_var(--color-shadow-dark),-4px_-4px_8px_var(--color-shadow-light)]
                ${index === 0 ? 'bg-[var(--color-accent-pink)] text-white' : 
                  index === 1 ? 'bg-[var(--color-accent-yellow)] text-[var(--color-text)]' : 
                  index === 2 ? 'bg-[var(--color-accent-teal)] text-[var(--color-text)]' : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'}
              `}>
                {index + 1}
              </div>
              <div className="flex-1 text-xl font-black text-[var(--color-text)]">
                {item.text}
              </div>
              <div className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_var(--color-shadow-dark),inset_-2px_-2px_4px_var(--color-shadow-light)]">
                Elo: {Math.round(item.elo)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {phase === 'input' && <motion.div key="input">{renderInputPhase()}</motion.div>}
        {phase === 'sorting' && <motion.div key="sorting">{renderSortingPhase()}</motion.div>}
        {phase === 'results' && <motion.div key="results">{renderResultsPhase()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
