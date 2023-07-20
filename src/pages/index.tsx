import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useState, type FormEvent } from "react";
import BoardList from "~/components/boards/BoardList";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>inveniam</title>
        <meta name="description" content="Kanban productivity tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-[100vh] w-[100vw]">
        {sessionData ? <SignedInView /> : <NotSignedInView />}
      </main>
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
  const [result, setResult] = useState("");

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      setResult(result.error);
    }
  };
  return (
    <div className="mx-auto flex h-screen w-[350px] flex-col items-center pt-8">
      <div className="mb-8 flex items-center justify-center">
        <h2>inveniam</h2>
        {/* <FaHourglassStart className="h-24 w-24" /> */}
      </div>

      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-white/40 px-8 py-4">
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
          {result && (
            <p className="my-2 bg-danger/30 px-4 py-2 text-center font-bold text-danger">
              {result}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
