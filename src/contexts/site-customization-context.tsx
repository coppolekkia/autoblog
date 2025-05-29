
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

export function SiteCustomizationProvider({ children }: { children: ReactNode }) {
  const [siteTitle, setSiteTitle] = useState<string>(siteConfig.name);
  const [bgHue, setBgHue] = useState<string>(DEFAULT_BG_HUE);
  const [bgSaturation, setBgSaturation] = useState<string>(DEFAULT_BG_SATURATION);
  const [bgLightness, setBgLightness] = useState<string>(DEFAULT_BG_LIGHTNESS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage on initial mount
    const storedTitle = localStorage.getItem("customSiteTitle");
    if (storedTitle) {
      setSiteTitle(storedTitle);
      document.title = storedTitle;
    }

    const storedBgHue = localStorage.getItem("customBgHue");
    const storedBgSaturation = localStorage.getItem("customBgSaturation");
    const storedBgLightness = localStorage.getItem("customBgLightness");

    if (storedBgHue && storedBgSaturation && storedBgLightness) {
      setBgHue(storedBgHue);
      setBgSaturation(storedBgSaturation);
      setBgLightness(storedBgLightness);
      document.documentElement.style.setProperty('--background', `${storedBgHue} ${storedBgSaturation}% ${storedBgLightness}%`);
    }
  }, []);

  const applyCustomization = () => {
    if (!isMounted) return;

    // Update document title
    document.title = siteTitle;
    localStorage.setItem("customSiteTitle", siteTitle);

    // Update background color CSS variable
    const newBackgroundValue = `${bgHue} ${bgSaturation}% ${bgLightness}%`;
    document.documentElement.style.setProperty('--background', newBackgroundValue);
    localStorage.setItem("customBgHue", bgHue);
    localStorage.setItem("customBgSaturation", bgSaturation);
    localStorage.setItem("customBgLightness", bgLightness);
  };
  
  // Functions to be used by admin panel to update state before explicit applyCustomization call
  const setSiteTitleState = (title: string) => setSiteTitle(title);
  const setBgHueState = (h: string) => setBgHue(h);
  const setBgSaturationState = (s: string) => setBgSaturation(s);
  const setBgLightnessState = (l: string) => setBgLightness(l);


  const value = {
    siteTitle,
    setSiteTitleState,
    bgHue,
    setBgHueState,
    bgSaturation,
    setBgSaturationState,
    bgLightness,
    setBgLightnessState,
    applyCustomization,
  };

  return (
    <SiteCustomizationContext.Provider value={value}>
      {children}
    </SiteCustomizationContext.Provider>
  );
}
