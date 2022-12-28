import { knex } from './database';
import { deleteSetting, getSetting, setSetting } from './setting';
import { Chef, AddChef, Settings } from './types';

export async function getAllChefs() {
  return knex('Chef').select('*');
}

export async function getChefByName(name: string) {
  return knex('Chef').select('*').where('name', name).first();
}

export async function addChef(name: string) {
  if ((await getChefByName(name)) !== undefined) {
    throw new Error(`Chef with name '${name}' does already exist`);
  }

  const newChef: AddChef = {
    name: name,
    points: 0,
  };

  await knex('Chef').insert(newChef);
  const addedChef = await knex('Chef').select('*').where('name', name).first();

  if (addedChef === undefined) {
    throw new Error(`Adding chef with name '${name}' failed`);
  }

  return addedChef;
}

export async function setNextChef(name: string) {
  const chef = await getChefByName(name);

  if (chef === undefined) {
    throw new Error(`Could not find chef with name '${name}'`);
  }

  await setSetting(Settings.EnforcedNextChef, chef.id.toString());
}

export async function getNextChef() {
  const enforcedNextChefId = await getSetting(Settings.EnforcedNextChef);

  if (enforcedNextChefId != null) {
    const chef = await knex('Chef')
      .select('*')
      .where('id', enforcedNextChefId)
      .first();

    if (chef !== undefined) {
      return chef;
    }
  }

  return getChefWithLowestPoints();
}

export async function resetEnforcedNextChef() {
  await deleteSetting(Settings.EnforcedNextChef);
}

export async function awardChefForCooking(name: string) {
  await knex.transaction(async (trx) => {
    const chef = await knex('Chef')
      .select('*')
      .where('name', name)
      .first()
      .transacting(trx);

    if (chef === undefined) {
      throw new Error(`Could not find chef with name '${name}'`);
    }

    const newPoints = chef.points + 1;

    await knex('Chef')
      .update('points', newPoints)
      .where('id', chef.id)
      .transacting(trx);

    // TODO: Maybe use specific time?
    await knex('History')
      .insert({
        chefId: chef.id,
        date: new Date(),
        numberOfPersons: 1,
      })
      .transacting(trx);
  });
}

async function getChefWithLowestPoints() {
  const minPointsQuery = knex('Chef').min('points');
  const chefsWithLowestPoints = await knex('Chef')
    .select('*')
    .where('points', minPointsQuery);

  if (chefsWithLowestPoints.length === 0) {
    return undefined;
  }

  if (chefsWithLowestPoints.length === 1) {
    return chefsWithLowestPoints[0];
  }

  const chefIds = chefsWithLowestPoints.map((chef) => chef.id);
  const chefWhoHasntCookedForTheLongestTimeResult = await knex('History')
    .select('chefId', 'Chef.name', 'Chef.points')
    .max('date as lastCookedDate')
    .whereIn('chefId', chefIds)
    .groupBy('chefId')
    .join('Chef', 'History.chefId', '=', 'Chef.id')
    .orderBy('lastCookedDate', 'asc')
    .first();

  const chef: Chef = {
    id: chefWhoHasntCookedForTheLongestTimeResult.chefId,
    name: chefWhoHasntCookedForTheLongestTimeResult.name,
    points: chefWhoHasntCookedForTheLongestTimeResult.points,
  };

  return chef;
}
