
// src/contexts/site-customization-context.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";
import { siteConfig } from "@/config/site";

interface SiteCustomizationContextType {
  siteTitle: string;
  setSiteTitleState: (title: string) => void;
  
  bgHue: string;
  setBgHueState: (h: string) => void;
  bgSaturation: string;
  setBgSaturationState: (s: string) => void;
  bgLightness: string;
  setBgLightnessState: (l: string) => void;
  
  cardHue: string;
  setCardHueState: (h: string) => void;
  cardSaturation: string;
  setCardSaturationState: (s: string) => void;
  cardLightness: string;
  setCardLightnessState: (l: string) => void;

  primaryHue: string;
  setPrimaryHueState: (h: string) => void;
  primarySaturation: string;
  setPrimarySaturationState: (s: string) => void;
  primaryLightness: string;
  setPrimaryLightnessState: (l: string) => void;

  primaryFgHue: string;
  setPrimaryFgHueState: (h: string) => void;
  primaryFgSaturation: string;
  setPrimaryFgSaturationState: (s: string) => void;
  primaryFgLightness: string;
  setPrimaryFgLightnessState: (l: string) => void;
  
  applyCustomization: () => void;
}

const SiteCustomizationContext = createContext<SiteCustomizationContextType | undefined>(undefined);

export function useSiteCustomization() {
  const context = useContext(SiteCustomizationContext);
  if (!context) {
    throw new Error("useSiteCustomization must be used within a SiteCustomizationProvider");
  }
  return context;
}

// Default HSL values from globals.css
const DEFAULT_BG_HUE = "45";
const DEFAULT_BG_SATURATION = "25";
const DEFAULT_BG_LIGHTNESS = "96";

const DEFAULT_CARD_HUE = "45";
const DEFAULT_CARD_SATURATION = "25";
const DEFAULT_CARD_LIGHTNESS = "96";

const DEFAULT_PRIMARY_HUE = "190";
const DEFAULT_PRIMARY_SATURATION = "28";
const DEFAULT_PRIMARY_LIGHTNESS = "57";

const DEFAULT_PRIMARY_FG_HUE = "0";
const DEFAULT_PRIMARY_FG_SATURATION = "0";
const DEFAULT_PRIMARY_FG_LIGHTNESS = "100";


export function SiteCustomizationProvider({ children }: { children: ReactNode }) {
  const [siteTitle, setSiteTitle] = useState<string>(siteConfig.name);
  
  const [bgHue, setBgHue] = useState<string>(DEFAULT_BG_HUE);
  const [bgSaturation, setBgSaturation] = useState<string>(DEFAULT_BG_SATURATION);
  const [bgLightness, setBgLightness] = useState<string>(DEFAULT_BG_LIGHTNESS);

  const [cardHue, setCardHue] = useState<string>(DEFAULT_CARD_HUE);
  const [cardSaturation, setCardSaturation] = useState<string>(DEFAULT_CARD_SATURATION);
  const [cardLightness, setCardLightness] = useState<string>(DEFAULT_CARD_LIGHTNESS);

  const [primaryHue, setPrimaryHue] = useState<string>(DEFAULT_PRIMARY_HUE);
  const [primarySaturation, setPrimarySaturation] = useState<string>(DEFAULT_PRIMARY_SATURATION);
  const [primaryLightness, setPrimaryLightness] = useState<string>(DEFAULT_PRIMARY_LIGHTNESS);

  const [primaryFgHue, setPrimaryFgHue] = useState<string>(DEFAULT_PRIMARY_FG_HUE);
  const [primaryFgSaturation, setPrimaryFgSaturation] = useState<string>(DEFAULT_PRIMARY_FG_SATURATION);
  const [primaryFgLightness, setPrimaryFgLightness] = useState<string>(DEFAULT_PRIMARY_FG_LIGHTNESS);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage on initial mount
    const storedTitle = localStorage.getItem("customSiteTitle");
    if (storedTitle) {
      setSiteTitle(storedTitle);
      document.title = storedTitle;
    }

    // Background
    const storedBgHue = localStorage.getItem("customBgHue");
    const storedBgSaturation = localStorage.getItem("customBgSaturation");
    const storedBgLightness = localStorage.getItem("customBgLightness");
    if (storedBgHue && storedBgSaturation && storedBgLightness) {
      setBgHue(storedBgHue);
      setBgSaturation(storedBgSaturation);
      setBgLightness(storedBgLightness);
      document.documentElement.style.setProperty('--background', `${storedBgHue} ${storedBgSaturation}% ${storedBgLightness}%`);
    }

    // Card
    const storedCardHue = localStorage.getItem("customCardHue");
    const storedCardSaturation = localStorage.getItem("customCardSaturation");
    const storedCardLightness = localStorage.getItem("customCardLightness");
    if (storedCardHue && storedCardSaturation && storedCardLightness) {
      setCardHue(storedCardHue);
      setCardSaturation(storedCardSaturation);
      setCardLightness(storedCardLightness);
      document.documentElement.style.setProperty('--card', `${storedCardHue} ${storedCardSaturation}% ${storedCardLightness}%`);
    }

    // Primary Button
    const storedPrimaryHue = localStorage.getItem("customPrimaryHue");
    const storedPrimarySaturation = localStorage.getItem("customPrimarySaturation");
    const storedPrimaryLightness = localStorage.getItem("customPrimaryLightness");
    if (storedPrimaryHue && storedPrimarySaturation && storedPrimaryLightness) {
        setPrimaryHue(storedPrimaryHue);
        setPrimarySaturation(storedPrimarySaturation);
        setPrimaryLightness(storedPrimaryLightness);
        document.documentElement.style.setProperty('--primary', `${storedPrimaryHue} ${storedPrimarySaturation}% ${storedPrimaryLightness}%`);
    }

    // Primary Button Foreground
    const storedPrimaryFgHue = localStorage.getItem("customPrimaryFgHue");
    const storedPrimaryFgSaturation = localStorage.getItem("customPrimaryFgSaturation");
    const storedPrimaryFgLightness = localStorage.getItem("customPrimaryFgLightness");
    if (storedPrimaryFgHue && storedPrimaryFgSaturation && storedPrimaryFgLightness) {
        setPrimaryFgHue(storedPrimaryFgHue);
        setPrimaryFgSaturation(storedPrimaryFgSaturation);
        setPrimaryFgLightness(storedPrimaryFgLightness);
        document.documentElement.style.setProperty('--primary-foreground', `${storedPrimaryFgHue} ${storedPrimaryFgSaturation}% ${storedPrimaryFgLightness}%`);
    }

  }, []);

  const applyCustomization = () => {
    if (!isMounted) return;

    // Site Title
    document.title = siteTitle;
    localStorage.setItem("customSiteTitle", siteTitle);

    // Background Color
    const newBackgroundValue = `${bgHue} ${bgSaturation}% ${bgLightness}%`;
    document.documentElement.style.setProperty('--background', newBackgroundValue);
    localStorage.setItem("customBgHue", bgHue);
    localStorage.setItem("customBgSaturation", bgSaturation);
    localStorage.setItem("customBgLightness", bgLightness);

    // Card Background Color
    const newCardBackgroundValue = `${cardHue} ${cardSaturation}% ${cardLightness}%`;
    document.documentElement.style.setProperty('--card', newCardBackgroundValue);
    localStorage.setItem("customCardHue", cardHue);
    localStorage.setItem("customCardSaturation", cardSaturation);
    localStorage.setItem("customCardLightness", cardLightness);

    // Primary Button Color
    const newPrimaryValue = `${primaryHue} ${primarySaturation}% ${primaryLightness}%`;
    document.documentElement.style.setProperty('--primary', newPrimaryValue);
    localStorage.setItem("customPrimaryHue", primaryHue);
    localStorage.setItem("customPrimarySaturation", primarySaturation);
    localStorage.setItem("customPrimaryLightness", primaryLightness);

    // Primary Button Foreground Color
    const newPrimaryFgValue = `${primaryFgHue} ${primaryFgSaturation}% ${primaryFgLightness}%`;
    document.documentElement.style.setProperty('--primary-foreground', newPrimaryFgValue);
    localStorage.setItem("customPrimaryFgHue", primaryFgHue);
    localStorage.setItem("customPrimaryFgSaturation", primaryFgSaturation);
    localStorage.setItem("customPrimaryFgLightness", primaryFgLightness);
  };
  
  // State setters
  const setSiteTitleState = (title: string) => setSiteTitle(title);
  
  const setBgHueState = (h: string) => setBgHue(h);
  const setBgSaturationState = (s: string) => setBgSaturation(s);
  const setBgLightnessState = (l: string) => setBgLightness(l);

  const setCardHueState = (h: string) => setCardHue(h);
  const setCardSaturationState = (s: string) => setCardSaturation(s);
  const setCardLightnessState = (l: string) => setCardLightness(l);

  const setPrimaryHueState = (h: string) => setPrimaryHue(h);
  const setPrimarySaturationState = (s: string) => setPrimarySaturation(s);
  const setPrimaryLightnessState = (l: string) => setPrimaryLightness(l);

  const setPrimaryFgHueState = (h: string) => setPrimaryFgHue(h);
  const setPrimaryFgSaturationState = (s: string) => setPrimaryFgSaturation(s);
  const setPrimaryFgLightnessState = (l: string) => setPrimaryFgLightness(l);


  const value = {
    siteTitle,
    setSiteTitleState,
    bgHue,
    setBgHueState,
    bgSaturation,
    setBgSaturationState,
    bgLightness,
    setBgLightnessState,
    cardHue,
    setCardHueState,
    cardSaturation,
    setCardSaturationState,
    cardLightness,
    setCardLightnessState,
    primaryHue,
    setPrimaryHueState,
    primarySaturation,
    setPrimarySaturationState,
    primaryLightness,
    setPrimaryLightnessState,
    primaryFgHue,
    setPrimaryFgHueState,
    primaryFgSaturation,
    setPrimaryFgSaturationState,
    primaryFgLightness,
    setPrimaryFgLightnessState,
    applyCustomization,
  };

  return (
    <SiteCustomizationContext.Provider value={value}>
      {children}
    </SiteCustomizationContext.Provider>
  );
}
