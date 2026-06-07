export interface GameInformation {
  gamerTag: string;
  aboutText: string;
  steamUrl: string;
  discordUsername: string;
  discordServerUrl: string;
  discordServerWidgetId: string;
  riotId: string;
  minecraftIp: string;
  minecraftModpackName: string;
  minecraftModpackUrl: string;
  fvttUrl: string;
  trpgDiscordUrl: string;
  ubisoftId?: string;
}

export type ActiveTab = 'about' | 'videogames' | 'ttrpg';
