import type { ComponentType } from "react";
import Home from "@/views/Home";
import Explore from "@/views/Explore";
import Vehicle from "@/views/Vehicle";
import Login from "@/views/Login";
import Register from "@/views/Register";
import Account from "@/views/Account";
import AccountOrders from "@/views/AccountOrders";
import History from "@/views/History";
import Verification from "@/views/Verification";

export const screens: Record<string, ComponentType> = {
  "": Home,
  "kham-pha-xe": Explore,
  "xe/vinfast-vf8-plus-2024": Vehicle,
  "dang-nhap": Login,
  "dang-ky": Register,
  "tai-khoan": Account,
  "tai-khoan/don-thue": AccountOrders,
  "tai-khoan/lich-su": History,
  "tai-khoan/xac-minh": Verification,
};
