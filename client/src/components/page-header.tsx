import { ReactNode } from "react";

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: ReactNode;
}

export function PageHeader({
  heading,
  text,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}