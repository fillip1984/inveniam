import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";
import Nav from "~/components/nav/Nav";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Nav />
      <main className="mt-16 min-h-screen bg-black pb-48 text-white">
        <Component {...pageProps} />
      </main>
      <Toaster />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
