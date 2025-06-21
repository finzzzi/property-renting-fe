"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Profil Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              {userProfile?.profile_picture ? (
                <Image
                  src={userProfile.profile_picture}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">
                    {userProfile?.name || "Belum diatur"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {userProfile?.email || user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Jenis Akun</p>
                  <p className="font-medium capitalize">
                    {userProfile?.role === "traveler" ? "Traveler" : "Owner"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nomor Telepon</p>
                  <p className="font-medium">
                    {userProfile?.phone || "Belum diatur"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">
                    {userProfile?.address || "Belum diatur"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
