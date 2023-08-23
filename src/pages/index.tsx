import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useState, type FormEvent, useEffect } from "react";
import BoardList from "~/components/boards/BoardList";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>inveniam</title>
        <meta name="description" content="Kanban productivity tool" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>

      {sessionData ? <SignedInView /> : <NotSignedInView />}
    </>
  );
}

const SignedInView = () => {
  // TODO: this can move to /boards view once we create a landing page or redirect from / to /boards
  return <BoardList />;
};

const NotSignedInView = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
    }
  };

  //resets error so that any errors we've received are cleared to give indication
  // to end user that their efforts to rectify the issue are being considered
  useEffect(() => {
    setError("");
  }, [username, password]);

  return (
    <div className="flex w-full justify-center pt-12">
      <div className="flex w-[380px] flex-col items-center gap-2">
        <h3 className="mb-2">Please sign in</h3>

        <button
          type="button"
          onClick={() => void signIn("github")}
          className="border-gray-300 flex w-full items-center gap-4 rounded bg-white p-3 font-medium text-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="images/github-mark.png"
            alt="Google logo"
            className="h-8 w-8"
          />
          Sign in with GitHub
        </button>

        <button
          type="button"
          onClick={() => void signIn("google")}
          className="border-gray-300 flex w-full items-center gap-4 rounded bg-white p-3 font-medium text-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="images/google_G.png"
            alt="Google logo"
            className="h-8 w-8"
          />
          Sign in with google
        </button>
        <h4>or</h4>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSignIn}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit" className="w-full rounded bg-primary px-4 py-2">
            Sign in
          </button>
          {error && (
            <p className="my-2 bg-danger/30 px-4 py-2 text-center font-bold text-danger">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
