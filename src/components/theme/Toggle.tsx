"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button.tsx";
import { MoonStar, Sun, SunMoon } from "lucide-react";

type Theme = "system" | "light" | "dark";

const icons = {
  light: <Sun className="size-5" />,
  dark: <MoonStar />,
  system: <SunMoon className="size-5" />,
};

export function Toggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isDarkPrefferred, setIsDarkPreferred] = useState<boolean | null>(null);

  useEffect(() => {
    const t = localStorage.theme || "system";
    setTheme(t);
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkPreferred(dark);
    document.documentElement.classList.toggle(
      "dark",
      t === "dark" || (t === "system" && dark),
    );
  }, []);

  if (theme !== null && isDarkPrefferred !== null) {
    return (
      <Button
        onClick={() => {
          let next: Theme = "system";
          switch (theme) {
            case "system":
              next = "light";
              break;
            case "light":
              next = "dark";
              break;
            case "dark":
              next = "system";
              break;
          }
          setTheme(next);
          localStorage.theme = next;
          document.documentElement.classList.toggle("dark", isDark(next));
        }}
        variant="secondary"
        size="icon"
        className="cursor-pointer"
      >
        {icons[theme]}
      </Button>
    );
  }
}

function isDark(theme: Theme) {
  return (
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  );
}
