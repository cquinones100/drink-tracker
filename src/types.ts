import { DRINKS } from "./constants";

export const types = ["beer", "wine", "liquor"] as const;

export type IDrink = {
  name: string;
  type: typeof types[number];
  abv: number; 
}

export type Drink = typeof DRINKS[number];
export type DrinkName = Drink["name"];

export type ConsumedDrink = {
  drink: Drink;
  units: number;
  date: Date;
}
