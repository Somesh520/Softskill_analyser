"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider 
      themes={['light', 'dark', 'theme-forest', 'theme-rose']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
