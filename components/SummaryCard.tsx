interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient?: string;
}

export default function SummaryCard({ title, value, icon, gradient = "from-primary-500 to-primary-600" }: SummaryCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1">
      {/* Gradient Accent Border */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <span className="filter drop-shadow-sm">{icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight truncate" title={value}>
            {value}
          </p>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
    </div>
  );
}
