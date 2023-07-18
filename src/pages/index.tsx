import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import BoardList from "~/components/boards/BoardList";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>forder</title>
        <meta name="description" content="productivity tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-[100vh] w-[100vw]">
        {sessionData ? <SignedInView /> : <NotSignedInView />}
      </main>
    </>
  );
}

const SignedInView = () => {
  return <BoardList />;
};

const NotSignedInView = () => {
  return (
    <div className="flex h-screen flex-col items-center pt-8">
      <div className="mb-8 flex items-center justify-center">
        <h2>inveniam</h2>
        {/* <FaHourglassStart className="h-24 w-24" /> */}
      </div>

      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-white/40 px-8 py-4">
        <h3 className="mb-2">Please sign in</h3>

        <button
          type="button"
          onClick={() => void signIn("github")}
          className="flex w-full items-center gap-4 rounded border-gray-300 bg-white p-3 font-medium text-black"
        >
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
          onClick={() =>
            void signIn("google", { callbackUrl: "http://localhost:3000" })
          }
          className="flex w-full items-center gap-4 rounded border-gray-300 bg-white p-3 font-medium text-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="images/google_G.png"
            alt="Google logo"
            className="h-8 w-8"
          />
          Sign in with google
        </button>
      </div>
    </div>
  );
};
