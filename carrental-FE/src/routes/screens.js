import Home from "@/pages/user/design/HomePage.jsx";
import Pricing from "@/pages/user/design/PricingPage.jsx";
import Login from "@/pages/auth/LoginPage.jsx";
import Register from "@/pages/auth/RegisterPage.jsx";
import BanksAlternative from "@/pages/user/design/BanksAlternativePage.jsx";
import PaymentSuccess from "@/pages/user/design/PaymentSuccessPage.jsx";
import PaymentFailed from "@/pages/user/design/PaymentFailedPage.jsx";
import HeaderShowcase from "@/pages/user/design/HeaderShowcasePage.jsx";
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
