import { lazy } from "react";
import type { ScreenRegistry } from "@/interfaces/page";

// Mỗi màn hình được tải riêng khi người dùng mở đường dẫn đó (code splitting).
const Home = lazy(() => import("./Home"));
const Pricing = lazy(() => import("./Pricing"));
const Explore = lazy(() => import("./Explore"));
const Vehicle = lazy(() => import("./Vehicle"));
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const Account = lazy(() => import("./Account"));
const AccountOrders = lazy(() => import("./AccountOrders"));
const History = lazy(() => import("./History"));
const Verification = lazy(() => import("./Verification"));
const VerificationCollapsed = lazy(() => import("./VerificationCollapsed"));
const DriverProfile = lazy(() => import("./DriverProfile"));
const Banks = lazy(() => import("./Banks"));
const BanksAlternative = lazy(() => import("./BanksAlternative"));
const AddBank = lazy(() => import("./AddBank"));
const DefaultBank = lazy(() => import("./DefaultBank"));
const Checkout = lazy(() => import("./Checkout"));
const RequestSuccess = lazy(() => import("./RequestSuccess"));
const Trips = lazy(() => import("./Trips"));
const Order = lazy(() => import("./Order"));
const ConfirmedOrder = lazy(() => import("./ConfirmedOrder"));
const Payment = lazy(() => import("./Payment"));
const PaymentSuccess = lazy(() => import("./PaymentSuccess"));
const PaymentFailed = lazy(() => import("./PaymentFailed"));
const Handover = lazy(() => import("./Handover"));
const Return = lazy(() => import("./Return"));
const Review = lazy(() => import("./Review"));
const Dispute = lazy(() => import("./Dispute"));
const HeaderShowcase = lazy(() => import("./HeaderShowcase"));

export const screens: ScreenRegistry = {
  "": Home,
  "cach-tinh-gia": Pricing,
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
  "chuyen-xe-cua-toi": Trips,
  "don-thue/CDB-ORD-20261026-904": Order,
  "don-thue/CDB-ORD-20261026-904/da-xac-nhan": ConfirmedOrder,
  "thanh-toan": Payment,
  "thanh-toan/thanh-cong": PaymentSuccess,
  "thanh-toan/that-bai": PaymentFailed,
  "ban-giao/nhan-xe": Handover,
  "ban-giao/tra-xe": Return,
  "danh-gia": Review,
  "tranh-chap": Dispute,
  "thanh-phan/dieu-huong": HeaderShowcase,
};
