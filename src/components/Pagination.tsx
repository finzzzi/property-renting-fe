"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SearchResponse } from "@/lib/types/search";

interface PaginationProps {
  pagination: SearchResponse["pagination"];
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  if (!pagination || pagination.total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <Button
        variant="outline"
        disabled={!pagination.has_previous_page}
        onClick={() => onPageChange(pagination.current_page - 1)}
      >
        Sebelumnya
      </Button>

      <div className="flex space-x-1">
        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(
          (page) => (
            <Button
              key={page}
              variant={page === pagination.current_page ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              className={
                page === pagination.current_page
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        disabled={!pagination.has_next_page}
        onClick={() => onPageChange(pagination.current_page + 1)}
      >
        Selanjutnya
      </Button>
    </div>
  );
};

export default Pagination;
