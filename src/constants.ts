import { IDrink } from "./types";

export const DRINKS = [
  {
    name: "cats are people too",
    type: "beer",
    abv: 8.2,
  },
  {
    name: "sierra nevada hazy little thing",
    type: "beer",
    abv: 6.7,
  },
  {
    name: "stiel sour",
    type: "beer",
    abv: 5.2,
  },
  {
    name: "pinot noir",
    type: "wine",
    abv: 12,
  },
  {
    name: "voodoo ranger",
    type: "beer",
    abv: 7,
  },
  {
    name: "bell's two hearted IPA",
    type: "beer",
    abv: 7,
  },
  {
    name: "5 boros hazy IPA",
    type: "beer",
    abv: 6.5,
  }
] as const satisfies IDrink[];
