export interface PlayerSettings {
  modelName: string;
  systemPrompt: string;
}

export interface LapDto {
  lapId: string;
  whitePlayerSetting?: PlayerSettings | null;
  blackPlayerSetting?: PlayerSettings | null;
  status: string;
  winner: string | null;
  updatedAt: string;
}

