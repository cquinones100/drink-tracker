import { ConsumedDrink, Drink } from "../types";
import { calculateUnits } from "./calculate_units";

export function createConsumedDrink(drink: Drink, volume: number, units: number, date: Date): ConsumedDrink {
  return {
    drink,
    units: calculateUnits(drink, volume, units),
    date,
  }
}