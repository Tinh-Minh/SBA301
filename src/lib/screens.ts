import type { ComponentType } from "react";
import Home from "@/views/Home";
import Explore from "@/views/Explore";
import Vehicle from "@/views/Vehicle";
import Login from "@/views/Login";
import Register from "@/views/Register";

export const screens: Record<string, ComponentType> = {
  "": Home,
  "kham-pha-xe": Explore,
  "xe/vinfast-vf8-plus-2024": Vehicle,
  "dang-nhap": Login,
  "dang-ky": Register,
};
