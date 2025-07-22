import { DRINKS } from "./constants";
import { getDrinks, saveDrink } from "./db";
import { ConsumedDrink, DrinkName } from "./types";
import * as React from "react";
import { DbDate, dbDate } from "./utils/db_date";
import LocalStorage from "./db/local_storage";

const DRINK_NAMES: DrinkName[] = DRINKS.map(({ name }) => name);

function getDb() {
  return new LocalStorage();
}

function App() {
  const [name, setName] = React.useState<DrinkName>(DRINK_NAMES[0]!);
  const [volume, setVolume] = React.useState<number | "">("");
  const [drinks, setDrinks] = React.useState<ConsumedDrink[]>();
  const [date, setDate] = React.useState<string>("");
  const [numServings, setNumServings] = React.useState<number | "">(1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const db = getDb();

    if (name && volume && numServings && date) {
      await saveDrink(db, new Date(date), name, Number(volume * numServings));
      await fetchDrinks();
    }
  }

  async function fetchDrinks() {
    const db = new LocalStorage();
    const fetchedDrinks = await getDrinks(db, {
      order: {
        by: "date",
        direction: "desc", 
      }
    });

    setDrinks(fetchedDrinks);
  }

  React.useEffect(() => {
    if (!drinks) {
      fetchDrinks();
    }
  }, [drinks])

  const drinksByDate = drinks?.reduce((acc, curr) => {
    const dateString = dbDate(curr.date);

    acc[dateString] ||= 0;

    acc[dateString] += curr.units;

    return acc;
  }, {} as Record<DbDate, number>)

  return (
    <>
      <form id="form" onSubmit={handleSubmit}>
        <div id="drink-names-container">
          <label htmlFor="drink-name">Name</label>
          <select id="drink-name" value={name} onChange={(e) => { setName(e.target.value as DrinkName) }}>
            {DRINKS.map(({ name: drinkName }) => (
              <option value={drinkName} key={drinkName}>{drinkName}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="volume">Volume in ounces</label>
          <input
            type="number"
            name="volume"
            step="0.01"
            value={volume}
            onChange={(e) => {
              if (e.target.value) {
                setVolume(Number(e.target.value))
              } else {
                setVolume("");
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="num-servings">Servings</label>
          <input
            type="number"
            id="num-servings"
            name="num-servings"
            value={numServings}
            onChange={(e) => {
              if (e.target.value) {
                setNumServings(Number(e.target.value))
              } else {
                setNumServings("")
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => { setDate(e.target.value) }} />
        </div>
        <input type="submit" />
      </form>
      {
        drinks && drinksByDate && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Units</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(drinksByDate).map((date) => {
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{drinksByDate[date as DbDate]?.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      }
    </>
  );
}

export default App;
