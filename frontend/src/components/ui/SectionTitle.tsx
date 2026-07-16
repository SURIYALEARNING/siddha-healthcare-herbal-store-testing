import { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, action, className = "" }: SectionTitleProps) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
      </div>
      {action && <div className="mt-4 md:mt-0">{action}</div>}
    </div>
  );
}
