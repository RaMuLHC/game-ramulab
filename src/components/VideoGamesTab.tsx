import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ExternalLink, ShieldCheck, Download, Disc, Network, HelpCircle, HardDrive, Swords, Users, Gamepad2, Compass } from 'lucide-react';
import { GameInformation } from '../types';

interface VideoGamesTabProps {
  info: GameInformation;
}

export default function VideoGamesTab({ info }: VideoGamesTabProps) {
  const [copiedMc, setCopiedMc] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  // Real-time Minecraft server status
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    players: { online: number; max: number } | null;
    version: string | null;
    loading: boolean;
  }>({
    online: false,
    players: null,
    version: null,
    loading: true
  });

  useEffect(() => {
    let active = true;
    
    const fetchStatus = () => {
      // Use mcstatus.io v2 Java status API which has full CORS support
      fetch(`https://api.mcstatus.io/v2/status/java/${info.minecraftIp}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch Minecraft status");
          return res.json();
        })
        .then(data => {
          if (active) {
            setServerStatus({
              online: data.online,
              players: data.players ? { online: data.players.online, max: data.players.max } : null,
              version: data.version?.name_clean || null,
              loading: false
            });
          }
        })
        .catch(err => {
          console.error("Minecraft server query error:", err);
          if (active) {
            setServerStatus(prev => ({ ...prev, loading: false }));
          }
        });
    };

    fetchStatus();
    
    return () => {
      active = false;
    };
  }, [info.minecraftIp]);


  const handleCopyMc = () => {
    navigator.clipboard.writeText(info.minecraftIp);
    setCopiedMc(true);
    setTimeout(() => setCopiedMc(false), 2000);
  };

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(info.discordUsername);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto -mt-9 md:-mt-16 space-y-6">
      
      {/* Header with dividing line matching the top bar style */}
      <div className="pt-4 pb-4 border-b border-purple-500/10">
        <h3 className="text-sm font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
          // Let's Game Together
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-6 items-stretch">
      
      {/* Minecraft multiplayer server node card (6 cols) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="md:col-span-6 relative bg-slate-900/85 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between h-full"
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-950/50 rounded-xl border border-purple-500/30 text-purple-400">
                <Network size={20} />
              </div>
              <div>
                <h2 className="text-lg font-sans font-bold text-slate-100">Minecraft 專屬伺服器</h2>
                <p className="text-xs text-slate-400 font-mono">Modded Minecraft Server</p>
              </div>
            </div>
            
            {/* Status light */}
            {serverStatus.loading ? (
              <div className="flex items-center gap-2 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">Checking</span>
              </div>
            ) : serverStatus.online ? (
              <div className="flex items-center gap-2 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/30">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">Offline</span>
              </div>
            )}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            專爲群友架設Minecraft生存伺服器。加入我們一起參與劍與魔法的冒險！
          </p>

          {/* Connection terminal panel */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 mb-6 relative">
            <div className="absolute top-1.5 right-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
            </div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest pb-2 mb-3 border-b border-slate-900">
              Connection Terminal //
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">SERVER IP ADDRESS // PORT</div>
                <div className="text-base font-mono font-semibold text-purple-300 tracking-wide mt-1">
                  {info.minecraftIp}
                </div>
              </div>
              
              <button 
                onClick={handleCopyMc}
                className="self-start sm:self-center px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2"
              >
                {copiedMc ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">複製成功</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>複製 IP 地址</span>
                  </>
                )}
              </button>
            </div>

            {/* Real-time Server Parameters */}
            {!serverStatus.loading && (
              <div className="mt-4 pt-3 border-t border-slate-900 text-[11px] font-mono">
                {serverStatus.online && serverStatus.players ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500">當前人數:</span>{' '}
                      <span className="text-blue-400 font-bold">
                        {serverStatus.players.online} / {serverStatus.players.max}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">主機版本:</span>{' '}
                      <span className="text-purple-400 font-semibold">
                        {serverStatus.version || '1.20.1'}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-500">伺服狀態:</span>{' '}
                      <span className="text-emerald-400 font-semibold">運行中</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-rose-400 font-semibold text-center py-0.5">
                    ⚠️ 伺服器目前關閉中，請聯絡管理員開啟。
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modpack directory card */}
          <div className="border border-slate-800/80 bg-slate-950/20 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-1.5 bg-blue-950/40 rounded-lg text-blue-400 mt-0.5 shrink-0">
                  <HardDrive size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-mono font-semibold text-slate-300">伺服器模組包</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    伺服器使用了 <strong className="text-purple-300">{info.minecraftModpackName}</strong>。請務必先安裝好對應版本的模組，否則將會無法登入！
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3.5">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                      Prominence II [RPG]
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                      RPG Adventure
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                      Quest
                    </span>
                  </div>
                </div>
              </div>

              {/* Relocated Download Modpack Button */}
              <div className="w-full sm:w-auto shrink-0 flex items-center justify-center sm:justify-end">
                <a
                  href={info.minecraftModpackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-2 px-3.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all whitespace-nowrap"
                >
                  <Download size={13} /> 下載模組包 <ExternalLink size={11} className="opacity-80" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Discord server info card (4 cols on large screens) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="md:col-span-4 relative bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)] flex flex-col justify-between h-full group"
      >
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-950/50 rounded-xl border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform duration-350">
                <Gamepad2 size={20} />
              </div>
              <div>
                <div className="text-xs font-mono text-purple-400">專屬 Discord 伺服器</div>
                <div className="text-lg font-sans font-bold text-slate-200 mt-0.5">鬍鬚張滷肉飯</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[9px] font-mono text-purple-400 uppercase font-semibold">Active</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            我們的遊戲基地
          </p>

          {/* TTRPG-styled bullet details */}
          <div className="space-y-3.5 pl-1 text-xs text-slate-300 font-sans">
            <div className="flex items-center gap-2">
              <Gamepad2 size={13} className="text-blue-400 shrink-0" />
              <span>遊戲組隊</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={13} className="text-purple-400 shrink-0" />
              <span>聊天交流</span>
            </div>
            <div className="flex items-center gap-2">
              <Disc size={13} className="text-pink-400 shrink-0" />
              <span>音樂分享</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-5">
            <span className="text-[10px] px-2.5 py-0.5 bg-purple-950/40 text-purple-300 border border-purple-500/20 rounded font-mono">Minecraft</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-500/20 rounded font-mono">League of Legends</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-500/20 rounded font-mono">Valorant</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 rounded font-mono">Escape From Tarkov</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-blue-950/40 text-blue-300 border border-blue-500/20 rounded font-mono">R6 Siege</span>
            <span className="text-[10px] px-2.5 py-0.5 bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 rounded font-mono">CS2</span>
          </div>
        </div>

        <div className="mt-6">
          <a
            href={info.discordServerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 transition-all text-xs font-mono font-medium flex items-center justify-center gap-2 rounded-lg"
          >
            加入語音群組 <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
