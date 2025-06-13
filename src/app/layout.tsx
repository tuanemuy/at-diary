import { ThemeProvider } from "@/components/provider/ThemeProvider.tsx";
import type { Metadata } from "next";
import { publicUrl, siteName, description } from "@/config.ts";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: siteName,
  description,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  manifest: "/manifest.json",
  metadataBase: new URL(publicUrl),
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          // defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full min-h-dvh h-full bg-background">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
