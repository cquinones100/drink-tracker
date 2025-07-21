import { ConsumedDrink, Drink, DrinkName } from "./types";
import { DRINKS } from "./constants";
import { createConsumedDrink } from "./utils/create_consumed_drink";
import { dbDate } from "./utils/db_date";
import { Db } from "./db/db";

export async function saveDrink(db: Db, date: Date, name: DrinkName, volume: number, units = 1) {
  const drink = findDrink(name)

  const consumedDrink = createConsumedDrink(drink, volume, units);

  db.saveDrink(consumedDrink, dbDate(date));
}

export async function reportToday(db: Db) {
  const todayRecords: ConsumedDrink[] = [];

  const today = dbDate(new Date());

  db.parse((records) => {
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
