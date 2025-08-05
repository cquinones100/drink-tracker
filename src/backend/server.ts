import express, { NextFunction, Request, Response } from "express";
import Sqlite from "./db/sqlite";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { Drink } from "../shared/types";

dotenv.config();

declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
  }
}

const app = express();
const port = process.env.BACKEND_PORT;

function authentication(req: Request, res: Response, next: NextFunction) {
  if (req.originalUrl === "/login" || req.session.authenticated) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.use(express.json());
app.use(cors({
  origin: process.env.VITE_ORIGIN,
}));
app.use(session({
  secret: "secret",
  cookie: {},
}));
app.use(authentication);

app.get("/session", (req, res) => {
  if (req.session.authenticated) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post('/login', async (req: Request<{}, {}, { password: string }>, res: Response) => {
  const password = req.body.password;

  if (password === process.env.PASSWORD) {
    req.session.authenticated = true;

    res.sendStatus(200);
  } else {
    req.session.authenticated = false;
    res.sendStatus(401);
  }
});

app.get('/', async (req, res) => {
  const db = new Sqlite();
  const drinkTypes = await db.getDrinkTypes();
  const drinks = await db.getDrinks();

  res.json({
    drinkTypes,
    drinks
  });
});

app.get('/consumed_drinks', async (_req, res) => {
  const db = new Sqlite();

  const consumedDrinks = await db.getConsumedDrinks();

  res.json(consumedDrinks);
});

app.get('/drinks', async (_req, res) => {
  const db = new Sqlite();

  res.json(await db.getDrinks());
});

type SubmitBody = {
  name: string;
  volume: number;
  numServings: number;
  date: string;
  isNew?: boolean;
  abv: number;
  type: Drink['type'];
}

app.post('/submit', async (req: Request<{}, {}, SubmitBody>, res: Response) => {
  const { name, volume, numServings, date, isNew, abv, type } = req.body;
  const db = new Sqlite();

  const drink = isNew ? await db.createDrink({ name, abv, type }) : await db.getDrink({ name });

  await db.saveDrink({
    drink,
    volume,
    date,
    numServings
  })

  res.sendStatus(201);
});

app.listen(port, () => {
  console.log(`Running app on ${port}`);
});
