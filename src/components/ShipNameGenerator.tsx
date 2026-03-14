import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ShipResult {
  name: string;
  score: number;
  tags: string[];
}

export default function ShipNameGenerator() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [results, setResults] = useState<ShipResult[]>([]);

  const generateShipNames = () => {
    if (!name1.trim() || !name2.trim()) {
      alert('Please enter two names');
      return;
    }

    const n1 = name1.trim().toLowerCase();
    const n2 = name2.trim().toLowerCase();
    const resultMap = new Map<string, { score: number, tags: Set<string> }>();

    const isVowel = (c: string) => 'aeiouy'.includes(c);

    const scoreName = (word: string, p1: string, s2: string, isOverlap: boolean) => {
      let score = 100;
      const tags = new Set<string>();

      // 1. Mandatory Overlap Bonus
      if (isOverlap) {
        score += 80; // Increased weight for overlap
        tags.add('Perfect Overlap');
      }

      // 2. Balanced Contribution Rule (Crucial!)
      // p1 is from Name 1, s2 is from Name 2. 
      // If overlap, the overlap char is shared.
      const len1 = p1.length + (isOverlap ? 0.5 : 0);
      const len2 = s2.length + (isOverlap ? 0.5 : 0);
      const diff = Math.abs(len1 - len2);

      if (diff <= 1) {
        score += 100; // Massive bonus for balanced names like Richel (3:3 or 4:3)
        tags.add('Perfectly Balanced');
      } else if (diff <= 2) {
        score += 40;
        tags.add('Fairly Balanced');
      } else if (diff >= 4) {
        score -= 60; // Heavy penalty for "swallowing" (e.g. Helenar 6:1)
        tags.add('Unbalanced');
      }

      // 3. Length Optimization (Prefer 4-7 chars for "single vocabulary" feel)
      if (word.length >= 4 && word.length <= 7) {
        score += 30;
        tags.add('Ideal Length');
      } else if (word.length > 8) {
        score -= 50; 
        tags.add('Too Long');
      }

      // 4. Avoid too many consonants together
      let maxConsonants = 0;
      let currentCons = 0;
      for (const char of word) {
        if (!isVowel(char)) {
          currentCons++;
          maxConsonants = Math.max(maxConsonants, currentCons);
        } else {
          currentCons = 0;
        }
      }
      if (maxConsonants >= 3) {
        score -= 40;
        tags.add('Clunky');
      }

      // 5. Avoid duplicate letters
      let hasDuplicates = false;
      for (let i = 0; i < word.length - 1; i++) {
        if (word[i] === word[i+1]) hasDuplicates = true;
      }
      if (hasDuplicates) {
        score -= 30;
        tags.add('Double Letters');
      }

      return { score, tags };
    };

    const addResult = (word: string, p1: string, s2: string, isOverlap: boolean) => {
      if (word === n1 || word === n2 || word.length < 3) return;
      
      const { score, tags } = scoreName(word, p1, s2, isOverlap);
      const existing = resultMap.get(word);
      
      if (!existing || score > existing.score) {
        resultMap.set(word, { score, tags });
      }
    };

    // Improved Generation Strategy
    // Iterate through all possible prefixes of Name 1
    for (let i = 1; i <= n1.length; i++) {
      const prefix1 = n1.substring(0, i);
      
      // Iterate through all possible segments of Name 2
      for (let start2 = 0; start2 < n2.length; start2++) {
        for (let end2 = start2 + 1; end2 <= n2.length; end2++) {
          const segment2 = n2.substring(start2, end2);
          
          // Check for overlap at the junction
          if (prefix1[prefix1.length - 1] === segment2[0]) {
            // Overlap match! (e.g., RicH + Helena -> RicH + el -> Richel)
            const combined = prefix1 + segment2.substring(1);
            addResult(combined, prefix1, segment2, true);
          } else {
            // No overlap, just glue
            const combined = prefix1 + segment2;
            addResult(combined, prefix1, segment2, false);
          }
        }
      }
    }

    // Also try the other way around (Name 2 prefix + Name 1 segment)
    for (let i = 1; i <= n2.length; i++) {
      const prefix2 = n2.substring(0, i);
      for (let start1 = 0; start1 < n1.length; start1++) {
        for (let end1 = start1 + 1; end1 <= n1.length; end1++) {
          const segment1 = n1.substring(start1, end1);
          
          if (prefix2[prefix2.length - 1] === segment1[0]) {
            const combined = prefix2 + segment1.substring(1);
            addResult(combined, prefix2, segment1, true);
          } else {
            const combined = prefix2 + segment1;
            addResult(combined, prefix2, segment1, false);
          }
        }
      }
    }

    // Format and sort
    const finalResults = Array.from(resultMap.entries())
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score: data.score,
        tags: Array.from(data.tags)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Top 15

    setResults(finalResults);
  };

  const getTagColor = (tag: string) => {
    if (tag === 'Perfectly Balanced' || tag === 'Perfect Overlap') return 'bg-[var(--color-accent-pink)] text-white';
    if (tag === 'Fairly Balanced' || tag === 'Ideal Length') return 'bg-[var(--color-accent-teal)] text-[var(--color-text)]';
    if (tag === 'Name-like') return 'bg-[var(--color-accent-blue)] text-[var(--color-text)]';
    if (tag === 'Unbalanced' || tag === 'Too Long' || tag === 'Clunky') return 'bg-[var(--color-accent-yellow)] text-[var(--color-text)]';
    return 'bg-[var(--color-shadow-dark)] text-white';
  };

  return (
    <div className="space-y-8">
      <div className="neu-box p-8">
        <h3 className="text-2xl font-black text-[var(--color-accent-teal)] mb-6 border-b-2 border-dashed border-[var(--color-shadow-dark)] pb-4">
          Enter Character Names
        </h3>
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-black mb-2 text-[var(--color-text)]">Character A (Name 1)</label>
            <input 
              type="text" 
              className="neu-input w-full font-bold" 
              placeholder="e.g. Richard"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-black mb-2 text-[var(--color-text)]">Character B (Name 2)</label>
            <input 
              type="text" 
              className="neu-input w-full font-bold" 
              placeholder="e.g. Helena"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
            />
          </div>
          <button 
            onClick={generateShipNames}
            className="neu-button h-[48px] px-8 text-lg"
          >
            Generate Ship Names
          </button>
        </div>
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-box overflow-hidden"
          >
            <div className="bg-[var(--color-bg)] p-6 border-b-2 border-dashed border-[var(--color-shadow-dark)] flex justify-between items-center">
              <span className="font-black text-xl text-[var(--color-text)]">Generated Results (Top 15)</span>
              <span className="text-sm font-bold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_var(--color-shadow-dark),inset_-2px_-2px_4px_var(--color-shadow-light)]">Sorted by Algorithm Score</span>
            </div>
            <div className="p-6 space-y-4 bg-[var(--color-bg)]">
              {results.map((res, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 neu-box-sunken">
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--color-text-muted)] font-black w-8 text-lg">#{idx + 1}</span>
                    <span className="text-2xl font-black text-[var(--color-accent-pink)]">{res.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0">
                    {res.tags.map(tag => (
                      <span key={tag} className={`text-xs px-3 py-1.5 rounded-full font-black shadow-[2px_2px_4px_var(--color-shadow-dark),-2px_-2px_4px_var(--color-shadow-light)] ${getTagColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
