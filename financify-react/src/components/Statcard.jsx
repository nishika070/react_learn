function StatCard({ title, value, valueColor = "text-gray-900", icon, iconClass = "bg-[var(--color-superheading)]/10 text-[var(--color-superheading)]" }) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(80,121,181,0.12)] transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {icon && (
                    <span className={`w-9 h-9 rounded-xl inline-flex items-center justify-center ${iconClass}`}>
                        {icon}
                    </span>
                )}
            </div>
            <p className={`mt-3 text-2xl xl:text-3xl font-bold tracking-tight ${valueColor}`}>
                {value}
            </p>
        </div>
    );
}

export default StatCard;