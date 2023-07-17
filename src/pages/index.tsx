import Head from "next/head";
import BoardList from "~/components/boards/BoardList";

export default function Home() {
  return (
    <>
      <Head>
        <title>forder</title>
        <meta name="description" content="productivity tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-[100vh] w-[100vw]">
        <BoardList />
      </main>
    </>
  );
}
