export enum Settings {
  EnforcedNextChef = 'EnforcedNextChef',
  LinkedChatId = 'LinkedChatId',
}

export type Setting = {
  settingsKey: keyof typeof Settings;
  settingsValue: string | null;
};
