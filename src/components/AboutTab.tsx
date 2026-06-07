import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ExternalLink, Gamepad2, Award, Users, Ship, Heart, Compass, Swords, Disc } from 'lucide-react';
import { GameInformation } from '../types';

interface AboutTabProps {
  info: GameInformation;
}

export default function AboutTab({ info }: AboutTabProps) {
  const [copied, setCopied] = useState(false);
  const [copiedRiot, setCopiedRiot] = useState(false);
  const [copiedUbi, setCopiedUbi] = useState(false);

  // Dynamic Steam Profile Data State
  const [steamData, setSteamData] = useState<{
    gameCount: number | null;
    memberSinceYear: string | null;
    hours2Weeks: string | null;
    loading: boolean;
    error: boolean;
  }>({
    gameCount: null,
    memberSinceYear: null,
    hours2Weeks: null,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!info.steamUrl) return;

    const steamUrl = info.steamUrl;
    const idMatch = steamUrl.match(/\/id\/([^/]+)/);
    const profilesMatch = steamUrl.match(/\/profiles\/([^/]+)/);

    let profileXmlUrl = "";
    let gamesXmlUrl = "";

    if (idMatch) {
      const username = idMatch[1].replace(/\/$/, "");
      profileXmlUrl = `https://steamcommunity.com/id/${username}/?xml=1`;
      gamesXmlUrl = `https://steamcommunity.com/id/${username}/games/?xml=1`;
    } else if (profilesMatch) {
      const profileId = profilesMatch[1].replace(/\/$/, "");
      profileXmlUrl = `https://steamcommunity.com/profiles/${profileId}/?xml=1`;
      gamesXmlUrl = `https://steamcommunity.com/profiles/${profileId}/games/?xml=1`;
    } else {
      setSteamData(prev => ({ ...prev, loading: false, error: true }));
      return;
    }

    // 📌 由於 Steam 封鎖了 public proxy（如 allorigins），請在 Cloudflare 部署免費的個人代理並在此處貼上網址！
    // 貼上後會使用你的個人代理，否則會繼續使用 allorigins (但會是 fetching 狀態)
    const CLOUDFLARE_WORKER_PROXY = "https://steam-proxy.wing-3616.workers.dev/";

    const proxyUrl = (url: string) => {
      if (CLOUDFLARE_WORKER_PROXY) {
        const separator = CLOUDFLARE_WORKER_PROXY.endsWith('/') ? '' : '/';
        return `${CLOUDFLARE_WORKER_PROXY}${separator}?url=${encodeURIComponent(url)}`;
      }
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    };

    setSteamData(prev => ({ ...prev, loading: true, error: false }));

    fetch(proxyUrl(profileXmlUrl))
      .then(res => {
        if (!res.ok) throw new Error("Profile fetch failed");
        return res.json();
      })
      .then(async (profileData) => {
        const profileXmlText = profileData.contents;
        if (!profileXmlText) throw new Error("No profile content returned");

        const memberSinceMatch = profileXmlText.match(/<memberSince>(.*?)<\/memberSince>/i);
        const hoursPlayed2WeeksMatch = profileXmlText.match(/<hoursPlayed2Weeks>(.*?)<\/hoursPlayed2Weeks>/i);
        const privacyStateMatch = profileXmlText.match(/<privacyState>(.*?)<\/privacyState>/i);

        const memberSince = memberSinceMatch ? memberSinceMatch[1] : null;
        const hoursPlayed2Weeks = hoursPlayed2WeeksMatch ? hoursPlayed2WeeksMatch[1] : null;
        const privacyState = privacyStateMatch ? privacyStateMatch[1] : "public";

        let listYear = null;
        if (memberSince) {
          const yearMatch = memberSince.match(/\d{4}/);
          if (yearMatch) {
            listYear = yearMatch[0];
          }
        }

        let gameCount: number | null = null;
        if (privacyState === "public") {
          try {
            const gamesRes = await fetch(proxyUrl(gamesXmlUrl));
            if (gamesRes.ok) {
              const gamesData = await gamesRes.json();
              if (gamesData && gamesData.contents) {
                const gamesXmlText = gamesData.contents;
                const matches = gamesXmlText.match(/<game>/gi);
                if (matches) {
                  gameCount = matches.length;
                }
              }
            }
          } catch (err) {
            console.error("Steam games count fetch failed:", err);
          }
        }

        setSteamData({
          gameCount,
          memberSinceYear: listYear,
          hours2Weeks: hoursPlayed2Weeks,
          loading: false,
          error: false
        });
      })
      .catch(err => {
        console.error("Failed to load Steam profile data:", err);
        setSteamData(prev => ({ ...prev, loading: false, error: true }));
      });
  }, [info.steamUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRiot = () => {
    navigator.clipboard.writeText(info.riotId);
    setCopiedRiot(true);
    setTimeout(() => setCopiedRiot(false), 2000);
  };

  const handleCopyUbi = () => {
    navigator.clipboard.writeText(info.ubisoftId || 'RAMULAB');
    setCopiedUbi(true);
    setTimeout(() => setCopiedUbi(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* Bio Card (Full width / spans 2 columns) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:col-span-2 relative group overflow-hidden bg-slate-900/80 border border-purple-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)] flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Animated Scanline overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent h-1/4 w-full -translate-y-full group-hover:translate-y-[400%] transition-transform duration-[3s] ease-linear pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            <div className="text-xs font-mono text-purple-400 tracking-widest uppercase">Gamer Profile // Active</div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            {info.gamerTag}
          </h1>
          
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans mb-6">
            {info.aboutText}
          </p>
        </div>

        {/* Quick Tech Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/50 p-3 rounded-lg border border-purple-950/50">
            <div className="text-xs text-slate-500 font-mono">戰力級別</div>
            <div className="text-sm font-semibold text-purple-300 font-mono mt-1">LV. 999</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-purple-950/50">
            <div className="text-xs text-slate-500 font-mono">正在遊玩</div>
            <div className="text-sm font-semibold text-blue-300 font-mono mt-1">life.exe</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-purple-950/50 col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-500 font-mono">連線狀態</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Chilling
            </div>
          </div>
        </div>
      </motion.div>

      {/* Riot Games Card (1/2 width) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="md:col-span-1 relative bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)] group"
      >
        <div>
          {/* Header & Tag Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-950/50 rounded-xl border border-blue-500/30 text-blue-400">
                <Swords size={20} />
              </div>
              <div>
                <h2 className="text-sm font-sans font-bold text-slate-100">Riot Games 帳號</h2>
                <p className="text-[10px] text-slate-400 font-mono">VALORANT / League of Legends</p>
              </div>
            </div>

            {/* Custom Riot tag graphic panel */}
            <div className="bg-gradient-to-r from-red-950/30 to-slate-950 border border-red-500/20 rounded-xl p-3 relative overflow-hidden w-full sm:w-56 shrink-0">
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-[9px] font-mono text-red-400 tracking-wider mb-1">RIOT ID</div>
              
              <div className="flex justify-between items-center gap-3 mt-1.5">
                <div className="text-xs font-mono font-bold text-slate-200 tracking-wide truncate">
                  {info.riotId}
                </div>
                <button
                  onClick={handleCopyRiot}
                  className="p-1 px-2.5 pb-1.5 bg-red-950/50 hover:bg-red-950 text-red-300 border border-red-500/30 rounded-lg text-[10px] font-mono transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {copiedRiot ? "已複製" : "複製 ID"}
                </button>
              </div>
            </div>
          </div>

          {/* Secondary gaming profile items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">伺服器地區</span>
              <span className="text-red-400 font-mono font-semibold mt-1">北美 (NA)</span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">Valorant</span>
              <span className="text-slate-200 mt-1 font-semibold">控場者</span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">League of Legends</span>
              <span className="text-slate-200 mt-1 font-semibold">上路 / 輔助</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Steam Profile Link card (1/2 width) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="md:col-span-1 relative bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)] group"
      >
        <div>
          {/* Header & Tag Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-950/50 rounded-xl border border-blue-500/30 text-blue-400">
                <Compass size={20} />
              </div>
              <div>
                <h2 className="text-sm font-sans font-bold text-slate-100">Steam 帳號首頁</h2>
                <p className="text-[10px] text-slate-400 font-mono">Adventure / Strategy Library</p>
              </div>
            </div>

            {/* Steam URL block */}
            <div className="bg-gradient-to-r from-blue-950/30 to-slate-950 border border-blue-500/20 rounded-xl p-3 relative overflow-hidden w-full sm:w-56 shrink-0">
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-[9px] font-mono text-blue-400 tracking-wider mb-1">STEAM 社群連結</div>
              
              <div className="flex justify-between items-center gap-3 mt-1.5">
                <div className="text-xs font-mono font-bold text-slate-200 tracking-wide truncate">
                  /id/ramu0/
                </div>
                <a
                  href={info.steamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 px-2.5 pb-1.5 bg-blue-950/50 hover:bg-blue-950 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-mono transition-colors active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  前往 <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">收藏庫</span>
              <span className={`text-blue-400 font-mono font-semibold mt-1 transition-opacity duration-300 ${steamData.loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                {steamData.gameCount !== null ? `${steamData.gameCount} Games` : "fetching"}
              </span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">帳號創立</span>
              <span className={`text-slate-200 mt-1 font-mono transition-opacity duration-300 ${steamData.loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                {steamData.memberSinceYear !== null ? `${steamData.memberSinceYear} ✦` : "fetching"}
              </span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">每週活躍時間</span>
              <span className={`text-slate-200 mt-1 font-mono transition-opacity duration-300 ${steamData.loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                {steamData.hours2Weeks !== null ? `${(parseFloat(steamData.hours2Weeks) / 2).toFixed(1)} Hours` : "fetching"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ubisoft Connect Card (1/2 width) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="md:col-span-1 relative bg-slate-900/80 border border-blue-500/30 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)] group"
      >
        <div>
          {/* Header & Tag Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/50 rounded-xl border border-indigo-500/30 text-indigo-400">
                <Disc size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-sm font-sans font-bold text-slate-100">Ubisoft Connect</h2>
                <p className="text-[10px] text-slate-400 font-mono">R6 Siege</p>
              </div>
            </div>

            {/* Custom Ubisoft tag graphic panel */}
            <div className="bg-gradient-to-r from-indigo-950/30 to-slate-950 border border-indigo-500/20 rounded-xl p-3 relative overflow-hidden w-full sm:w-56 shrink-0">
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-[9px] font-mono text-indigo-400 tracking-wider mb-1">UBI ID</div>
              
              <div className="flex justify-between items-center gap-3 mt-1.5">
                <div className="text-xs font-mono font-bold text-slate-200 tracking-wide truncate">
                  {info.ubisoftId || 'RAMULAB'}
                </div>
                <button
                  onClick={handleCopyUbi}
                  className="p-1 px-2.5 pb-1.5 bg-indigo-950/50 hover:bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-mono transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {copiedUbi ? "已複製" : "複製 ID"}
                </button>
              </div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">伺服器地區</span>
              <span className="text-indigo-400 font-mono font-semibold mt-1">北美 (NA)</span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">常用 / 喜愛遊戲</span>
              <span className="text-slate-200 mt-1 font-semibold truncate">R6 Siege</span>
            </div>
            <div className="flex flex-col text-xs p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 justify-between h-full">
              <span className="text-slate-500 text-[10px] font-mono">擅長位置</span>
              <span className="text-slate-200 mt-1 font-semibold">輔助 / 突破口</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
