import React from "react";
import { DrinkName, ConsumedDrink } from "../../shared/types";
import { ServerContext } from "../containers/server_container";
import { getDb } from "../db/get_db";
import InputContainer from "../library/input_container";
import { dbDate } from "../../shared/utils/db_date";

function DrinkForm() {
  const [drinkNames, setDrinkNames] = React.useState<DrinkName[]>();
  const [name, setName] = React.useState<DrinkName>("");
  const [volume, setVolume] = React.useState<number | "">("");
  const [drinks, setDrinks] = React.useState<ConsumedDrink[]>();
  const [date, setDate] = React.useState<string>(dbDate(new Date()));
  const [numServings, setNumServings] = React.useState<number | "">(1);

  const [newName, setNewName] = React.useState<string>("");
  const [abv, setAbv] = React.useState<number | "">("");

  const { serverRequest } = React.useContext(ServerContext);

  const isNewDrink = name === "new";

  console.log(date);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const db = getDb();

    if (name && volume && numServings && date) {
      await serverRequest(async () => {
        await db.saveDrink({
          name,
          volume,
          numServings,
          date: date,
          isNew: isNewDrink, 
          abv: abv || 0,
        })
      });

      await fetchConsumedDrinks();
    }
  }

  async function fetchConsumedDrinks() {
    const db = getDb();

    await serverRequest(async () => {
      const fetchedDrinks = await db.getConsumedDrinks()
      setDrinks(fetchedDrinks);
    });
  }

  React.useEffect(() => {
    if (!drinks) {
      fetchConsumedDrinks();
    }
  }, [drinks])

  async function fetchDrinks() {
    const db = getDb();

    await serverRequest(async () => {
      const drinks = await db.getDrinks();

      setDrinkNames(drinks.map((drink) => drink.name));
      setName(drinks[0]!.name);
    });
  }

  React.useEffect(() => {
    if (!drinkNames) {
      fetchDrinks();
    }
  }, [drinkNames])

  const drinksByDate = drinks?.reduce((acc, curr) => {
    const dateString = curr.date.split("T")[0]!;

    acc[dateString] ||= 0;

    acc[dateString] += curr.units;

    return acc;
  }, {} as Record<string, number>)

  return (
    <>
      <form id="form" onSubmit={handleSubmit} className="flex flex-col justify-start items-center max-w-5xl w-full gap-2">
        <InputContainer
          label={<label htmlFor="drink-name">{!isNewDrink && "Name"}</label>}
          input={
            <select id="drink-name" value={name} onChange={(e) => { setName(e.target.value as DrinkName) }}>
              {drinkNames?.map((name) => (
                <option value={name} key={name}>{name}</option>
              ))}
              <option value="new">New</option>
            </select>
          }
        >
        </InputContainer>
        {
          isNewDrink && (
            <>
              <InputContainer
                label={
                  <label htmlFor="new-name">Name</label>
                }
                input={
                  <input
                    type="text"
                    name="new-name"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value)
                    }}
                  />
                }
              />
              <InputContainer
                label={
                  <label htmlFor="abv">Abv</label>
                }
                input={
                  <input
                    type="number"
                    name="abv"
                    step="0.01"
                    value={abv}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAbv(Number(e.target.value))
                      } else {
                        setAbv("");
                      }
                    }}
                  />
                }
              />
            </>
          )
        }
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
      </form >
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
                    <td>{drinksByDate[date]?.toFixed(2)}</td>
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

export default DrinkForm;
