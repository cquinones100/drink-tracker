import { Drink } from "../types";

export function calculateUnits(drink: Drink, volume: number, units: number) {
  const { abv } = drink;

  const totalVolume = volume * units;

  return totalVolume * (abv / 100) / 0.6;
}
