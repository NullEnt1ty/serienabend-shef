import * as fs from 'fs';
import * as yup from 'yup';

const configSchema = yup.object({
  botToken: yup.string().required(),
  database: yup.object({
    host: yup.string().required(),
    port: yup.number().required(),
    user: yup.string().required(),
    password: yup.string().required(),
    database: yup.string().required(),
  }),
});

export type Config = yup.InferType<typeof configSchema>;
let _config: Config | undefined;

export function getConfig() {
  if (_config === undefined) {
    throw new Error('Config has not been loaded yet');
  }

  return _config;
}

export function loadConfig(path: string) {
  try {
    const rawConfig = fs.readFileSync(path, { encoding: 'utf-8' });
    const parsedConfig = JSON.parse(rawConfig);
    _config = configSchema.validateSync(parsedConfig);
  } catch (error) {
    throw new Error('Could not load config', { cause: error });
  }

  return _config;
}
