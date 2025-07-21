import { DRINKS } from "./db";

export type IDrink = {
  name: string;
  type: "beer" | "wine" | "liquor";
  abv: number; 
}

export type Drink = typeof DRINKS[number];
export type DrinkName = Drink["name"];

export type ConsumedDrink = {
  drink: Drink;
  units: number;
}
