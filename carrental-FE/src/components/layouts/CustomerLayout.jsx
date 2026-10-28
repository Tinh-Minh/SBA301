import { Header } from "@/components/Header.jsx";
import { Interactions } from "@/components/Interactions.jsx";
import { ReferenceFooter } from "@/components/ReferenceFooter.jsx";

export default function CustomerLayout({ children }) {
    return <>
        <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
        <Header />
        <Interactions><div id="noi-dung">{children}</div><ReferenceFooter /></Interactions>
    </>;
}
