'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/store/Provider';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

// This component reads the theme from Redux and applies it to the <html> tag
function ThemeManager({ children }: { children: React.ReactNode }) {
    const theme = useSelector((state: RootState) => state.table.theme);

    // Use an Effect to safely interact with the `document` object in the browser
    useEffect(() => {
        if (document.documentElement.className !== theme) {
            document.documentElement.className = theme;
        }
    }, [theme]);

    return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The layout MUST return the <html> and <body> tags at the top level
    <html lang="en">
      <head>
          <title>Dynamic Data Table</title>
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}>
        {/* The Provider goes inside the body */}
        <ReduxProvider>
          <ThemeManager>
            {children}
          </ThemeManager>
        </ReduxProvider>
      </body>
    </html>
  );
}