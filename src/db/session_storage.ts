import { ConsumedDrink, DrinkName } from "../types";
import { DbDate } from "../utils/db_date";
import { Db, ParseCallback } from "./db";

class SessionStorage implements Db {
  async saveDrink(drink: ConsumedDrink, date: DbDate) {
    const currentDrinks = this.getDrinks();
    const record = `${date},${drink.drink.name},${drink.units}`;

    currentDrinks.push(record);

    window.sessionStorage.setItem('drinks', JSON.stringify(currentDrinks));

    return Promise.resolve();
  }

  async parse(callback: ParseCallback) {
    const currentDrinks = this.getDrinks();

    callback(currentDrinks.map((line) => {
      const [date, drinkName, units] = line.split(',');

      return [
        date as DbDate,
        drinkName as DrinkName,
        Number(units),
      ];
    }));
  }

  async reset(): Promise<void> {
    window.sessionStorage.removeItem('drinks');
  }
  
  private getDrinks(): string[] {
    return JSON.parse(window.sessionStorage.getItem('drinks') || JSON.stringify([]));
  }
}

export default SessionStorage;
