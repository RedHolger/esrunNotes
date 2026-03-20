interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export default function SummaryCard({ title, value, icon }: SummaryCardProps) {
  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 flex items-start gap-4 transition-all hover:shadow-md">
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 text-2xl text-indigo-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
