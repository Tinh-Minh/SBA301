/** Icon con mắt hiện/ẩn mật khẩu. Vẽ bằng SVG vì font Material rút gọn của dự án không có "visibility_off". */
export function EyeIcon({ off = false }) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/>
        <circle cx="12" cy="12" r="3"/>
        {off ? <path d="M4 4l16 16"/> : null}
    </svg>;
}
