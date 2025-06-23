"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Lock, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PasswordSetupModal from "@/components/PasswordSetupModal";

export default function Profile() {
  const { user, userProfile, loading, resetPassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.app_metadata) {
      const hasPassword = user.app_metadata.has_password;
      const provider = user.app_metadata.provider;

      if (provider === "email" && !hasPassword) {
        setShowPasswordModal(true);
      } else {
        setShowPasswordModal(false);
      }
    }
  }, [user]);

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;

    setIsResetLoading(true);
    setResetError("");
    setResetSuccess(false);

    try {
      await resetPassword(user.email);
      setResetSuccess(true);
    } catch (error: any) {
      console.error("Error sending reset password email:", error);
      setResetError(
        "Terjadi kesalahan saat mengirim email reset password. Silakan coba lagi."
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show set password for new users
  const hasPassword = user?.app_metadata?.has_password;
  const provider = user?.app_metadata?.provider;
  const canChangePassword = provider === "email" && hasPassword;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Information Card */}
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

        {/* Settings Card */}
        {canChangePassword && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Pengaturan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-between">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-500">
                      Kirim link reset password ke email Anda
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={isResetLoading}
                    className="flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isResetLoading ? "Mengirim..." : "Reset Password"}
                    </span>
                  </Button>
                </div>

                {/* Success Message */}
                {resetSuccess && (
                  <div className="flex items-center space-x-2 text-green-600 bg-gray-100 p-3 rounded-md justify-center">
                    <span className="text-sm">
                      Link reset password telah dikirim ke email Anda.
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {resetError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {resetError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PasswordSetupModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
      />
    </div>
  );
}
