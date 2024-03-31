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
    const configPath = getConfigPath();
    return loadConfig(configPath);
  }

  return _config;
}

function getConfigPath() {
  const configPath = process.env['CHEF_CONFIG'];
  if (configPath == null) {
    console.error('Missing environment variable CHEF_CONFIG');
    process.exit(1);
  }

  return configPath;
}

function loadConfig(path: string) {
  try {
    const rawConfig = fs.readFileSync(path, { encoding: 'utf-8' });
    const parsedConfig = JSON.parse(rawConfig);
    _config = configSchema.validateSync(parsedConfig);
  } catch (error) {
    throw new Error('Could not load config', { cause: error });
  }

  return _config;
}
