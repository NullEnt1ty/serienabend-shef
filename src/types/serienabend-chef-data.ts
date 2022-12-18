import { Chef } from './chef';
import { HistoryEntry } from './history-entry';

export type SerienabendChefData = {
  chefs: Array<Chef>;
  history: Array<HistoryEntry>;
  enforcedNextChef?: string;
  linkedChatId?: number;
};
