import "../styles/globals.css";
import type { AppProps } from "next/app";

// download nextjs project
// npx create-next-app --example with-tailwindcss sanity-yt-build
// -> npm install -g @sanity/cli
// -> npm sanity init
// https://www.sanity.io/docs/getting-started-with-sanity-cli
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
