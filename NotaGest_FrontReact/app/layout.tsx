'use client';

import { ReactNode, useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// importa o NotificationProvider
import { NotificationProvider } from "../context/NotificationContext";

// fonte personalizada
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface RootLayoutProps {
  children: ReactNode;
}

// 👇 Declara o tipo global para o Microsoft Clarity
declare global {
  interface Window {
    clarity: (...args: any[]) => void;
  }
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Script oficial do Microsoft Clarity
      (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = true;
        t.src = "https://www.clarity.ms/tag/u4hg5mgllf"; 
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", "u4hg5mgllf");
    }
  }, []);

  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-jakarta antialiased">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
