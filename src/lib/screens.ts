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
import VerificationCollapsed from "@/views/VerificationCollapsed";
import DriverProfile from "@/views/DriverProfile";
import Banks from "@/views/Banks";
import BanksAlternative from "@/views/BanksAlternative";
import AddBank from "@/views/AddBank";
import DefaultBank from "@/views/DefaultBank";
import Checkout from "@/views/Checkout";
import RequestSuccess from "@/views/RequestSuccess";

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
  "tai-khoan/xac-minh/thu-gon": VerificationCollapsed,
  "tai-khoan/ho-so-tai-xe": DriverProfile,
  "tai-khoan/ngan-hang": Banks,
  "mau-thiet-ke/ngan-hang": BanksAlternative,
  "tai-khoan/ngan-hang/them": AddBank,
  "tai-khoan/ngan-hang/mac-dinh": DefaultBank,
  "dat-xe/xac-nhan": Checkout,
  "dat-xe/thanh-cong": RequestSuccess,
};
