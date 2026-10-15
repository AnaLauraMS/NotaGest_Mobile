'use client';

import { ReactNode, useEffect } from "react";
import "./globals.css";
import { NotificationProvider } from "../context/NotificationContext";

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
    <html lang="en">
      <body className="antialiased">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
