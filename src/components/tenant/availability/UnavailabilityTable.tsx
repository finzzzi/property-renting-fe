"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Unavailability } from "@/lib/types/tenant";

interface UnavailabilityTableProps {
  unavailabilities: Unavailability[];
  onDelete: (item: Unavailability) => void;
  month: Date;
}

export function UnavailabilityTable({
  unavailabilities,
  onDelete,
  month,
}: UnavailabilityTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Tidak Tersedia Mulai</TableHead>
            <TableHead>Sampai</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unavailabilities.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-6"
              >
                Tidak ada pengaturan untuk bulan{" "}
                {month.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </TableCell>
            </TableRow>
          ) : (
            unavailabilities.map((u, idx) => (
              <TableRow key={u.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{formatDate(u.start_date)}</TableCell>
                <TableCell>{formatDate(u.end_date)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDelete(u)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
