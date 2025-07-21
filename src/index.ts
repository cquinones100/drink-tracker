import { reportToday, saveDrink } from "./db";
import Csv from "./db/csv";
import { DrinkName } from "./types";

function args(): [DrinkName, number, number | undefined, Date] {
  const [_executablePath, _filePath, drinkName, volume, units, date]  = process.argv

  if (!drinkName) {
    throw "No drink name provided";
  }

  return [drinkName as DrinkName, Number(volume), units ? Number(units) : undefined, date ? new Date(date) : new Date()];
}

async function main() {
  const [drinkName, volume, units, date] = args();

  const db = new Csv();
  
  await saveDrink(db, date, drinkName, volume, units);
  
  await reportToday(db);
}

main();
