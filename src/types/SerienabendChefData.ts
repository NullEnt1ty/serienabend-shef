import { Chef } from './Chef.js';
import { HistoryEntry } from './HistoryEntry.js';

export type SerienabendChefData = {
  chefs: Array<Chef>;
  history: Array<HistoryEntry>;
  enforcedNextChef?: string;
  linkedChatId?: number;
};
