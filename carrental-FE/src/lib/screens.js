import Home from "@/views/Home";
import Pricing from "@/views/Pricing";
import Login from "@/views/Login";
import Register from "@/views/Register";
import BanksAlternative from "@/views/BanksAlternative";
import PaymentSuccess from "@/views/PaymentSuccess";
import PaymentFailed from "@/views/PaymentFailed";
import HeaderShowcase from "@/views/HeaderShowcase";
export const screens = {
    "": Home,
    "cach-tinh-gia": Pricing,
    "dang-nhap": Login,
    "dang-ky": Register,
    "mau-thiet-ke/ngan-hang": BanksAlternative,
    "thanh-toan/thanh-cong": PaymentSuccess,
    "thanh-toan/that-bai": PaymentFailed,
    "thanh-phan/dieu-huong": HeaderShowcase,
};
