import { cn } from "@/lib/utils";

export function KpiCard({ children, className, index = 0 }: { children: React.ReactNode; className?: string; index?: number }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 space-y-3 opacity-0 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}
