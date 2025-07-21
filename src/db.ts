import * as fs from "node:fs/promises";
import { ConsumedDrink, Drink, DrinkName } from "./types";
import { parse } from "csv";
import { DRINKS } from "./constants";
import { createConsumedDrink } from "./utils/create_consumed_drink";
import { dbDate } from "./utils/db_date";

export async function saveDrink(date: Date, name: DrinkName, volume: number, units = 1) {
  const drink = findDrink(name)

  try {
    await fs.access(PATH)
  } catch(e) {
    await fs.writeFile(PATH, "");
  }

  const consumedDrink = createConsumedDrink(drink, volume, units);

  await fs.appendFile(
    PATH,
    `${dbDate(date)},${consumedDrink.drink.name},${consumedDrink.units}\n`
  )
}

export async function reportToday() {
  try { 
    await fs.access(PATH)
  } catch(e) {
    console.log("No data");

    return;
  }

  const csv = await fs.readFile(PATH);

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
