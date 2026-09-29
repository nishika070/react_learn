export default function GlassCard({ title, action, children, className = "" }) {
    return (
        <section
            className={`rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(80,121,181,0.12)] ${className}`}
        >
            {(title || action) && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    {title && (
                        <h2 className="text-lg font-semibold text-[var(--color-superheading)]">
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}