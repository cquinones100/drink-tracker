import { Db, ParseCallback } from "../../shared/db";
import { ConsumedDrink, DrinkName } from "../../shared/types";
import { DbDate } from "../../shared/utils/db_date";

class LocalStorage implements Db {
  async saveDrink(drink: ConsumedDrink, date: DbDate) {
    const currentDrinks = this.getDrinks();
    const record = `${date},${drink.drink.name},${drink.units}`;

    currentDrinks.push(record);

    window.localStorage.setItem('drinks', JSON.stringify(currentDrinks));

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
    window.localStorage.removeItem('drinks');

    return Promise.resolve();
  }

  async getDrinkTypes() {
    return Promise.resolve([])
  }
  
  private getDrinks(): string[] {
    return JSON.parse(window.localStorage.getItem('drinks') || JSON.stringify([]));
  }
}

export default LocalStorage;
