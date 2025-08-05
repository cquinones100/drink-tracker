import { ConsumedDrink, types } from "./types";
 
export type DbDrinkType = DbRow<{
  name: typeof types[number];
}>

export type DbDrink = DbRow<{
  name: string;
  abv: number;
  type_id: number;
}>

export type DbConsumedDrink = DbRow<{
  drink_id: DbDrink['id'];
  volume: number;
  date: string;
}>

type DbRow<T> = T & { id: number; }

type SaveDrinkProps = {
  volume: number;
  date: string;
  numServings: number;
} & ({
  name: string;
  isNew: boolean;
  abv: number;
} | {
  drink: DbDrink;
});

export interface Db {
  saveDrink(props: SaveDrinkProps): Promise<void>;

  getConsumedDrinks(): Promise<ConsumedDrink[]>;
  getDrinkTypes(): Promise<DbDrinkType[]>;
  getDrinks(): Promise<DbDrink[]>;
  getDrink(): Promise<DbDrink>;
}
