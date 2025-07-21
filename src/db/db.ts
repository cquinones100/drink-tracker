import { ConsumedDrink, DrinkName } from "../types";
import { DbDate } from "../utils/db_date";

type Row = [DbDate, DrinkName, number];

export type ParseCallback = (records: Row[]) => void;
 
export interface Db {
  saveDrink: (drink: ConsumedDrink, date: DbDate) => Promise<void>;
  parse(callback: ParseCallback): Promise<void>;
}
