export function Icon({ name, className = "" }) {
    return <span aria-hidden="true" className={`material-symbols-outlined inline-block size-[1em] overflow-hidden text-center leading-none ${className}`}>{name}</span>;
}
