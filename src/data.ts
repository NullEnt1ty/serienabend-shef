import os from 'os';
import path from 'path';
import fs from 'fs';
import { SerienabendChefData } from './types';

const defaultSerienabendChefData: SerienabendChefData = {
  chefs: [],
  history: [],
};

let chefData: SerienabendChefData | undefined;

export function getChefData() {
  if (chefData === undefined) {
    chefData = readChefDataFromDisk() ?? defaultSerienabendChefData;
  }

  return chefData;
}

export function setChefData(newChefData: SerienabendChefData) {
  const newChefDataClone = { ...newChefData };
  chefData = newChefDataClone;
  writeChefDataToDisk(newChefDataClone);
}

export function persistChefData() {
  if (chefData === undefined) {
    return;
  }

  writeChefDataToDisk(chefData);
}

function writeChefDataToDisk(newChefData: SerienabendChefData) {
  const dataDirPath = getDataDirPath();
  const dataFilePath = path.join(dataDirPath, 'data.json');
  fs.mkdirSync(dataDirPath, { recursive: true });
  fs.writeFileSync(dataFilePath, JSON.stringify(newChefData, undefined, 2));
}

function readChefDataFromDisk() {
  const dataDirPath = getDataDirPath();
  const dataFilePath = path.join(dataDirPath, 'data.json');
  fs.mkdirSync(dataDirPath, { recursive: true });

  if (!fs.existsSync(dataFilePath)) {
    return;
  }

  let chefDataRaw: string;
  try {
    chefDataRaw = fs.readFileSync(dataFilePath, { encoding: 'utf-8' });
  } catch (error) {
    throw new Error('Could not read chef data', { cause: error });
  }

  let chefData: SerienabendChefData;
  try {
    chefData = JSON.parse(chefDataRaw);
  } catch (error) {
    throw new Error('Could not parse chef data', { cause: error });
  }

  return chefData;
}

function getDataDirPath() {
  if (process.env.CHEF_DATA_DIR !== undefined) {
    return process.env.CHEF_DATA_DIR;
  }

  const homeDir = os.homedir();
  const dataPath = path.join(homeDir, '.local/share/serienabend_chef');

  return dataPath;
}
