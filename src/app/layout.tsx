import type { Metadata } from "next";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "GREATER TOMORROW SCHOOLS",
  description: "Train up a child in the way he should grow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SplashScreen />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
