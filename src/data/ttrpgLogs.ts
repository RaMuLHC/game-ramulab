export interface TtrpgLog {
  id: string;
  title: string;
  date: string;
  ruleset: string;
  campaign?: string;
  summary: string;
  duration?: string;
  emoji?: string;
  accentColor?: string;
  author?: string;
  characters?: string[];
  markdownFile: string;
  status?: string;
}

export const TTRPG_LOGS: TtrpgLog[] = [
  {
    id: "cos-death-house",
    title: "斯特拉德的詛咒 // 第五章：死屋重合與夜半呢喃",
    date: "2026-05-16",
    ruleset: "D&D 5e",
    campaign: "斯特拉德的詛咒 (Curse of Strahd)",
    summary: "在巴洛維亞迷霧的籠罩下，冒險小隊踏入傳說中的「死屋」。在旋轉樓梯深處，我們聽見了嬰兒的啼哭與低沉的邪教吟誦。這是血淚與詛咒的交織…",
    duration: "4.5 小時",
    emoji: "🏰",
    accentColor: "border-purple-500/40 hover:border-purple-500 text-purple-400 bg-purple-950/20",
    author: "DM Ramu",
    characters: ["阿爾薩斯 (聖騎士)", "莉莉雅 (法師)", "格羅姆 (野蠻人)", "影葉 (遊俠)"],
    markdownFile: "/markdown/cos-death-house.md"
  }
];
