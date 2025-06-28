"use client";

import React from "react";
import PropertySearchForm from "@/components/PropertySearchForm";
import { SearchParams } from "@/lib/types/search";

interface SearchHeaderProps {
  searchParams: SearchParams;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ searchParams }) => {
  const handleSearch = (searchData: any) => {
    const newParams = { ...searchData, page: "1" };
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set("city_id", newParams.city_id);
    urlSearchParams.set("check_in", newParams.check_in);
    urlSearchParams.set("check_out", newParams.check_out);
    urlSearchParams.set("guests", newParams.guests);
    urlSearchParams.set("page", newParams.page);
    window.location.href = `/search?${urlSearchParams.toString()}`;
  };

  return (
    <div className="">
      <div className="absolute top-0 left-0 w-full h-[290px] bg-gradient-to-b from-[#2AACE3] to-[#0078C3] z-0 rounded-b-3xl" />
      <div className="container mx-auto px-4 pt-5 relative z-10">
        <PropertySearchForm
          defaultValues={{
            city_id: searchParams.city_id,
            check_in: searchParams.check_in,
            check_out: searchParams.check_out,
            guests: searchParams.guests,
          }}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
};

export default SearchHeader;
