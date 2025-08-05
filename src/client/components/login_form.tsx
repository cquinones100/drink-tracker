import React from "react";
import { getDb } from "../db/get_db";
import InputContainer from "../library/input_container";
import { ServerContext } from "../containers/server_container";

function LoginForm({ onSuccess }: { onSuccess: () => void; }) {
  const [password, setPassword] = React.useState<string>("");
  const { serverRequest } = React.useContext(ServerContext);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const db = getDb();

    await serverRequest(async () => {
      if (await db.login(password)) {
        onSuccess();
      }
    })
  }

  return (
    <form id="login" onSubmit={handleLogin} className="flex flex-col justify-start items-center max-w-5xl w-full gap-2">
      <InputContainer
        label={
          <label htmlFor="password">Password</label>
        }
        input={
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              if (e.target.value) {
                setPassword(e.target.value);
              } else {
                setPassword("");
              }
            }}
          />
        }
      />
      <input type="submit" className="px-2 cursor-pointer" />
    </form>
  );
}

export default LoginForm;