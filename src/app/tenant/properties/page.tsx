"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, MoreHorizontal, Edit, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/Pagination";

interface Property {
  id: number;
  name: string;
  description: string;
  location: string;
  created_at: string;
  updated_at: string;
  total_rooms: number;
  category: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
    type: string;
  };
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

interface PropertyResponse {
  success: boolean;
  message: string;
  data: Property[];
  pagination: PaginationInfo;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchProperties(currentPage);
    }
  }, [session, currentPage]);

  const fetchProperties = async (page: number = 1) => {
    if (!session?.access_token) {
      setError("Token authentikasi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/my-properties?page=${page}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Token tidak valid atau sudah expired. Silakan login kembali."
          );
        }
        throw new Error(`Gagal mengambil data properti: ${response.status}`);
      }

      const data: PropertyResponse = await response.json();
      setProperties(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditProperty = (propertyId: number) => {
    router.push(`/tenant/properties/edit/${propertyId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Nama Properti</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Kota/Kab</TableHead>
              <TableHead>Jumlah Room</TableHead>
              <TableHead className="w-12">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Session Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Silakan login kembali untuk mengakses halaman ini
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchProperties(currentPage)}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properti Saya</h1>
          <p className="text-muted-foreground">
            Kelola semua properti yang Anda miliki
          </p>
        </div>
        <Button asChild>
          <Link href="/tenant/properties/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Properti
          </Link>
        </Button>
      </div>

      {/* Properties List */}
      {properties.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2">Belum Ada Properti</h3>
            <p className="text-muted-foreground mb-4">
              Tambahkan properti pertama Anda untuk memulai
            </p>
            <Button asChild>
              <Link href="/tenant/properties/add">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Properti
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Properti</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kota/Kab</TableHead>
                <TableHead>Jumlah Room</TableHead>
                <TableHead className="w-12">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property, index) => (
                <TableRow key={property.id}>
                  <TableCell>
                    {pagination
                      ? pagination.items_per_page *
                          (pagination.current_page - 1) +
                        index +
                        1
                      : index + 1}
                  </TableCell>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.category.name}</TableCell>
                  <TableCell>{property.city.name}</TableCell>
                  <TableCell>{property.total_rooms}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditProperty(property.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Properti
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Home className="mr-2 h-4 w-4" />
                          Tambah Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && (
            <Pagination
              pagination={{
                current_page: pagination.current_page,
                total_pages: pagination.total_pages,
                has_next_page: pagination.has_next_page,
                has_prev_page: pagination.has_previous_page,
                total_properties: pagination.total_items,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
