import * as fs from "node:fs/promises";
import { ConsumedDrink, Drink, DrinkName, IDrink } from "./types";
import { parse } from "csv";
import path from "node:path";

const PATH = path.join("./", "db.csv");

export const DRINKS = [
  {
    name: "cats are people too",
    type: "beer",
    abv: 8.2,
  },
  {
    name: "sierra nevada hazy little thing",
    type: "beer",
    abv: 6.7,
  },
  {
    name: "stiel sour",
    type: "beer",
    abv: 5.2,
  },
  {
    name: "pinot noir",
    type: "wine",
    abv: 12,
  },
  {
    name: "voodoo ranger",
    type: "beer",
    abv: 7,
  },
  {
    name: "bell's two hearted IPA",
    type: "beer",
    abv: 7,
  },
  {
    name: "5 boros hazy IPA",
    type: "beer",
    abv: 6.5,
  }
] as const satisfies IDrink[];


function calculateUnits(drink: Drink, volume: number, units: number) {
  const { abv } = drink;

  const totalVolume = volume * units;

  return totalVolume * (abv / 100) / 0.6;
}

export function dbDate(date: Date) {
  function datePartString(number: number, { zeroIndexed = false }: { zeroIndexed?: boolean } = {}) {
    const datePart = zeroIndexed ? number + 1 : number;
  
    if (datePart < 10) {
      return `0${datePart}`;
    } else {
      return `${datePart}`;
    }
  }

  return `${datePartString(date.getMonth(), { zeroIndexed: true })}-${datePartString(date.getDate())}-${date.getFullYear()}`
}

export async function saveDrink(date: Date, name: DrinkName, volume: number, units = 1) {
  const drink = findDrink(name)
  const dbFile = PATH;

  try {
    await fs.access(dbFile)
  } catch(e) {
    await fs.writeFile(dbFile, "");
  }

  const consumedDrink: ConsumedDrink = {
    drink,
    units: calculateUnits(drink, volume, units),
  }

  await fs.appendFile(
    dbFile,
    `${dbDate(date)},${consumedDrink.drink.name},${consumedDrink.units}\n`
  )
}

export async function reportToday() {
  const dbFile = PATH;

  try { 
    await fs.access(dbFile)
  } catch(e) {
    console.log("No data");

    return;
  }

  const csv = await fs.readFile(dbFile);

  const todayRecords: ConsumedDrink[] = [];

  const today = dbDate(new Date());

  parse(csv, (e, records) => {
    if (e) {
      throw e;
    }

    records.forEach((line) => {
      const [date, drinkName, units] = line;

      if (date === today) {
        let drink: Drink;
  
        try {
          drink = findDrink(drinkName as DrinkName);
  
          todayRecords.push({
            drink,
            units: Number(units)
          });

        } catch (e) {
          `${drinkName} is not a valid drink name, please correct this entry in the database\n${line}`;
        }
      }
    });

    console.log(`Total units consumed today: ${todayRecords.reduce((acc, { units }) => acc + units, 0).toFixed(2)}`);
  });
}

function findDrink(name: DrinkName) {
  const drink = DRINKS.find(({ name: currName }) => currName === name);

  if (!drink) {
    throw "Drink not found"
  }

  return drink;
}
