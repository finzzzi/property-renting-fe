import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { PeakSeason, Room } from "@/hooks/usePeakSeasonDataV2";

interface PeakSeasonTableV2Props {
  peakSeasons: PeakSeason[];
  rooms: Room[];
  month: Date;
  selectedRoom: string;
  loadingData: boolean;
  onEdit: (ps: PeakSeason) => void;
  onDelete: (ps: PeakSeason) => void;
}

export function PeakSeasonTableV2({
  peakSeasons,
  rooms,
  month,
  selectedRoom,
  loadingData,
  onEdit,
  onDelete,
}: PeakSeasonTableV2Props) {
  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (!selectedRoom || loadingData) {
    return null;
  }

  return (
    <div className="lg:w-3/4 overflow-x-auto mt-6 lg:mt-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Mulai</TableHead>
            <TableHead>Selesai</TableHead>
            <TableHead>Durasi</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Harga Awal</TableHead>
            <TableHead>Harga Akhir</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peakSeasons.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-muted-foreground py-6"
              >
                Tidak ada peak season untuk bulan{" "}
                {month.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </TableCell>
            </TableRow>
          ) : (
            peakSeasons.map((p, idx) => {
              const room = rooms.find((r) => r.id === p.room_id);
              const base = room?.price ?? 0;
              const final =
                p.type === "percentage"
                  ? base + (base * p.value) / 100
                  : base + p.value;

              const durasi =
                (new Date(p.end_date).getTime() -
                  new Date(p.start_date).getTime()) /
                  (1000 * 60 * 60 * 24) +
                1;

              return (
                <TableRow key={p.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{formatDate(new Date(p.start_date))}</TableCell>
                  <TableCell>{formatDate(new Date(p.end_date))}</TableCell>
                  <TableCell>{durasi} hari</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>
                    {p.type === "percentage"
                      ? `${p.value} %`
                      : formatCurrency(p.value)}
                  </TableCell>
                  <TableCell>{base ? formatCurrency(base) : "-"}</TableCell>
                  <TableCell>{base ? formatCurrency(final) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(p)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(p)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
