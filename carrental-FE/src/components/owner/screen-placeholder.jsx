import { Icon } from "../icon";
export function ScreenPlaceholder({ sources, hook }) {
    return <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-light bg-white px-6 py-16 text-center">
    <Icon name="edit_square" className="text-[32px] text-brand-accent"/>
    <p className="font-headline-sm text-headline-sm text-charcoal">Đang chờ thiết kế giao diện</p>
    <p className="text-sm text-text-secondary">Dữ liệu: {sources.map(source => <code key={source} className="mx-0.5 whitespace-nowrap rounded bg-section-bg px-1.5 py-0.5 text-xs text-charcoal">{source}</code>)}</p>
    <p className="text-sm text-text-secondary">Hook: <code className="whitespace-nowrap rounded bg-section-bg px-1.5 py-0.5 text-xs text-charcoal">{hook}</code></p>
  </section>;
}
