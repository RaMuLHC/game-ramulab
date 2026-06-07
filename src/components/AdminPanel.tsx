import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RotateCcw, AlertTriangle, Settings, Sliders } from 'lucide-react';
import { GameInformation } from '../types';
import { DEFAULT_GAME_INFO } from '../data';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  info: GameInformation;
  onSave: (newInfo: GameInformation) => void;
}

export default function AdminPanel({ isOpen, onClose, info, onSave }: AdminPanelProps) {
  const [formState, setFormState] = useState<GameInformation>({ ubisoftId: info.ubisoftId || 'RAMULAB', ...info });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Sync state with parent's info when opening the panel
  React.useEffect(() => {
    if (isOpen) {
      setFormState({ ubisoftId: info.ubisoftId || 'RAMULAB', ...info });
    }
  }, [isOpen, info]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  const handleResetToDefault = () => {
    setFormState({ ...DEFAULT_GAME_INFO });
    setShowConfirmReset(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with motion fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-50 pointer-events-auto backdrop-blur-xs"
          />

          {/* Modal layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-hidden bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(168,85,247,0.3)] z-50 pointer-events-auto flex flex-col justify-between"
          >
            {/* Top scanning animation bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="text-purple-450" size={20} />
                <h3 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2">
                  <span>RAMULAB 個人排版自訂工具</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 border border-purple-550/30 rounded">
                    Admin Port
                  </span>
                </h3>
              </div>
              
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans text-sm scrollbar-thin">
              
              {/* Profile Config */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                  1. 個人基本資訊配置 // Bio Config
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">玩家代號 (Gamer Tag)</label>
                    <input 
                      type="text" 
                      name="gamerTag"
                      value={formState.gamerTag}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Discord 帳號名稱 (Username)</label>
                    <input 
                      type="text" 
                      name="discordUsername"
                      value={formState.discordUsername}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">關於我自我介紹 (About Narrative)</label>
                  <textarea 
                    name="aboutText"
                    value={formState.aboutText}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none resize-none font-sans leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Game Accounts Info */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                  2. 外部聯絡群組與帳號 // Social & Game Accounts
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Steam 個人首頁連結 (URL)</label>
                    <input 
                      type="url" 
                      name="steamUrl"
                      value={formState.steamUrl}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Discord 語音伺服器邀請連結</label>
                    <input 
                      type="url" 
                      name="discordServerUrl"
                      value={formState.discordServerUrl}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Riot Game ID (e.g. ID#Tag)</label>
                    <input 
                      type="text" 
                      name="riotId"
                      value={formState.riotId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Ubisoft Connect 帳號</label>
                    <input 
                      type="text" 
                      name="ubisoftId"
                      value={formState.ubisoftId || ''}
                      onChange={handleInputChange}
                      placeholder="例如: RAMULAB_ubi"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Minecraft server config */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                  3. MINECRAFT 伺服器配置 // Minecraft Host
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Minecraft 伺服器 IP:埠</label>
                    <input 
                      type="text" 
                      name="minecraftIp"
                      value={formState.minecraftIp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">使用模組包名稱 (Modpack Name)</label>
                    <input 
                      type="text" 
                      name="minecraftModpackName"
                      value={formState.minecraftModpackName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">模組包下載或詳情網址 (Modpack URL)</label>
                  <input 
                    type="url" 
                    name="minecraftModpackUrl"
                    value={formState.minecraftModpackUrl}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* TTRPG servers */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                  4. TRPG 與 FOUNDRY VTT 桌台配置 // TTRPG Host
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Foundry VTT 伺服器網址</label>
                    <input 
                      type="url" 
                      name="fvttUrl"
                      value={formState.fvttUrl}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">TRPG Discord 群組邀請網址</label>
                    <input 
                      type="url" 
                      name="trpgDiscordUrl"
                      value={formState.trpgDiscordUrl}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Discord 伺服器 Widget ID (用於網頁側欄內嵌)
                    </label>
                    <input 
                      type="text" 
                      name="discordServerWidgetId"
                      value={formState.discordServerWidgetId}
                      onChange={handleInputChange}
                      placeholder="例如: 1153548981358903337"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-slate-200 outline-none font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      * 格式為 18 位純數字。請至「伺服器設定 &gt; 小工具 (Widget) &gt; 啟用伺服器小工具」後複製「伺服器 ID」。
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons panel */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {showConfirmReset ? (
                    <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 p-1.5 rounded-lg px-2 text-xs">
                      <AlertTriangle size={13} className="text-red-400" />
                      <span className="text-red-300">確定還原?</span>
                      <button 
                        type="button"
                        onClick={handleResetToDefault}
                        className="text-red-400 hover:text-red-300 font-bold underline px-1"
                      >
                        是
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmReset(false)}
                        className="text-slate-400 hover:text-slate-300 font-bold px-1"
                      >
                        否
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setShowConfirmReset(true)}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 p-2 rounded-lg border border-red-500/20 transition-all font-mono"
                    >
                      <RotateCcw size={12} />
                      還原為預設範例
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-350 rounded-xl transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
                  >
                    <Save size={14} /> 保存變更
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
