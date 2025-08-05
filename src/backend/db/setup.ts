import { DRINKS } from "../../shared/constants";
import { DbDrinkType } from "../../shared/db";
import { IDrink } from "../../shared/types";
import Sqlite, { DATABASE_FILE } from "./sqlite";
import fs from "fs";

async function main() {
  try {
    fs.unlinkSync(DATABASE_FILE);
    console.log("Database file deleted.");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("Database file does not exist.");
    } else {
      throw err;
    }
  }

  const db = new Sqlite();

  db.serialize(async () => {
    db.run(`CREATE TABLE IF NOT EXISTS drink_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);
  
    db.run(`INSERT OR IGNORE INTO drink_types (name) VALUES ('beer');`);
    db.run(`INSERT OR IGNORE INTO drink_types (name) VALUES ('wine');`);
    db.run(`INSERT OR IGNORE INTO drink_types (name) VALUES ('liquor');`);
  
    db.run(`CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      abv FLOAT NOT NULL,
      type_id INTEGER,
      FOREIGN KEY(type_id) REFERENCES drink_types(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS consumed_drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drink_id INTEGER NOT NULL,
      volume FLOAT,
      date INTEGER NOT NULL,
      FOREIGN KEY(drink_id) REFERENCES drinks(id)
    )`);
  
    const types = await db.read<DbDrinkType>('SELECT * FROM drink_types;');

    console.log("inserted:", types);
    
    DRINKS.forEach((drink) => {
      const typeId = types.find((type) => type.name === drink.type)?.id;

      if (typeId) {
        db.prepareAndRun(
          `INSERT OR IGNORE INTO drinks (name, abv, type_id) VALUES (?,?,?);`,
          [drink.name, drink.abv, typeId]
        );
      }
    });

    const drinks = await db.read<IDrink>('SELECT * FROM drinks;')
  
    console.log("inserted:", drinks);
  });
}

main();
