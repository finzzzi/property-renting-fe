"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {backHref && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}
