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
    "pricing": Pricing,
    "login": Login,
    "register": Register,
    "design/banks": BanksAlternative,
    "payment/success": PaymentSuccess,
    "payment/failed": PaymentFailed,
    "components/navigation": HeaderShowcase,
};
