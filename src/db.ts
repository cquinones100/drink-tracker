import { ConsumedDrink, DrinkName } from "./types";
import { DRINKS } from "./constants";
import { createConsumedDrink } from "./utils/create_consumed_drink";
import { dbDate } from "./utils/db_date";
import { Db, Row } from "./db/db";

function mapConsumedDrink(record: Row): ConsumedDrink {
  const [dateFromDb, drinkName, dbUnits] = record;
  
  const drink = findDrink(drinkName);
  const date = new Date(dateFromDb);
  const units = Number(dbUnits);

  return {
    drink,
    date,
    units
  };
}

type OrderOptions = {
  by: "name" | "date";
  direction?: "asc" | "desc";
}

type Options = {
  filters?: {
    name?: DrinkName;
    date?: Date;
  },
  order?: OrderOptions;
}

export async function getDrinks(db: Db, options: Options = {}): Promise<ConsumedDrink[]> { 
  const { filters, order } = options;
  const { name, date } = filters || {};
  
  const drinks: ConsumedDrink[] = [];

  await db.parse((records) => {
    for (const record of records) {
      const drink = mapConsumedDrink(record);
  
      if (name && drink.drink.name.toLowerCase() !== name.toLowerCase()) {
        continue;
      }
      
      if (date && dbDate(drink.date) !== dbDate(date)) {
        continue;
      }
  
      drinks.push(drink);
    }
  });

  if (order) {
    return drinks.sort((a, b) => {
      const { by } = order;
      let propA;
      let propB;

      switch (by) {
        case "date":
          propA = a.date;
          propB = b.date;
          break;
        case "name":
          propA = a.drink.name;
          propB = b.drink.name;
      }

      if (propA < propB) {
        return -1;
      }

      if (propB < propA) {
        return 1;
      }

      return 0;
    });
  } else {
    return drinks;
  }
}

export async function saveDrink(db: Db, date: Date, name: DrinkName, volume: number, units = 1) {
  const drink = findDrink(name)

  const consumedDrink = createConsumedDrink(drink, volume, units, date);

  db.saveDrink(consumedDrink, dbDate(date));
}

function findDrink(name: DrinkName) {
  const drink = DRINKS.find(({ name: currName }) => currName === name);

  if (!drink) {
    throw "Drink not found"
  }

  return drink;
}

export async function reset(db: Db) {
  await db.reset();
}
