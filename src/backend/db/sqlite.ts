import sqlite3 from "sqlite3";
import { Db, DbConsumedDrink, DbDrink, DbDrinkType } from "../../shared/db";
import { calculateUnits } from "../../shared/utils/calculate_units";
import { Drink } from "../../shared/types";

export const DATABASE_FILE = 'database.db';

class Sqlite implements Db {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DATABASE_FILE);
  }

  async saveDrink({
    drink,
    volume,
    date,
    numServings
  }: {
    drink: DbDrink,
    volume: number,
    date: string,
    numServings: number
  }): Promise<void> {
    const { id: drinkId } = drink;

    for (let i = 0; i < numServings; i++) {
      const statement = this.db.prepare(`INSERT INTO consumed_drinks (drink_id, volume, date) VALUES (?,?,?)`);

      statement.run(drinkId, volume, date);
    }
  }

  async getConsumedDrinks() {
    const consumedDrinks = await this.read<DbConsumedDrink & DbDrink & { drink_type_name: DbDrinkType['name'] }>(`
      SELECT consumed_drinks.id, drink_id, volume, date, drinks.name, abv, drink_types.name as drink_type_name
      FROM consumed_drinks
      JOIN drinks on consumed_drinks.drink_id = drinks.id
      JOIN drink_types on drinks.type_id = drink_types.id 
      ORDER BY date DESC;
    `);

    return consumedDrinks.map((consumedDrink) => {
      const drink = {
        name: consumedDrink.name,
        abv: consumedDrink.abv,
        type: consumedDrink.drink_type_name
      }

      return {
        drink,
        units: calculateUnits(drink, consumedDrink.volume),
        date: new Date(consumedDrink.date),
      }
    });
  }

  async getDrinkTypes() {
    return await this.read<DbDrinkType>('SELECT * FROM drink_types');
  }

  async getDrinks() {
    return await this.read<DbDrink>('SELECT * FROM drinks');
  }

  async getDrink(filter?: { name: string }): Promise<DbDrink> {
    let statement: sqlite3.Statement;

    if (filter) {
      const rawStatement = 'SELECT * FROM drinks where name = ?;';
      const values = [filter.name];

      const statementString = `${rawStatement}, ${values}`;
      this.print(statementString);

      statement = this.db.prepare('SELECT * FROM drinks where name = ?;');
      statement.run(...values);
    } else {
      statement = this.db.prepare('SELECT * FROM drinks;');
    }

    return new Promise<DbDrink>((resolve, reject) => {
      statement.all<DbDrink>((err, rows) => {
        if (rows[0]) {
          resolve(rows[0]);
        } else {
          reject(new Error('Drink not found'));
        }
      });
    });
  }

  async createDrink(props: Drink): Promise<DbDrink> {
    const { name, abv, type } = props;
    const drinkTypes = await this.getDrinkTypes();
    const type_id = drinkTypes.find((drinkType) => type === drinkType.name)?.id;

    if (!type_id) {
      throw "No type found";
    }

    const rawStatement = 'INSERT INTO drinks (name, abv, type_id) VALUES (?,?,?) RETURNING *';
    const values = [name, abv, type_id]

    const statementString = `${rawStatement}, ${values}`;
    this.print(statementString);

    const statement = this.db.prepare(rawStatement);

    return new Promise<DbDrink>((resolve) => {
      statement.get(...values, (err: any, drink: DbDrink) => {
        resolve(drink);
      });
    })
  }

  async serialize(cb: () => Promise<void>) {
    this.db.serialize(cb);
  };

  run(statement: string) {
    this.print(statement);

    this.db.run(statement);
  }

  read<T>(statement: string): Promise<T[]> {
    this.print(statement);

    return new Promise<T[]>((resolve) => {
      this.db.all(statement, (err: Error, rows: T[]) => {
        if (err) {
          throw err;
        }

        resolve(rows);
      });
    });
  }

  prepareAndRun(rawStatement: string, values: (string | number)[]) {
    const statementString = `${rawStatement}, ${values}`;
    this.print(statementString);

    const statement = this.db.prepare(rawStatement);
    statement.run(...values);
    statement.finalize();
  }

  private print(statement: string) {
    const date = new Date();

    console.log(`sqlite: ${date.toISOString()} -- ${statement}`);
  }
}

export default Sqlite;
