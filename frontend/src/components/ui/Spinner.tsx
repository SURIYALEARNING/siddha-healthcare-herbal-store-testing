interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes: Record<string, string> = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`}
      />
    </div>
  );
}
