import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import {
  PropertyPicture,
  PicturesResponse,
} from "@/lib/types/tenant-gallery-types";
import { Property as TenantProperty } from "@/lib/types/tenant";

interface PropertyFromAPI {
  id: number;
  name: string;
  description: string;
  location: string;
  category_id: number;
  city_id: number;
  category?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
    type: string;
  };
}

interface PropertyListResponse {
  success: boolean;
  data: PropertyFromAPI[];
}

export const usePropertyGalleryPage = () => {
  const [pictures, setPictures] = useState<PropertyPicture[]>([]);
  const [properties, setProperties] = useState<TenantProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPicture, setDeletingPicture] =
    useState<PropertyPicture | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Safe usage of useSearchParams with fallback
  let searchParams;
  try {
    searchParams = useSearchParams();
  } catch (error) {
    // Fallback for SSR or when searchParams is not available
    searchParams = null;
  }

  const fetchProperties = useCallback(async () => {
    if (!session?.access_token) {
      setLoadingProperties(false);
      return;
    }
    try {
      setLoadingProperties(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tenant/properties?all=true`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil data properti");
      const data: PropertyListResponse = await response.json();

      // Transform data to match PropertyFilter expected type
      const transformedProperties: TenantProperty[] = data.data.map((prop) => ({
        id: prop.id,
        name: prop.name,
        address: prop.location, // Map location to address
      }));

      setProperties(transformedProperties);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data properti"
      );
    } finally {
      setLoadingProperties(false);
    }
  }, [session]);

  const fetchPictures = useCallback(async () => {
    if (!session?.access_token || !selectedProperty) {
      setPictures([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/pictures/all-property-pictures?property_id=${selectedProperty}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data gambar");
      const data: PicturesResponse = await response.json();
      setPictures(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data gambar"
      );
    } finally {
      setLoading(false);
    }
  }, [session, selectedProperty]);

  // Auto-select property from URL parameter
  useEffect(() => {
    // Only attempt to get search params if available
    if (!searchParams) return;

    const propertyId = searchParams.get("property_id");
    if (propertyId && properties.length > 0) {
      // Check if the property ID exists in the properties list
      const propertyExists = properties.some(
        (prop) => prop.id.toString() === propertyId
      );
      if (propertyExists) {
        setSelectedProperty(propertyId);
      }
    }
  }, [searchParams, properties]);

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session, fetchProperties]);

  useEffect(() => {
    if (session && selectedProperty) {
      fetchPictures();
    }
  }, [session, selectedProperty, fetchPictures]);

  const handlePropertyFilterChange = (value: string) => {
    setSelectedProperty(value);
    setPictures([]);
    setError(null);
  };

  const openDeleteDialog = (picture: PropertyPicture) => {
    setDeletingPicture(picture);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeletingPicture(null);
    setShowDeleteDialog(false);
  };

  const handleDeletePicture = async () => {
    if (!session?.access_token || !deletingPicture) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/property/${deletingPicture.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus foto");
      }
      await fetchPictures();
      closeDeleteDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus foto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetMainPicture = async (pictureId: number) => {
    if (!session?.access_token || !selectedProperty) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/property/${pictureId}/set-main`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menjadikan foto utama");
      }
      await fetchPictures(); // Refresh to show the new main picture
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    pictures,
    properties,
    loading: loading && !!selectedProperty,
    loadingProperties,
    authLoading,
    error,
    session,
    selectedProperty,
    setSelectedProperty,
    showDeleteDialog,
    deletingPicture,
    submitting,
    handlePropertyFilterChange,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeletePicture,
    handleSetMainPicture,
    fetchPictures,
  };
};
