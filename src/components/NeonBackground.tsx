import React from 'react';
import { motion } from 'motion/react';

export default function NeonBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-950 z-0">
      {/* Deep dark gradient with purple and blue backlighting */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />

      {/* Retro Sci-fi Grid */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_97%,rgba(147,51,234,0.03)_97%)] bg-[size:100%_4px]" />

      {/* Neon SVG Glow Filter Declarations */}
      <svg className="hidden">
        <defs>
          <filter id="neon-glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Floating Neon Doodles */}

      {/* Doodle 1: Xbox Gamepad (Top Left) */}
      <motion.div 
        className="absolute top-16 left-[5%] md:left-[10%] opacity-40 md:opacity-50"
        animate={{
          y: [0, -15, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-purple)' }}>
          {/* Controller Shell */}
          <path d="M25 25C25 15 35 10 60 10C85 10 95 15 95 25C95 40 105 75 90 80C75 85 65 70 60 70C55 70 45 85 30 80C15 75 25 40 25 25Z" stroke="#D946EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Left Joystick */}
          <circle cx="42" cy="35" r="7" stroke="#D946EF" strokeWidth="2" />
          <circle cx="42" cy="35" r="2" fill="#D946EF" />
          {/* Right Joystick */}
          <circle cx="78" cy="50" r="7" stroke="#D946EF" strokeWidth="2" />
          <circle cx="78" cy="50" r="2" fill="#D946EF" />
          {/* D-Pad */}
          <path d="M42 47V59M36 53H48" stroke="#D946EF" strokeWidth="2" strokeLinecap="round" />
          {/* Action Buttons (A B X Y) */}
          <circle cx="78" cy="31" r="2.5" fill="#D946EF" />
          <circle cx="85" cy="36" r="2.5" fill="#D946EF" />
          <circle cx="71" cy="36" r="2.5" fill="#D946EF" />
          <circle cx="78" cy="41" r="2.5" fill="#D946EF" />
        </svg>
      </motion.div>

      {/* Doodle 2: Arcade Joystick (Top Right) */}
      <motion.div 
        className="absolute top-24 right-[5%] md:right-[8%] opacity-40 md:opacity-50"
        animate={{
          y: [0, 18, 0],
          rotate: [2, -4, 2],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-blue)' }}>
          {/* Joystic Shaft */}
          <path d="M50 70L50 40" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
          {/* Joystick Knob */}
          <circle cx="50" cy="30" r="14" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
          <circle cx="46" cy="26" r="4" fill="#3B82F6" opacity="0.6" />
          {/* Arcade Base */}
          <path d="M20 70H80V95H20V70Z" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Buttons on Base */}
          <circle cx="35" cy="82" r="3" fill="#3B82F6" />
          <circle cx="50" cy="82" r="3" fill="#3B82F6" />
          <circle cx="65" cy="82" r="3" fill="#3B82F6" />
          {/* Perspective base lines */}
          <path d="M10 105L20 95M90 105L80 95" stroke="#3B82F6" strokeWidth="2" />
          <path d="M5 105H95" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Doodle 3: TRPG D20 Dice (Middle Right) */}
      <motion.div 
        className="absolute top-[45%] right-[4%] opacity-30 md:opacity-45 hidden sm:block"
        animate={{
          y: [0, -12, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-purple)' }}>
          {/* Outer Hexagon of D20 */}
          <path d="M55 5L98 30V80L55 105L12 80V30L55 5Z" stroke="#C084FC" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Inner Triangles / Facets */}
          <path d="M55 5V35M12 30L45 42M98 30L65 42" stroke="#C084FC" strokeWidth="1.5" />
          <path d="M45 42H65L55 90L45 42Z" stroke="#C084FC" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 30L45 42L12 80" stroke="#C084FC" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M98 30L65 42L98 80" stroke="#C084FC" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M45 42L12 80L55 105" stroke="#C084FC" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M65 42L98 80L55 105" stroke="#C084FC" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M55 35L45 42" stroke="#C084FC" strokeWidth="1.5" />
          <path d="M55 35L65 42" stroke="#C084FC" strokeWidth="1.5" />
          {/* Number 20 Label in core facet */}
          <text x="55" y="64" fill="#C084FC" fontSize="16" fontFamily="monospace" fontWeight="bold" textAnchor="middle">20</text>
        </svg>
      </motion.div>

      {/* Doodle 4: Pixel Heart & Sword (Middle Left) */}
      <motion.div 
        className="absolute top-[50%] left-[3%] opacity-30 md:opacity-45 hidden sm:block"
        animate={{
          y: [0, 15, 0],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-blue)' }}>
          {/* Pixel Heart */}
          <path d="M30 15H42M48 15H60M24 21H30H42H48H60H66M18 27H72M18 39H72M24 45H66M30 51H60M36 57H54M42 63H48" stroke="#3B82F6" strokeWidth="3" strokeLinecap="square" />
          {/* Inner Glow Block */}
          <rect x="30" y="27" width="6" height="6" fill="#60A5FA" opacity="0.8" />
        </svg>
      </motion.div>

      {/* Doodle 5: Cyber Stars / invader (Bottom Left) */}
      <motion.div 
        className="absolute bottom-16 left-[8%] opacity-25 md:opacity-40"
        animate={{
          scale: [0.95, 1.05, 0.95],
          rotate: [0, 15, 0]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-purple)' }}>
          {/* Deco Cyber cross / stars */}
          <path d="M40 10V70M10 40H70" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 30L50 50M50 30L30 50" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" />
          <circle cx="40" cy="40" r="4" fill="#E9D5FF" />
        </svg>
      </motion.div>

      {/* Doodle 6: Pixel Sword (Bottom Right) */}
      <motion.div 
        className="absolute bottom-20 right-[10%] opacity-25 md:opacity-40"
        animate={{
          y: [0, -10, 0],
          rotate: [12, -3, 12]
        }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="85" height="85" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'url(#neon-glow-blue)' }}>
          {/* Sword looking tilted up-left */}
          {/* Blade */}
          <path d="M60 20L20 60" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 14L14 58" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          {/* Tip */}
          <path d="M65 15L67 17" stroke="#3B82F6" strokeWidth="5" />
          {/* Guard */}
          <path d="M22 53L18 57" stroke="#3B82F6" strokeWidth="6" strokeLinecap="square" />
          <path d="M26 57L18 49" stroke="#3B82F6" strokeWidth="6" strokeLinecap="square" />
          {/* Hilt */}
          <path d="M15 65L7 73" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />
          {/* Pommel */}
          <circle cx="6" cy="74" r="3.5" fill="#3B82F6" />
        </svg>
      </motion.div>
    </div>
  );
}
