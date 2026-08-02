import { ChevronDown } from "lucide-react";

export default function AdminFilterSelect({
  children,
  className = "",
  selectClassName = "",
  ...props
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select
        {...props}
        className={`block h-10 w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-800 shadow-sm outline-none transition-colors hover:border-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15 ${selectClassName}`}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  );
}
