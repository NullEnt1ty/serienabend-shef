import { getChefData, setChefData } from './data.js';
import { Chef } from './types/Chef.js';

export function getAllChefs() {
  return getChefData().chefs;
}

export function getChefByName(name: string) {
  const allChefs = getAllChefs();
  return allChefs.find((chef) => {
    return namesAreEqual(chef.name, name);
  });
}

export function addChef(name: string) {
  if (getChefByName(name) !== undefined) {
    throw new Error(`Chef with name '${name}' does already exist`);
  }

  const newChef: Chef = {
    name: name,
    points: 0,
  };

  const chefData = getChefData();
  chefData.chefs.push(newChef);
  setChefData(chefData);

  return newChef;
}

export function setNextChef(name: string) {
  if (getChefByName(name) === undefined) {
    throw new Error(`Could not find chef with name '${name}'`);
  }

  const chefData = getChefData();
  chefData.enforcedNextChef = name;
  setChefData(chefData);
}

export function getNextChef() {
  const chefData = getChefData();

  if (chefData.enforcedNextChef !== undefined) {
    const foundChef = chefData.chefs.find((chef) => {
      return namesAreEqual(chef.name, chefData.enforcedNextChef);
    });

    return foundChef;
  }

  return getChefWithLowestPoints(chefData.chefs);
}

export function awardChefForCooking(name: string) {
  const chef = getChefByName(name);
  if (chef === undefined) {
    throw new Error(`Could not find chef with name '${name}'`);
  }

  const chefData = getChefData();
  chef.points += 1;
  chefData.history.push({
    chef: name,
    date: new Date().toISOString(),
  });

  // This might not be the best place to reset this value but it works for now.
  delete chefData.enforcedNextChef;

  setChefData(chefData);
}

function getChefWithLowestPoints(chefs: Array<Chef>) {
  if (chefs.length === 0) {
    return undefined;
  }

  // Array.prototype.sort sorts array in-place. Create a shallow copy so the original array does not get modified.
  const chefsCopy = [...chefs];
  chefsCopy.sort((aChef, bChef) => {
    return aChef.points - bChef.points;
  });

  return chefsCopy[0];
}

function namesAreEqual(name1: string | undefined, name2: string | undefined) {
  // TODO: Levenshtein-Distanz berechnen
  return name1?.toLowerCase() === name2?.toLowerCase();
}
