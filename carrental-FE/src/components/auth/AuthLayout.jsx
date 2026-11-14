export function AuthLayout({ children }) {
    return <div className="cardb-screen auth-screen font-sans text-[#25251f] antialiased">
        <div className="auth-screen-brand">
            <p className="auth-screen-brand-title">Khởi đầu hành trình<br />cùng <span>CarDB</span></p>
            <p className="auth-screen-brand-lede">Tìm chiếc xe phù hợp cho hành trình của bạn.</p>
        </div>
        <main>
            <div className="auth-screen-frame">
                <div className="auth-screen-card">{children}</div>
            </div>
        </main>
    </div>;
}
