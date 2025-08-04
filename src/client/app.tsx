import { DRINKS } from "./../shared/constants";
import { getDrinks, saveDrink, reset } from "../shared/db";
import { ConsumedDrink, DrinkName } from "../shared/types";
import * as React from "react";
import { DbDate, dbDate } from "../shared/utils/db_date";
import LocalStorage from "./db/local_storage";
import "./app.css";

const DRINK_NAMES: DrinkName[] = DRINKS.map(({ name }) => name);

function getDb() {
  return new LocalStorage();
}

function InputContainer({ label, input }: { label: React.ReactNode, input: React.ReactNode }) {
  return (
    <div className="flex justify-between w-full">
      <div className="flex-1/4">{label}</div>
      <div className="flex-3/4 *:w-full *:px-2">{input}</div>
    </div>
  );
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

  async function handleReset() {
    const db = new LocalStorage();
    await reset(db);
    await fetchDrinks();
  }

  const drinksByDate = drinks?.reduce((acc, curr) => {
    const dateString = dbDate(curr.date);

    acc[dateString] ||= 0;

    acc[dateString] += curr.units;

    return acc;
  }, {} as Record<DbDate, number>)

  return (
    <div className="flex flex-col items-center p-2 gap-2">
      <form id="form" onSubmit={handleSubmit} className="flex flex-col justify-start items-center max-w-5xl w-full gap-2">
        <button className="px-2 cursor-pointer outline border-1" onClick={handleReset}>Reset Database</button>
        <InputContainer
          label={<label htmlFor="drink-name">Name</label>}
          input={
            <select id="drink-name" value={name} onChange={(e) => { setName(e.target.value as DrinkName) }}>
              {DRINKS.map(({ name: drinkName }) => (
                <option value={drinkName} key={drinkName}>{drinkName}</option>
              ))}
            </select>
          }
        >
        </InputContainer>
        <InputContainer
          label={
            <label htmlFor="volume">Volume</label>
          }
          input={
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
          }
        >
        </InputContainer>
        <InputContainer
          label={
            <label htmlFor="num-servings">Servings</label>
          }
          input={
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
          }
        >
        </InputContainer>
        <InputContainer
          label={
            <label htmlFor="date">Date</label>
          }
          input={
            <input id="date" type="date" value={date} onChange={(e) => { setDate(e.target.value) }} />
          }
        >
        </InputContainer>
        <input type="submit" className="px-2 cursor-pointer" />
      </form>
      {
        drinks && drinksByDate && (
          <table className="w-full text-left p-2">
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
    </div>
  );
}

export default App;
