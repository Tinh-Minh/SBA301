export default function AdminLayout({ sidebar, children }) {
    return <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-8">
        <aside className="lg:sticky lg:top-24">{sidebar}</aside>
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </div>;
}
