import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, Check, ExternalLink, Dices, Users, Bookmark, Play, 
  MapPin, Sparkles, BookOpen, X, Clock, Calendar, ChevronRight, 
  Hash, Swords, Shield, Scroll, Award, Compass
} from 'lucide-react';
import { GameInformation } from '../types';
import { TTRPG_LOGS, TtrpgLog } from '../data/ttrpgLogs';
import Markdown from 'react-markdown';



const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // Keep alphanumeric, whitespace, hyphens, and Chinese characters
    .trim()
    .replace(/\s+/g, '-');
};

const stripFrontmatter = (text: string) => {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/, '');
};

const getChildrenText = (children: React.ReactNode): string => {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (Array.isArray(children)) {
    return children.map(getChildrenText).join('');
  }
  if (typeof children === 'object' && 'props' in children) {
    return getChildrenText((children as any).props.children);
  }
  return '';
};

const getMarkdownHeadings = (markdown: string) => {
  const lines = markdown.split('\n');
  const list: { text: string; id: string; level: number }[] = [];
  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      let rawText = match[2].trim();
      // Remove basic markdown bold/italic
      let cleanText = rawText.replace(/[\*\_]/g, '');
      const id = slugify(cleanText);
      list.push({ text: cleanText, id, level });
    }
  });
  return list;
};


interface TtrpgTabProps {
  info: GameInformation;
}

export default function TtrpgTab({ info }: TtrpgTabProps) {
  const [copiedFvtt, setCopiedFvtt] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TtrpgLog | null>(null);
  const [showRecruiting, setShowRecruiting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Dynamic TTRPG data from manifest
  const [campaigns, setCampaigns] = useState<any[]>([
    {
      id: "neverwinter",
      title: "龍與地下城 5e：絕冬城之影",
      ruleset: "D&D 5e",
      emoji: "🐉",
      playerCount: "0/5",
      markdownFile: "/markdown/recruitment/neverwinter.md"
    }
  ]);
  const [logs, setLogs] = useState<TtrpgLog[]>(TTRPG_LOGS);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  // Dynamic Markdown loading states
  const [logMarkdownContent, setLogMarkdownContent] = useState<string>('');
  const [recruitmentMarkdownContent, setRecruitmentMarkdownContent] = useState<string>('');
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [isLoadingRecruitment, setIsLoadingRecruitment] = useState(false);

  // Share overlay states
  const [shareLinkInfo, setShareLinkInfo] = useState<{ url: string; title: string } | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Real-time FVTT status states
  const [fvttStatus, setFvttStatus] = useState<{ online: boolean; loading: boolean }>({
    online: false,
    loading: true
  });

  const handleCopyFvtt = () => {
    navigator.clipboard.writeText(info.fvttUrl);
    setCopiedFvtt(true);
    setTimeout(() => setCopiedFvtt(false), 2000);
  };

  // Real-time FVTT server status check
  React.useEffect(() => {
    let active = true;
    
    const checkFvtt = () => {
      // Check sessionStorage cache first to prevent spamming on page refreshes
      try {
        const cached = sessionStorage.getItem('fvtt_status_cache');
        if (cached) {
          const { online, timestamp } = JSON.parse(cached);
          // If cache is less than 2 minutes (120,000 ms) old, use it
          if (Date.now() - timestamp < 120000) {
            setFvttStatus({ online, loading: false });
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read FVTT status cache:", e);
      }

      // Ensure the URL is absolute
      const urlToCheck = info.fvttUrl.startsWith('http://') || info.fvttUrl.startsWith('https://') 
        ? info.fvttUrl 
        : `https://${info.fvttUrl}`;

      // Use mode: no-cors to check if server is reachable without triggering CORS block
      fetch(urlToCheck, { mode: 'no-cors' })
        .then(() => {
          if (active) {
            setFvttStatus({ online: true, loading: false });
            try {
              sessionStorage.setItem('fvtt_status_cache', JSON.stringify({
                online: true,
                timestamp: Date.now()
              }));
            } catch (e) {}
          }
        })
        .catch(err => {
          console.warn("FVTT reachability check failed (offline or network error):", err);
          if (active) {
            setFvttStatus({ online: false, loading: false });
            try {
              sessionStorage.setItem('fvtt_status_cache', JSON.stringify({
                online: false,
                timestamp: Date.now()
              }));
            } catch (e) {}
          }
        });
    };

    checkFvtt();
    
    return () => {
      active = false;
    };
  }, [info.fvttUrl]);

  const handleSelectLog = (log: TtrpgLog) => {
    setSelectedLog(log);
    setIsLoadingLog(true);
    setLogMarkdownContent('');
    fetch(`${log.markdownFile}?t=${new Date().getTime()}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load log");
        return res.text();
      })
      .then(text => {
        setLogMarkdownContent(stripFrontmatter(text));
        setIsLoadingLog(false);
      })
      .catch(err => {
        console.error(err);
        setLogMarkdownContent("⚠️ 無法載入此日誌檔案。");
        setIsLoadingLog(false);
      });
  };

  const handleOpenRecruiting = (camp: any) => {
    setSelectedCampaign(camp);
    setShowRecruiting(true);
    setIsLoadingRecruitment(true);
    setRecruitmentMarkdownContent('');
    fetch(`${camp.markdownFile}?t=${new Date().getTime()}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load recruitment info");
        return res.text();
      })
      .then(text => {
        setRecruitmentMarkdownContent(stripFrontmatter(text));
        setIsLoadingRecruitment(false);
      })
      .catch(err => {
        console.error(err);
        setRecruitmentMarkdownContent("⚠️ 無法載入招募簡介檔案。");
        setIsLoadingRecruitment(false);
      });
  };

  const handleShare = (type: 'log' | 'recruitment', id: string) => {
    const title = type === 'log' ? selectedLog?.title || '' : selectedCampaign?.title || '';
    const shareUrl = `${window.location.origin}${window.location.pathname}?${type}=${id}`;
    setShareLinkInfo({ url: shareUrl, title });
  };

  // Fetch manifest on mount and handle deep-linking
  React.useEffect(() => {
    fetch(`/markdown/manifest.json?t=${new Date().getTime()}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load manifest");
        return res.json();
      })
      .then(data => {
        const loadedCampaigns = data.recruitment || [];
        const loadedLogs = data.log || [];

        if (loadedCampaigns.length > 0) {
          setCampaigns(loadedCampaigns);
        }
        if (loadedLogs.length > 0) {
          setLogs(loadedLogs);
        }

        // Parse query params for deep linking
        const params = new URLSearchParams(window.location.search);
        const logId = params.get('log');
        const recruitmentId = params.get('recruitment');

        if (logId) {
          const matchedLog = loadedLogs.find((l: any) => l.id === logId);
          if (matchedLog) {
            handleSelectLog(matchedLog);
          }
        } else if (recruitmentId) {
          const matchedCamp = loadedCampaigns.find((c: any) => c.id === recruitmentId);
          if (matchedCamp) {
            handleOpenRecruiting(matchedCamp);
          }
        }
      })
      .catch(err => {
        console.error("Failed to load TTRPG manifest:", err);
      });
  }, []);

  // Dynamically compute unique rulesets from logs
  const availableRulesets = ['All', ...Array.from(new Set(logs.map(log => log.ruleset))).filter(Boolean)];

  const filteredLogs = (activeFilter === 'All' || !availableRulesets.includes(activeFilter))
    ? logs
    : logs.filter(log => log.ruleset === activeFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto relative">
      
      {/* Left Column (5 cols): FVTT & New Campaign Recruitment split into 2 high-fidelity cards */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Card 1: Foundry VTT Connection link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-slate-900/85 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-950/50 rounded-xl border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform duration-350">
                  <Dices size={20} />
                </div>
                <div>
                  <h2 className="text-base font-sans font-bold text-slate-100">Foundry VTT 跑團網址</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Foundry Virtual Tabletop</p>
                </div>
              </div>
              
              {/* Table status indicator */}
              {fvttStatus.loading ? (
                <div className="flex items-center gap-2 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">Checking</span>
                </div>
              ) : fvttStatus.online ? (
                <div className="flex items-center gap-2 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-semibold">Offline</span>
                </div>
              )}
            </div>

            <p className="text-slate-350 text-xs leading-relaxed mb-5">
              這是我們專屬的網頁版虛擬桌面（VTT）伺服器！內建精美自訂地圖、動態光源、背景音樂以及全自動人物卡。
            </p>

            {/* FVTT Server URL Box */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                Tabletop Connection Link
              </div>
              <div className="flex items-center justify-between mt-1.5 gap-4">
                <div className="text-xs font-mono font-semibold text-purple-300 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
                  {info.fvttUrl}
                </div>
                <button 
                  onClick={handleCopyFvtt}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-800 text-slate-400 hover:text-purple-300 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedFvtt ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>複製</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-3">
            <a
              href={info.fvttUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all shrink-0 active:scale-95"
            >
              <Play size={11} fill="white" /> 傳送到 FVTT 伺服器 <ExternalLink size={11} />
            </a>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              * 建議使用 Chrome / Edge 瀏覽器。
            </div>
          </div>
        </motion.div>

        {/* Card 2: New Campaign Recruitment */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative bg-slate-900/85 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3.5">
            <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <Sparkles size={14} className="text-purple-400 animate-pulse" />
              <span>新戰役招募 // New Campaign Recruitment</span>
            </h3>
            
            {campaigns.length > 0 ? (
              campaigns.map((camp) => (
                <div 
                  key={camp.id}
                  onClick={() => handleOpenRecruiting(camp)}
                  className="group relative bg-slate-950/50 hover:bg-slate-950/80 border border-slate-850 hover:border-purple-500/30 rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-purple-500 rounded-l-xl transition-all" />
                  
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-2xl select-none shrink-0">{camp.emoji || '🐉'}</span>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                        {camp.ruleset || 'D&D 5e'}
                      </span>
                      <h4 className="text-xs font-sans font-bold text-slate-100 group-hover:text-purple-300 transition-colors mt-2 truncate">
                        {camp.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1 truncate">
                        報名人數: {camp.playerCount || '未定'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-purple-400 font-mono flex items-center gap-0.5 group-hover:text-purple-300 shrink-0 select-none">
                    <span>展開招募</span>
                    <ChevronRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <span className="text-lg">📦</span>
                <p className="text-[10px] text-slate-500 font-mono mt-1.5">目前無招募中的戰役</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* TRPG Discord group banner & Logs Explorer (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* TRPG Guild Server invite block */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative bg-slate-900/85 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-500/30 text-blue-400">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-base font-sans font-bold text-slate-100">NA TRPG Discord 群組</h2>
                  <p className="text-[10px] text-slate-400 font-mono">TTRPG Discord Server</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                這是我們玩家、DM (地下城城主) 和 GM (遊戲主持人) 的總部。我們在這裡進行：
              </p>

              {/* Bullets */}
              <div className="space-y-3.5 pl-1 mb-5 text-xs text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-purple-400 shrink-0" />
                  <span>開團招募</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-blue-400 shrink-0" />
                  <span>資源與心得分享</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dices size={12} className="text-pink-400 shrink-0" />
                  <span>即時擲骰頻道</span>
                </div>
              </div>

              {/* Systems directory badges */}
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 border-t border-slate-800/80 pt-4">
                SUPPORTED SYSTEMS // 支援規則
              </div>
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] px-2.5 py-0.5 bg-purple-950/20 text-purple-300 border border-purple-500/20 rounded-full font-mono">D&D 5e</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-teal-950/20 text-teal-300 border border-teal-500/20 rounded-full font-mono">CoC 7th</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-amber-950/20 text-amber-300 border border-amber-500/20 rounded-full font-mono">Pathfinder 2</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-rose-950/20 text-rose-300 border border-rose-500/20 rounded-full font-mono">Lancer</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-cyan-950/20 text-cyan-300 border border-cyan-500/20 rounded-full font-mono">Dagger Heart</span>
              </div>
            </div>

            <div>
              <a
                href={info.trpgDiscordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-blue-500/40 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 hover:text-white transition-all text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
              >
                立刻加入 TRPG 討論群組 <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>
 
        {/* Interactive Chronicles log folder (Target element area) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col"
        >
          {/* Section banner */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <Scroll size={18} className="text-purple-400" />
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">冒險者跑團日誌 // Chronicles Logs</h3>
              </div>
            </div>

            {/* Total count badge */}
            <span className="px-2 py-0.5 bg-purple-950/40 text-purple-400 border border-purple-500/20 rounded text-[9px] font-mono">
              {logs.length} RECORDS
            </span>
          </div>

          {/* Filtering tab bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
            {availableRulesets.map((ruleset) => (
              <button
                key={ruleset}
                onClick={() => setActiveFilter(ruleset)}
                className={`text-[10px] font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilter === ruleset
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {ruleset}
              </button>
            ))}
          </div>

          {/* Session Cards list */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-950 scrollbar-track-transparent">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                whileHover={{ x: 3 }}
                onClick={() => handleSelectLog(log)}
                className="group relative bg-slate-950/50 hover:bg-slate-950/80 border border-slate-850 hover:border-purple-500/30 rounded-xl p-3.5 transition-all cursor-pointer flex gap-3.5"
              >
                {/* Active left indicator line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-purple-500 rounded-l-xl transition-all" />

                {/* Left side: Emoji */}
                <span className="text-2xl select-none pt-0.5 shrink-0">{log.emoji || '📜'}</span>

                {/* Right side details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2.5 mb-1">
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                      {log.ruleset}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                      <Calendar size={10} />
                      {log.date}
                    </span>
                  </div>

                  <h4 className="text-xs font-sans font-bold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                    {log.title}
                  </h4>

                  <p className="text-[11px] text-slate-450 leading-relaxed mt-1 line-clamp-2">
                    {log.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900">
                    {log.status ? (
                      <div className="text-[10px] text-slate-400 font-sans truncate">
                        狀態: <span className="text-slate-300">{log.status}</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="text-[10px] text-purple-400 font-mono flex items-center gap-0.5 group-hover:text-purple-300">
                      <span>展開閱讀</span> 
                      <ChevronRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <span className="text-xl">🫙</span>
                <p className="text-[11px] text-slate-500 font-mono mt-1.5">尚未上傳此類型的跑團日誌</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Immersive Floating Modal / Slide-up Overlay with AnimatePresence */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Immersive Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-5xl bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col md:flex-row h-[85vh] max-h-[750px] overflow-hidden z-10"
            >
              {/* Sidebar: Meta specifications (full-width on mobile, md:width-72 on desktop) */}
              <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 overflow-y-auto max-h-[35vh] md:max-h-full md:h-full">
                <div className="space-y-5 flex flex-col md:flex-1 md:min-h-0">
                  {/* Campaign Theme Header */}
                  <div className="flex items-center gap-3 mt-1 shrink-0">
                    <span className="text-3xl select-none leading-none">{selectedLog.emoji || '📜'}</span>
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-purple-400 uppercase">Chronicle Archive</span>
                      <h3 className="text-sm font-sans font-bold text-slate-200 line-clamp-1">{selectedLog.title}</h3>
                    </div>
                  </div>

                  {/* Chapter Navigation Index */}
                  <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-1 md:min-h-0">
                    <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2.5 flex items-center gap-1.5 shrink-0">
                      <Compass size={11} className="text-purple-400 shrink-0" />
                      <span>章節導覽 // INDEX</span>
                    </div>
                    <div className="space-y-1 max-h-[22vh] md:max-h-none md:flex-1 overflow-y-auto scrollbar-thin pr-1">
                      {getMarkdownHeadings(logMarkdownContent).map((h, index) => {
                        const isLevel1 = h.level === 1;
                        const isLevel2 = h.level === 2;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const el = document.getElementById(h.id);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`w-full text-left font-sans text-[11px] transition-all hover:text-purple-355 py-1 px-1.5 rounded-lg hover:bg-purple-950/15 active:scale-[0.98] block cursor-pointer truncate ${
                              isLevel1 
                                ? 'font-bold text-slate-200 border-l border-purple-500/40 pl-2' 
                                : isLevel2
                                  ? 'text-slate-400 pl-3 border-l border-slate-800/80'
                                  : 'text-slate-550 pl-4.5 border-l border-transparent'
                            }`}
                            title={h.text}
                          >
                            {h.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom share button */}
                <div className="pt-5 border-t border-slate-800/50 mt-4 shrink-0">
                  <button
                    onClick={() => handleShare('log', selectedLog.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 text-slate-350 hover:text-purple-300 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                  >
                    <span>🔗</span> 分享此頁面 // SHARE
                  </button>
                </div>
              </div>

              {/* Main reading console text panel */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:p-8 bg-slate-950/20 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                {/* Embedded custom styling overrides for MD representation using native tags */}
                <div className="markdown-body pr-1 font-sans">
                  {isLoadingLog ? (
                    <div className="flex flex-col gap-4 animate-pulse py-8">
                      <div className="h-8 bg-purple-950/20 border border-purple-500/10 rounded-lg w-3/4 py-4 mb-4"></div>
                      <div className="h-4 bg-slate-800/60 rounded-lg w-1/2 mb-2"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-full"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-full"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-5/6"></div>
                    </div>
                  ) : (
                    <Markdown
                      components={{
                        h1: ({ children }) => {
                          const id = slugify(getChildrenText(children));
                          return (
                            <h1 id={id} className="text-xl md:text-2xl font-bold font-sans text-slate-100 border-b border-purple-500/10 pb-3 mb-5 mt-2 tracking-tight flex items-center gap-2 scroll-mt-6">
                              {children}
                            </h1>
                          );
                        },
                        h2: ({ children }) => {
                          const id = slugify(getChildrenText(children));
                          return (
                            <h2 id={id} className="text-md md:text-lg font-bold font-sans text-purple-300 mt-6 mb-3 flex items-center gap-1.5 border-l-2 border-purple-500/40 pl-2.5 scroll-mt-6">
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children }) => {
                          const id = slugify(getChildrenText(children));
                          return (
                            <h3 id={id} className="text-sm font-semibold font-sans text-pink-300 mt-5 mb-2 pl-1 scroll-mt-6">
                              {children}
                            </h3>
                          );
                        },
                        p: ({ children }) => (
                          <p className="text-xs md:text-sm font-sans text-slate-300 leading-relaxed mb-4 text-justify font-light select-text">
                            {children}
                          </p>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-500 bg-purple-950/20 p-3.5 my-5 rounded-r-xl text-xs md:text-sm text-slate-200 leading-normal italic font-medium">
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-5 space-y-2 text-xs md:text-sm text-slate-350">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-5 space-y-2 text-xs md:text-sm text-slate-350">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-slate-300 select-text">
                            {children}
                          </li>
                        ),
                        hr: () => (
                          <hr className="border-slate-800/80 my-5 md:my-6" />
                        ),
                        code: ({ children }) => (
                          <code className="bg-slate-950 border border-slate-800 text-purple-300 font-mono text-[10px] md:text-xs px-1.5 py-0.5 rounded-md mx-0.5">
                            {children}
                          </code>
                        )
                      }}
                    >
                      {logMarkdownContent}
                    </Markdown>
                  )}
                </div>

                {/* Reading Complete / Action row */}
                <div className="flex justify-end border-t border-slate-800/60 pt-5 mt-8 mb-2">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all cursor-pointer shadow-md hover:border-purple-500/20"
                  >
                    關閉並返回目錄
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Immersive Floating Modal / Slide-up Overlay for Campaign Recruitment */}
      <AnimatePresence>
        {showRecruiting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRecruiting(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Immersive Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-5xl bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col md:flex-row h-[85vh] max-h-[750px] overflow-hidden z-10"
            >
              {/* Top Exit trigger (Close Button) on absolute corner */}
              <button
                onClick={() => setShowRecruiting(false)}
                className="absolute top-4 right-4 p-2 bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white rounded-lg hover:border-purple-500/30 transition-all cursor-pointer z-20 active:scale-95"
                title="關閉視窗"
              >
                <X size={15} />
              </button>

              {/* Sidebar: Meta specifications (full-width on mobile, md:width-72 on desktop) */}
              <div className="w-full md:w-72 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 overflow-y-auto max-h-[35vh] md:max-h-full md:h-full">
                <div className="space-y-5 flex flex-col md:flex-1 md:min-h-0">
                  {/* Campaign Theme Header */}
                  <div className="flex items-center gap-3 mt-1 shrink-0">
                    <span className="text-3xl select-none leading-none">{selectedCampaign?.emoji || '🐉'}</span>
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-purple-400 uppercase">New Campaign Recruitment</span>
                      <h3 className="text-sm font-sans font-bold text-slate-200 line-clamp-1">{selectedCampaign?.title || '絕冬城之影'}</h3>
                    </div>
                  </div>

                  {/* Chapter Navigation Index */}
                  <div className="border-t border-slate-800/60 pt-4 flex flex-col md:flex-1 md:min-h-0">
                    <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-2.5 flex items-center gap-1.5 shrink-0">
                      <Compass size={11} className="text-purple-400 shrink-0" />
                      <span>章節導覽 // INDEX</span>
                    </div>
                    <div className="space-y-1 max-h-[22vh] md:max-h-none md:flex-1 overflow-y-auto scrollbar-thin pr-1">
                      {getMarkdownHeadings(recruitmentMarkdownContent).map((h, index) => {
                        const isLevel1 = h.level === 1;
                        const isLevel2 = h.level === 2;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const el = document.getElementById(`recruitment-${h.id}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={`w-full text-left font-sans text-[11px] transition-all hover:text-purple-355 py-1 px-1.5 rounded-lg hover:bg-purple-950/15 active:scale-[0.98] block cursor-pointer truncate ${
                              isLevel1 
                                ? 'font-bold text-slate-200 border-l border-purple-500/40 pl-2' 
                                : isLevel2
                                  ? 'text-slate-400 pl-3 border-l border-slate-800/80'
                                  : 'text-slate-550 pl-4.5 border-l border-transparent'
                            }`}
                            title={h.text}
                          >
                            {h.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom share button */}
                <div className="pt-5 border-t border-slate-800/50 mt-4 shrink-0">
                  <button
                    onClick={() => handleShare('recruitment', selectedCampaign.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/30 text-slate-350 hover:text-purple-300 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                  >
                    <span>🔗</span> 分享此頁面 // SHARE
                  </button>
                </div>
              </div>

              {/* Main reading console text panel */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:p-8 bg-slate-950/20 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
                {/* Embedded custom styling overrides for MD representation using native tags */}
                <div className="markdown-body pr-1 font-sans">
                  {isLoadingRecruitment ? (
                    <div className="flex flex-col gap-4 animate-pulse py-8">
                      <div className="h-8 bg-purple-950/20 border border-purple-500/10 rounded-lg w-3/4 py-4 mb-4"></div>
                      <div className="h-4 bg-slate-800/60 rounded-lg w-1/2 mb-2"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-full"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-full"></div>
                      <div className="h-3.5 bg-slate-800/40 rounded-lg w-5/6"></div>
                    </div>
                  ) : (
                    <Markdown
                      components={{
                        h1: ({ children }) => {
                          const id = `recruitment-${slugify(getChildrenText(children))}`;
                          return (
                            <h1 id={id} className="text-xl md:text-2xl font-bold font-sans text-slate-100 border-b border-purple-500/10 pb-3 mb-5 mt-2 tracking-tight flex items-center gap-2 scroll-mt-6">
                              {children}
                            </h1>
                          );
                        },
                        h2: ({ children }) => {
                          const id = `recruitment-${slugify(getChildrenText(children))}`;
                          return (
                            <h2 id={id} className="text-md md:text-lg font-bold font-sans text-purple-300 mt-6 mb-3 flex items-center gap-1.5 border-l-2 border-purple-500/40 pl-2.5 scroll-mt-6">
                              {children}
                            </h2>
                          );
                        },
                        h3: ({ children }) => {
                          const id = `recruitment-${slugify(getChildrenText(children))}`;
                          return (
                            <h3 id={id} className="text-sm font-semibold font-sans text-pink-300 mt-5 mb-2 pl-1 scroll-mt-6">
                              {children}
                            </h3>
                          );
                        },
                        p: ({ children }) => (
                          <p className="text-xs md:text-sm font-sans text-slate-300 leading-relaxed mb-4 text-justify font-light select-text">
                            {children}
                          </p>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-500 bg-purple-950/20 p-3.5 my-5 rounded-r-xl text-xs md:text-sm text-slate-200 leading-normal italic font-medium">
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-5 space-y-2 text-xs md:text-sm text-slate-350">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-5 space-y-2 text-xs md:text-sm text-slate-350">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-slate-300 select-text">
                            {children}
                          </li>
                        ),
                        hr: () => (
                          <hr className="border-slate-800/80 my-5 md:my-6" />
                        ),
                        code: ({ children }) => (
                          <code className="bg-slate-950 border border-slate-800 text-purple-300 font-mono text-[10px] md:text-xs px-1.5 py-0.5 rounded-md mx-0.5">
                            {children}
                          </code>
                        )
                      }}
                    >
                      {recruitmentMarkdownContent}
                    </Markdown>
                  )}
                </div>

                {/* Footnotes / Action CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/60 pt-5 mt-8 mb-2">
                  <span className="text-xs text-slate-300 leading-relaxed max-w-lg">
                    <strong className="text-purple-400 font-bold">報名方法：</strong>請關閉此浮動視窗並加入我們的Discord伺服器（NA TRPG），並私聊DM報名。
                  </span>
                  <button
                    onClick={() => setShowRecruiting(false)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all cursor-pointer shadow-md hover:border-purple-500/20 whitespace-nowrap align-self-end sm:align-self-auto"
                  >
                    關閉並返回
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Link Modal Overlay */}
      <AnimatePresence>
        {shareLinkInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareLinkInfo(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.25)] p-6 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShareLinkInfo(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg hover:border-purple-500/30 transition-all cursor-pointer"
                title="關閉"
              >
                <X size={13} />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 bg-purple-950/50 border border-purple-500/30 rounded-lg text-purple-400">
                  <Compass size={16} />
                </div>
                <h3 className="text-sm font-sans font-bold text-slate-100">分享此頁面連結</h3>
              </div>

              <p className="text-xs text-slate-450 mb-4 font-sans leading-relaxed">
                您可以使用此專屬連結直接分享「{shareLinkInfo.title}」內容給其他隊友：
              </p>

              {/* URL Box (FVTT format style) */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  Shareable Link
                </div>
                <div className="flex items-center justify-between mt-1.5 gap-4">
                  <div className="text-xs font-mono font-semibold text-purple-300 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 flex-1">
                    {shareLinkInfo.url}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareLinkInfo.url);
                      setCopiedShareLink(true);
                      setTimeout(() => setCopiedShareLink(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500/30 hover:bg-slate-800 text-slate-400 hover:text-purple-300 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedShareLink ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>複製</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
