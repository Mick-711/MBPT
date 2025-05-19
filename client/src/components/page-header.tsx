import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function PageHeader({ heading, text, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children && <div className="mt-4">{children}</div>}
      <Separator className="my-6" />
    </div>
  );
}