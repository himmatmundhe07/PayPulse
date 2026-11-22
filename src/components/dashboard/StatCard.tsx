import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange" | "yellow" | "red";
  onClick?: () => void;
};

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600" },
  red:    { bg: "bg-red-50",    icon: "text-red-600"    },
};

export default function StatCard({ title, value, description, icon: Icon, color = "blue", onClick }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-5 shadow-sm flex items-start gap-4 ${
        onClick ? "cursor-pointer transition-all hover:border-blue-400 hover:shadow-md active:scale-[0.99]" : ""
      }`}
    >
      {Icon && (
        <div className={`rounded-lg p-2.5 ${colors.bg}`}>
          <Icon size={22} className={colors.icon} />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">{value}</h2>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
