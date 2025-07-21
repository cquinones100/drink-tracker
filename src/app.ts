import { DRINKS } from "./constants";
import { getDrinks, reportToday, saveDrink } from "./db";
import SessionStorage from "./db/session_storage";
import { DrinkName } from "./types";

function addOptions(container: HTMLDivElement, name: string, options: string[]) {
  const existingElement = document.getElementById(name);

  if (existingElement) {
    existingElement.remove();
  }

  const optionInput = document.createElement("select");
  optionInput.name = name;
  optionInput.id = name;

  options.forEach((option) => {
    const el = document.createElement("option");
    el.value = option;
    el.innerHTML = option;

    optionInput.appendChild(el);
  });

  if (container) {
    container.appendChild(optionInput)
  }
}

function addNames() {
  const namesContainer = document.getElementById("drink-names-container");
  if (namesContainer) {
    addOptions(namesContainer as HTMLDivElement, "drink-name", DRINKS.map(({ name }) => name));
  }
}

function addOnSubmit() {
  const form = document.getElementById("form");
  
  form?.addEventListener("submit", handleSubmit);
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  
  const db = new SessionStorage();
  const date = new Date();
  const form = document.getElementById("form") as HTMLFormElement;

  if (!form) {
    throw "No form found";
  }
  
  const data = new FormData(form);
  const drinkName = data.get("drink-name") as DrinkName;
  const volume = data.get("volume");
  const type = data.get("type");
  
  await saveDrink(db, date, drinkName, Number(volume));
  await reportToday(db);
  await hydrate();
}

async function addDrinks() {
  const existingElement = document.getElementById("drinks");

  if (existingElement) {
    existingElement.remove();
  }

  const element = document.createElement("table");
  element.id = "drinks";
  const db = new SessionStorage();

  const allDrinks = await getDrinks(db, { order: { by: "date" }});
}

let hydrated = false;

async function hydrate() {
  addNames();
  await addDrinks();
  
  if (!hydrated) {
    addOnSubmit();
  }
}

document.addEventListener("DOMContentLoaded", hydrate);
