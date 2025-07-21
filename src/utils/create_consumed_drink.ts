import { Drink } from "../types";
import { calculateUnits } from "./calculate_units";

export function createConsumedDrink(drink: Drink, volume: number, units: number) {
  return {
    drink,
    units: calculateUnits(drink, volume, units),
  }
}