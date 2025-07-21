import { DRINKS, reportToday, saveDrink } from "./db";

export type IDrink = {
  name: string;
  type: "beer" | "wine" | "liquor";
  abv: number; 
}

export type Drink = typeof DRINKS[number];
export type DrinkName = Drink["name"];

export type ConsumedDrink = {
  drink: Drink;
  units: number;
}

function args(): [DrinkName, number, number | undefined, Date] {
  const [_executablePath, _filePath, drinkName, volume, units, date]  = process.argv

  if (!drinkName) {
    throw "No drink name provided";
  }

  return [drinkName as DrinkName, Number(volume), units ? Number(units) : undefined, date ? new Date(date) : new Date()];
}

async function main() {
  const [drinkName, volume, units, date] = args();
  
  await saveDrink(date, drinkName, volume, units);
  
  await reportToday();
}

main();
