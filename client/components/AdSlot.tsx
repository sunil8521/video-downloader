interface AdSlotProps {
  type: "banner" | "sidebar" | "native";
  className?: string;
}

const sizes = {
  banner: "max-w-[728px] h-[90px]",
  sidebar: "w-[300px] h-[600px]",
  native: "w-full min-h-[250px]",
};

export function AdSlot({ type, className = "" }: AdSlotProps) {
  return (
    <div
      className={`mx-auto bg-surface border border-dashed border-border rounded-xl flex items-center justify-center ${sizes[type]} ${className}`}
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Advertisement
      </span>
    </div>
  );
}
