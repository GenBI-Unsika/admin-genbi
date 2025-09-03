export default function StatCard({
  title,
  value,
  description,
  icon, // contoh: "tabler--award"
  trend, // "up" | "down" | null
  trendValue, // contoh: "+12%" atau "-3%"
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon ? (
            <span
              className={[
                "inline-flex size-10 items-center justify-center rounded-lg",
                "bg-primary-50 text-primary-600",
              ].join(" ")}
            >
              <i className={`icon-[${icon}] text-xl`} aria-hidden />
            </span>
          ) : null}
          <div>
            <p className="text-sm text-neutral-600">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {value}
            </p>
          </div>
        </div>

        {trend && trendValue ? (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              trend === "up"
                ? "bg-primary-50 text-primary-700"
                : "bg-secondary-50 text-secondary-700",
            ].join(" ")}
          >
            <i
              className={`icon-[${
                trend === "up" ? "tabler--trending-up" : "tabler--trending-down"
              }] text-sm`}
              aria-hidden
            />
            {trendValue}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 text-sm text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}
