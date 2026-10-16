import type { ComponentType } from "react";
import Home from "@/views/Home";
import Explore from "@/views/Explore";

export const screens: Record<string, ComponentType> = {
  "": Home,
  "kham-pha-xe": Explore,
};
