import { createRoot } from "react-dom/client";
import * as React from "react";
import App from "./app";

document.body.innerHTML = '<div id="app"></div>';

const root = createRoot(document.getElementById('app')!);
root.render(<App />);