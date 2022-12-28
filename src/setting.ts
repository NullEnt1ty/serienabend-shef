import { knex } from './database';
import { Settings } from './types';

const cachedSettings = new Map<Settings, string | null | undefined>();

export async function getSetting(key: Settings) {
  if (cachedSettings.has(key)) {
    return cachedSettings.get(key);
  }

  const result = await knex('Setting')
    .select('settingsValue')
    .where('settingsKey', key)
    .first();

  const value = result?.settingsValue;
  cachedSettings.set(key, value);

  return value;
}

export async function setSetting(key: Settings, value: string | null) {
  cachedSettings.set(key, value);

  await knex('Setting')
    .insert({
      settingsKey: key,
      settingsValue: value,
    })
    .onConflict('settingsKey')
    .merge();
}

export async function deleteSetting(key: Settings) {
  cachedSettings.delete(key);
  await knex('Setting').where('settingsKey', key).delete();
}
