import * as fs from "node:fs/promises";
import { PATH } from "../constants";
import { ConsumedDrink, DrinkName } from "../../types";
import { DbDate } from "../../utils/db_date";
import { Db, ParseCallback } from "../../db/db";
import { parse } from "csv";

class Csv implements Db {
  async saveDrink(drink: ConsumedDrink, date: DbDate) {
    try {
      await fs.access(PATH);
    } catch(e) {
      await fs.writeFile(PATH, "");
    }

    const record = `${date},${drink.drink.name},${drink.units}`;

    try {
      await fs.appendFile(
        PATH,
        `${record}\n`
      );
    } catch (e) {
      throw `Could not save drink ${record} ${e}`;
    }
  }

  async parse(callback: ParseCallback) {
    try { 
      await fs.access(PATH)
    } catch(e) {
      console.log("No data");

      return;
    }

    const csv = await fs.readFile(PATH);

    await new Promise<void>((resolve, reject) => {
      parse(csv, (e, records) => {
        if (e) {
          reject(e);

          return;
        }

        callback(records.map((line) => {
          const [date, drinkName, units] = line;

          return [
            date as DbDate,
            drinkName as DrinkName,
            Number(units),
          ];
        }));

        resolve();
      });
    });
  }
}

export default Csv;
