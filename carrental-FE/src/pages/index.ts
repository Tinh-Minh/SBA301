import type { ScreenRegistry } from "@/interfaces/page";
import Home from "./Home";
import Pricing from "./Pricing";
import Explore from "./Explore";
import Vehicle from "./Vehicle";
import Login from "./Login";
import Register from "./Register";
import Account from "./Account";
import AccountOrders from "./AccountOrders";
import History from "./History";
import Verification from "./Verification";
import VerificationCollapsed from "./VerificationCollapsed";
import DriverProfile from "./DriverProfile";
import Banks from "./Banks";
import BanksAlternative from "./BanksAlternative";
import AddBank from "./AddBank";
import DefaultBank from "./DefaultBank";
import Checkout from "./Checkout";
import RequestSuccess from "./RequestSuccess";
import Trips from "./Trips";
import Order from "./Order";
import ConfirmedOrder from "./ConfirmedOrder";
import Payment from "./Payment";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
import Handover from "./Handover";
import Return from "./Return";
import Review from "./Review";
import Dispute from "./Dispute";
import HeaderShowcase from "./HeaderShowcase";

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
