import { Db, DbDrink, DbDrinkType } from "../../shared/db";
import { ConsumedDrink } from "../../shared/types";

export class NotAuthenticatedError extends Error {
  constructor(url: string | URL | Request) {
    super(url as string);
  }
}

export class ServerError extends Error {
  constructor(url: string | URL | Request) {
    super(url as string);
  }
}

export class NotFoundError extends Error {
  constructor(url: string | URL | Request) {
    super(url as string);
  }
}

const URL = "/api";

class Api implements Db {
  async saveDrink(props: {
    name: string,
    volume: number,
    date: string,
    numServings: number,
    isNew: boolean,
    abv: number,
  }): Promise<void> {
    const { name, volume, numServings, date, isNew, abv } = props;
  
    const res = await this.fetch(`${URL}/submit`, {
      method: "POST",
      body: JSON.stringify({
        name,
        volume,
        numServings,
        date,
        isNew,
        abv,
      }),
      headers: {
        "content-type": "application/json"
      },
    });
  
    if (!res.ok) {
      const body = await res.json();
  
      throw `Unable to save drink ${body}`;
    }
  }

  async getConsumedDrinks() {
    const res = await this.fetch(`${URL}/consumed_drinks`);

    if (!res.ok) {
      const body = await res.json();

      throw `Unable to save drink ${body}`;
    }

    const consumedDrinks = await res.json() as (Omit<ConsumedDrink, 'date'> & { date: string })[];

    return consumedDrinks.map(({date, ...drink}) => ({
      ...drink,
      date,
    }));
  }

  async getDrinkTypes(): Promise<DbDrinkType[]> {
    throw "Not implemented";
  };

  async getDrinks(): Promise<DbDrink[]> {
    const res = await this.fetch(`${URL}/drinks`);

    if (!res.ok) {
      const body = await res.json();

      throw 'Unable to get drinks';
    }

    return await res.json() as DbDrink[];
  };

  async getDrink(): Promise<DbDrink> {
    throw "Not implemented";
  };

  async login(password: string): Promise<boolean> {
    const res = await this.fetch(`${URL}/login`, {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
      headers: {
        "content-type": "application/json"
      },
    });

    return res.ok;
  }

  async isLoggedIn(): Promise<boolean> {
    const res = await this.fetch(`${URL}/session`);

    return res.ok;
  }

  private async fetch(...props: Parameters<typeof fetch>): Promise<ReturnType<typeof fetch>> {
    const [url, ...rest] = props;

    const res = await fetch(url, ...rest);

    switch (res.status) {
      case 401:
        throw new NotAuthenticatedError(url)
      case 404:
        throw new NotFoundError(url)
      case 500:
        case 502:
        throw new ServerError(url)
      default:
        return res;
    }
  }
}

export default Api;
