"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Check,
  Camera,
  Trash2,
  Upload,
  Edit,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import PasswordSetupModal from "@/components/PasswordSetupModal";

export default function Profile() {
  const { user, userProfile, session, loading, resetPassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState("");
  const [profileUpdateError, setProfileUpdateError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setProfileUpdateError(
        "Format file tidak didukung. Gunakan JPG, PNG, atau GIF."
      );
      return;
    }

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setProfileUpdateError("Ukuran file terlalu besar. Maksimal 1MB.");
      return;
    }

    setIsUploadLoading(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/profile/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setProfileUpdateSuccess("Foto profil berhasil diupload");
        // Refresh halaman untuk update foto profil
        window.location.reload();
      } else {
        setProfileUpdateError(data.message || "Gagal mengupload foto profil");
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      setProfileUpdateError("Terjadi kesalahan saat mengupload foto profil");
    } finally {
      setIsUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!userProfile?.profile_picture) return;

    setIsDeleteLoading(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");
    setShowDeleteDialog(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pictures/profile/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setProfileUpdateSuccess("Foto profil berhasil dihapus");
        // Refresh halaman untuk update foto profil
        window.location.reload();
      } else {
        setProfileUpdateError(data.message || "Gagal menghapus foto profil");
      }
    } catch (error: any) {
      console.error("Error deleting profile picture:", error);
      setProfileUpdateError("Terjadi kesalahan saat menghapus foto profil");
    } finally {
      setIsDeleteLoading(false);
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
              <div className="relative group">
                {userProfile?.profile_picture ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={userProfile.profile_picture}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Edit button overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="p-2 bg-white/90 hover:bg-white rounded-full"
                            disabled={isUploadLoading || isDeleteLoading}
                          >
                            {isUploadLoading || isDeleteLoading ? (
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Edit className="w-4 h-4 text-gray-700" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          <DropdownMenuItem
                            onClick={handleUploadClick}
                            className="cursor-pointer"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Ubah Foto Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus Foto Profil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    {/* Upload button overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleUploadClick}
                        disabled={isUploadLoading}
                        className="p-2 bg-white/90 hover:bg-white rounded-full"
                      >
                        {isUploadLoading ? (
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Upload className="w-4 h-4 text-gray-700" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Update Messages */}
            {profileUpdateSuccess && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md justify-center">
                <Check className="w-4 h-4" />
                <span className="text-sm">{profileUpdateSuccess}</span>
              </div>
            )}

            {profileUpdateError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {profileUpdateError}
              </div>
            )}

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
                    {userProfile?.role === "traveler" ? "Traveler" : "Tenant"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Foto Profil</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus foto profil? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleteLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProfilePicture}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PasswordSetupModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
      />
    </div>
  );
}
