import * as React from "react";
import "./app.css";
import ServerContainer from "./containers/server_container";
import DrinkForm from "./components/drink_form";

function App() {
  return (
    <div className="flex flex-col items-center p-2 gap-2">
      <ServerContainer>
        <DrinkForm />
      </ServerContainer>
    </div>
  );
}

export default App;
