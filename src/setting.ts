import { eq } from 'drizzle-orm';
import { db } from './database';
import { Settings, setting } from './schemas';

const cachedSettings = new Map<Settings, string | null | undefined>();

export async function getSetting(key: Settings) {
  if (cachedSettings.has(key)) {
    return cachedSettings.get(key);
  }

  const result = await db.query.setting.findFirst({
    where: eq(setting.settingsKey, key),
  });

  const value = result?.settingsValue;
  cachedSettings.set(key, value);

  return value;
}

export async function setSetting(key: Settings, value: string | null) {
  cachedSettings.set(key, value);

  await db
    .insert(setting)
    .values({
      settingsKey: key,
      settingsValue: value,
    })
    .onDuplicateKeyUpdate({ set: { settingsValue: value } });
}

export async function deleteSetting(key: Settings) {
  cachedSettings.delete(key);
  await db.delete(setting).where(eq(setting.settingsKey, key));
}
