import "@/components/home/home.css";
import { useRef } from "react";
import { Link } from "react-router";
import { HomeListings } from "@/components/home/HomeListings.jsx";
import { HomeSearch } from "@/components/home/HomeSearch.jsx";
import { CarJourney } from "@/components/home/CarJourney.jsx";
import { WheelCursor } from "@/components/home/WheelCursor.jsx";

export default function Home() {
    const root = useRef(null);
    return <div ref={root} className="cardb-screen home-journey-page font-sans text-text-primary" data-intro-state="loading">
        <WheelCursor />
        <CarJourney root={root} />
        <main>
            <section className="journey-hero" data-car-stop="hero" id="journey-hero">
                <div className="journey-hero-top"><span>CarDB / Kết nối người thuê và chủ xe</span><span>TP. Hồ Chí Minh, Việt Nam</span></div>
                <h1><span className="journey-title-line journey-title-line--first">CẦM LÁI.</span><span className="journey-title-line journey-title-line--second">MỞ LỐI.</span></h1>
                <div className="journey-hero-bottom"><p>Hãy khiến hành trình<br />mang dấu ấn của bạn.</p><a href="#journey-search">Cuộn để khởi hành <span aria-hidden="true">↓</span></a></div>
            </section>
            <section className="journey-search" data-car-stop="search" id="journey-search">
                <div className="journey-copy journey-reveal"><span className="journey-kicker">Đi theo cách của bạn</span><h2>ĐỔI GÓC NHÌN.<br />ĐỔI HÀNH TRÌNH.</h2><p>Một buổi sáng ra khỏi thành phố. Một chuyến đi chưa có trong lịch. Tìm chiếc xe khiến bạn muốn lên đường.</p><a href="#home-search" onClick={event => { event.preventDefault(); root.current?.querySelector("#home-search input")?.focus({ preventScroll:true }); }} className="journey-text-link">Tìm tin đăng phù hợp <span aria-hidden="true">↗</span></a></div>
                <HomeSearch />
            </section>
            <HomeListings />
            <section className="journey-steps" data-car-stop="steps" id="journey-steps">
                <div className="journey-copy journey-reveal"><span className="journey-kicker">Kết nối người thuê với chủ xe.</span><h2><span>KẾT NỐI.</span><span>TRAO ĐỔI.</span></h2><p>Gọi điện hoặc nhắn Zalo từ thông tin trên tin đăng. Hỏi lịch trống, giá thuê và điều kiện nhận xe với chủ xe.</p><a className="journey-text-link" href="#journey-flow">Cách thuê xe <span aria-hidden="true">↓</span></a></div>
            </section>
            <section className="journey-flow" data-car-stop="flow" id="journey-flow" aria-labelledby="journey-flow-title">
                <div className="journey-copy journey-reveal"><span className="journey-kicker">Cách thuê xe trên CarDB</span><h2 id="journey-flow-title">TÌM XE.<br />KẾT NỐI.<br />LÊN ĐƯỜNG.</h2><p>CarDB giúp bạn tìm tin đăng và kết nối với chủ xe.</p><Link to="/explore" className="journey-text-link">Bắt đầu tìm xe <span aria-hidden="true">↗</span></Link></div>
                <ol className="journey-flow-list journey-reveal journey-reveal--late">
                    <li><span className="journey-flow-number" aria-hidden="true">01</span><div><h3>Tìm chiếc xe phù hợp</h3><p>Vào Khám phá, lọc theo địa điểm, loại xe và giá tham khảo. Mở tin đăng để xem ảnh và thông tin xe.</p></div></li>
                    <li><span className="journey-flow-number" aria-hidden="true">02</span><div><h3>Liên hệ chủ xe</h3><p>Dùng số điện thoại hoặc Zalo trên tin đăng để hỏi lịch trống, thống nhất giá thuê và điểm nhận xe.</p></div></li>
                    <li><span className="journey-flow-number" aria-hidden="true">03</span><div><h3>Thống nhất và nhận xe</h3><p>Trao đổi giấy tờ, tiền cọc và điều kiện thuê với chủ xe. Kiểm tra tình trạng xe khi bàn giao rồi bắt đầu chuyến đi.</p></div></li>
                </ol>
            </section>
            <section className="journey-drive" data-car-stop="drive" id="journey-drive">
                <div className="journey-copy journey-reveal"><span className="journey-kicker">Sẵn sàng cùng bạn lăn bánh</span><h2>MỞ GÓC NHÌN.<br />MỞ LỐI RIÊNG.</h2><p>Rời những lộ trình quen thuộc. Để mỗi khúc cua mở ra một trải nghiệm mới.</p><Link to="/explore" className="journey-text-link">Tìm xe cho chuyến đi <span aria-hidden="true">↗</span></Link></div>
            </section>
            <section className="journey-faq" data-car-stop="faq" id="journey-faq">
                <div className="journey-copy journey-reveal"><span className="journey-kicker">Trước khi lăn bánh</span><h2>CÒN ĐIỀU GÌ<br />BẠN MUỐN BIẾT?</h2><div className="journey-questions">
                    <details><summary>Tôi tìm xe phù hợp thế nào?</summary><p>Chọn địa điểm, dòng xe và mức giá tham khảo tại trang khám phá. Xem thông tin chi tiết trước khi liên hệ chủ xe.</p></details>
                    <details><summary>Tôi trao đổi lịch thuê với ai?</summary><p>Thông tin liên hệ trên tin đăng giúp bạn trao đổi qua điện thoại hoặc Zalo với chủ xe về lịch thuê, giá và điểm nhận xe.</p></details>
                    <details><summary>CarDB có nhận tiền thuê hoặc tiền cọc không?</summary><p>Việc thuê xe, đặt cọc và bàn giao do bạn thỏa thuận với chủ xe. Thanh toán gói trên CarDB dành cho chủ xe mua thời hạn hiển thị tin đăng.</p></details>
                    <details><summary>Tôi là chủ xe, đăng tin thế nào?</summary><p>Đăng nhập, thêm thông tin và giấy tờ xe để gửi duyệt. Tin đăng được hiển thị theo trạng thái duyệt xe và gói đăng tin còn hiệu lực.</p></details>
                </div></div>
            </section>
            <section className="journey-finale" data-car-stop="finale" id="journey-finale">
                <p className="journey-reveal">Chiếc xe tiếp theo. Câu chuyện tiếp theo.</p><h2 className="journey-reveal">ĐẾN LƯỢT BẠN.</h2><Link to="/explore" className="journey-primary journey-reveal journey-reveal--late">Tìm chiếc xe của bạn <span aria-hidden="true">↗</span></Link>
                <div className="journey-finale-bottom journey-reveal journey-reveal--late"><span>CarDB. Đồng hành mọi chuyến đi.</span></div>
            </section>
        </main>
    </div>;
}
