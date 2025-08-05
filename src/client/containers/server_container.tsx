import React from "react";
import LoginForm from "../components/login_form";
import { NotAuthenticatedError, NotFoundError } from "../db/api";
import { getDb } from "../db/get_db";

type ContextType = {
  serverRequest: (callback: () => Promise<void>) => Promise<void>
}

export const ServerContext = React.createContext<ContextType>({
  serverRequest: (() => { }) as unknown as ContextType['serverRequest'],
});

function ServerContainer({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = React.useState<boolean>(false);
  const [notFoundError, setNotFoundError] = React.useState<Error>();
  const [unexpectedError, setUnexpectedError] = React.useState<Error>();
  const [loading, setLoading] = React.useState(true);

  async function serverRequest<T>(callback: () => Promise<T>) {
    try {
      await callback();
    } catch (e) {
      if (e instanceof NotAuthenticatedError) {
        setAuthenticated(false);
      } else if (e instanceof NotFoundError) {
        setNotFoundError(e);
      } else {
        setUnexpectedError(e as Error);
      }

      return;
    }

    setAuthenticated(true);
  }
  
  async function checkLoggedIn() {
    const db = getDb();

    await serverRequest(async () => {
      await db.isLoggedIn();
    });

    setLoading(false);
  }

  React.useEffect(() => {
    if (loading) {
      checkLoggedIn();
    }
  }, [loading]);


  function handleLoginSuccess() {
    setAuthenticated(true);
  }

  if (loading) {
    return null;
  }

  if (unexpectedError) {
    return "Server error"
  }

  if (notFoundError) {
    return "404 Not found";
  }

  return (
    <ServerContext.Provider value={{ serverRequest }}>
      {
        !authenticated ? (
          <LoginForm onSuccess={handleLoginSuccess} />
        ) : (
          children
        )
      }
    </ServerContext.Provider>
  );
}

export default ServerContainer;
