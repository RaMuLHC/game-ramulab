import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Swords, User, Dices } from 'lucide-react';
import { GameInformation, ActiveTab } from './types';
import { DEFAULT_GAME_INFO } from './data';
import NeonBackground from './components/NeonBackground';
import AboutTab from './components/AboutTab';
import VideoGamesTab from './components/VideoGamesTab';
import TtrpgTab from './components/TtrpgTab';

export default function App() {
  const [info, setInfo] = useState<GameInformation>(DEFAULT_GAME_INFO);
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');

  // Load from localStorage on initialization
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ramulab_game_info');
      if (saved) {
        const parsed = JSON.parse(saved) as GameInformation;
        // Migration: If the user has a cached old placeholder ID, migrate them to your active server ID automatically!
        if (parsed.discordServerWidgetId === "1153548981358903337") {
          parsed.discordServerWidgetId = "1198793646577811546";
          localStorage.setItem('ramulab_game_info', JSON.stringify(parsed));
        }
        if (!parsed.discordServerUrl || parsed.discordServerUrl === "https://discord.gg/ramulab-gaming") {
          parsed.discordServerUrl = "https://discord.gg/9Y2hBKEhac";
          localStorage.setItem('ramulab_game_info', JSON.stringify(parsed));
        }
        if (parsed.steamUrl === "https://steamcommunity.com/id/ramulab") {
          parsed.steamUrl = "https://steamcommunity.com/id/ramu0";
          localStorage.setItem('ramulab_game_info', JSON.stringify(parsed));
        }
        setInfo(parsed);
      }
    } catch (e) {
      console.error("Failed to load local storage configurations:", e);
    }
  }, []);

  // Deep-linking tab redirection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const logParam = params.get('log');
    const recruitmentParam = params.get('recruitment');

    if (logParam || recruitmentParam) {
      setActiveTab('ttrpg');
    } else if (tabParam === 'ttrpg' || tabParam === 'videogames' || tabParam === 'about') {
      setActiveTab(tabParam as ActiveTab);
    }
  }, []);

  // Save updates
  const handleSaveInfo = (newInfo: GameInformation) => {
    setInfo(newInfo);
    try {
      localStorage.setItem('ramulab_game_info', JSON.stringify(newInfo));
    } catch (e) {
      console.error("Failed to save local storage configurations:", e);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab info={info} />;
      case 'videogames':
        return <VideoGamesTab info={info} />;
      case 'ttrpg':
        return <TtrpgTab info={info} />;
      default:
        return <AboutTab info={info} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col justify-between relative selection:bg-purple-500/30 selection:text-white">
      
      {/* Immersive animated background with neon doddles */}
      <NeonBackground />

      {/* Main core layout container */}
      <div className="z-10 relative flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Navigation Bar Header */}
        <header className="py-5 sm:py-6 mb-8 sm:mb-12 border-b border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Home Logo */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setActiveTab('about')}
              className="flex items-center gap-2 text-xl font-bold tracking-wider font-mono bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift group hover:scale-[1.02] transition-all cursor-pointer"
            >
              <div className="p-1.5 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-400 group-hover:bg-purple-950/80 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all">
                <Gamepad2 size={20} className="animate-pulse" />
              </div>
              <span className="font-semibold tracking-[0.1em]">GAME.RAMULAB</span>
            </button>
          </div>

          {/* Navigation Toggles (About, Video games, TTRPG) */}
          <nav className="flex items-center bg-slate-900/65 border border-purple-500/20 rounded-full p-1 self-center backdrop-blur-md">
            
            {/* About Tab button */}
            <button
              onClick={() => setActiveTab('about')}
              className={`relative px-4 sm:px-5 py-2 rounded-full font-sans text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'about' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === 'about' && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full -z-10 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                />
              )}
              <span className="flex items-center gap-1.5 justify-center">
                <User size={13} /> About me
              </span>
            </button>

            {/* Video Games Tab button */}
            <button
              onClick={() => setActiveTab('videogames')}
              className={`relative px-4 sm:px-5 py-2 rounded-full font-sans text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'videogames' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === 'videogames' && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full -z-10 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                />
              )}
              <span className="flex items-center gap-1.5 justify-center">
                <Swords size={13} /> Video games
              </span>
            </button>

            {/* TTRPG Tab button */}
            <button
              onClick={() => setActiveTab('ttrpg')}
              className={`relative px-4 sm:px-5 py-2 rounded-full font-sans text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'ttrpg' 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeTab === 'ttrpg' && (
                <motion.div 
                  layoutId="active-pill" 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full -z-10 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                />
              )}
              <span className="flex items-center gap-1.5 justify-center">
                <Dices size={13} /> TTRPG
              </span>
            </button>
          </nav>
        </header>

        {/* Tab content panel wrapper with animated transitions */}
        <main className="flex-1 py-1 md:py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Cyberpunk minimal footer */}
      <footer className="w-full z-10 py-5 text-center text-slate-500 text-xs font-mono border-t border-slate-900 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            © 2026 GAME.RAMULAB
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-650 tracking-wider">
            <span>⚔️ STRIKE UNTIL VICTORY</span>
            <span className="text-purple-400">● ALL SYSTEM ONLINE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
