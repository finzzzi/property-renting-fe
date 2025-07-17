"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import PasswordSetupModal from "@/components/PasswordSetupModal";
import { useProfilePicture } from "@/hooks/useProfilePicture";

interface EditFormData {
  name: string;
  phone: string;
  address: string;
}

function ProfileContent() {
  const { user, userProfile, session, loading, resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // States for various functionalities
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [profileUpdateError, setProfileUpdateError] = useState("");
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(""); // Keep for edit success

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [showResetPasswordConfirmDialog, setShowResetPasswordConfirmDialog] =
    useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showChangeEmailConfirmDialog, setShowChangeEmailConfirmDialog] =
    useState(false);

  // Edit form states
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    phone: "",
    address: "",
  });
  const [editErrors, setEditErrors] = useState<Partial<EditFormData>>({});

  // Change email states
  const [isChangeEmailLoading, setIsChangeEmailLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeEmailError, setChangeEmailError] = useState("");
  const [changeEmailSuccess, setChangeEmailSuccess] = useState("");

  // Refactored profile picture logic into a custom hook
  const {
    isUploadLoading,
    isDeleteLoading,
    statusMessage: pictureStatus,
    showDeleteDialog,
    setShowDeleteDialog,
    fileInputRef,
    handleUploadClick,
    handleFileUpload,
    handleDeleteProfilePicture,
  } = useProfilePicture(() => {
    // On success, reload the page to show the updated picture
    window.location.reload();
  }, userProfile);

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Effect to show password setup modal if needed
  useEffect(() => {
    if (user?.app_metadata) {
      const hasPassword = user.app_metadata.has_password;
      const provider = user.app_metadata.provider;
      if (provider === "email" && !hasPassword) {
        setShowPasswordModal(true);
      }
    }
  }, [user]);

  // Effect to initialize edit form data
  useEffect(() => {
    if (userProfile && showEditDialog) {
      setEditFormData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      });
      setEditErrors({});
    }
  }, [userProfile, showEditDialog]);

  // Effect to handle email change confirmation message
  useEffect(() => {
    const emailChanged = searchParams.get("email_changed");
    if (emailChanged === "true") {
      setChangeEmailSuccess(
        "Email berhasil diubah! Silakan login kembali jika diperlukan."
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("email_changed");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  const handlePasswordModalClose = () => setShowPasswordModal(false);

  const handleChangePassword = () => setShowResetPasswordConfirmDialog(true);

  const handleConfirmResetPassword = async () => {
    if (!user?.email) return;
    setIsResetLoading(true);
    setResetError("");
    setResetSuccess(false);
    setShowResetPasswordConfirmDialog(false);
    try {
      await resetPassword(user.email);
      setResetSuccess(true);
    } catch (error: any) {
      setResetError("Terjadi kesalahan saat mengirim email reset password.");
    } finally {
      setIsResetLoading(false);
    }
  };

  // --- All profile picture logic is now in useProfilePicture hook ---

  // --- Edit Profile Logic ---
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(0|62|\+62)8[1-9][0-9]{7,10}$/;
    return phoneRegex.test(phone);
  };

  const validateEditForm = (): boolean => {
    const errors: Partial<EditFormData> = {};
    if (!editFormData.name) {
      errors.name = "Nama tidak boleh kosong.";
    }
    if (editFormData.phone && !validatePhoneNumber(editFormData.phone)) {
      errors.phone = "Format nomor telepon tidak valid.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = () => {
    if (validateEditForm()) {
      setShowEditConfirmDialog(true);
    }
  };

  const handleConfirmEditSubmit = async () => {
    setIsEditLoading(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");
    setShowEditConfirmDialog(false);

    try {
      // Prepare data to send
      const updateData: Partial<EditFormData> = {};
      if (editFormData.name.trim()) updateData.name = editFormData.name.trim();
      if (editFormData.phone.trim())
        updateData.phone = editFormData.phone.trim();
      if (editFormData.address.trim())
        updateData.address = editFormData.address.trim();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setProfileUpdateSuccess("Profil berhasil diperbarui!");
        setShowEditDialog(false);
        // Refresh halaman untuk menampilkan data terbaru
        window.location.reload();
      } else {
        setProfileUpdateError(data.message || "Gagal memperbarui profil.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setProfileUpdateError("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setEditErrors({});
  };

  // --- Change Email Logic ---
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChangeEmail = () => {
    setShowChangeEmailDialog(true);
    setNewEmail("");
    setChangeEmailError("");
  };

  const handleChangeEmailSubmit = () => {
    if (!validateEmail(newEmail)) {
      setChangeEmailError("Format email tidak valid.");
      return;
    }
    if (newEmail === user?.email) {
      setChangeEmailError("Email baru tidak boleh sama dengan email lama.");
      return;
    }
    setShowChangeEmailConfirmDialog(true);
  };

  const handleConfirmChangeEmail = async () => {
    setIsChangeEmailLoading(true);
    setChangeEmailError("");
    setChangeEmailSuccess("");
    setShowChangeEmailConfirmDialog(false);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser(
        {
          email: newEmail,
        },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=email_change`,
        }
      );

      if (error) {
        setChangeEmailError(error.message || "Gagal mengubah email");
      } else {
        setChangeEmailSuccess(
          "Link konfirmasi perubahan email telah dikirim ke kedua email, silakan klik link konfirmasi di kedua email"
        );
        setShowChangeEmailDialog(false);
        setNewEmail("");
      }
    } catch (error: any) {
      console.error("Error changing email:", error);
      setChangeEmailError("Terjadi kesalahan saat mengubah email");
    } finally {
      setIsChangeEmailLoading(false);
    }
  };

  const handleChangeEmailDialogClose = () => {
    setShowChangeEmailDialog(false);
    setNewEmail("");
    setChangeEmailError("");
  };

  const canChangePassword = user?.app_metadata?.provider === "email";

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8">
            {/* Header Skeleton */}
            <div className="h-8 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-96 animate-pulse"></div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Profile Card Skeleton */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Edit Button Skeleton */}
                <div className="flex justify-end mb-4">
                  <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                </div>

                {/* Profile Picture Skeleton */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 animate-pulse"></div>

                  {/* Name and Email Skeleton */}
                  <div className="h-7 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-36 mb-6 animate-pulse"></div>
                </div>

                {/* User Info Skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-gray-200 rounded mt-1 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-md w-20 mb-1 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Card Skeleton */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Card Title Skeleton */}
                <div className="h-6 bg-gray-200 rounded-md w-40 mb-6 animate-pulse"></div>

                {/* Security Options Skeleton */}
                <div className="space-y-6">
                  {[1, 2].map((item) => (
                    <div key={item}>
                      <div className="h-4 bg-gray-200 rounded-md w-24 mb-2 animate-pulse"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
                        <div className="h-9 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <PasswordSetupModal
          isOpen={showPasswordModal}
          onClose={handlePasswordModalClose}
        />

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
          <p className="text-gray-500">
            Kelola informasi profil, preferensi, dan keamanan akun Anda.
          </p>
        </header>

        {!loading && (!user || !userProfile) ? (
          <div className="text-center"></div>
        ) : !loading && user && userProfile ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="absolute right-4 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profil</span>
                  </Button>
                  <div className="flex flex-col items-center text-center pt-8">
                    <div className="relative group w-32 h-32 mb-4">
                      {userProfile.profile_picture ? (
                        <Image
                          src={userProfile.profile_picture}
                          alt="Profile Picture"
                          width={128}
                          height={128}
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white rounded-full"
                            >
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={handleUploadClick}
                              disabled={isUploadLoading}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {isUploadLoading
                                ? "Mengunggah..."
                                : "Ubah Foto Profil"}
                            </DropdownMenuItem>
                            {userProfile.profile_picture && (
                              <DropdownMenuItem
                                onSelect={() => setShowDeleteDialog(true)}
                                className="text-red-500"
                                disabled={isDeleteLoading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleteLoading
                                  ? "Menghapus..."
                                  : "Hapus Foto Profil"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif"
                      />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-gray-900">
                      {userProfile.name || "Nama Belum Diatur"}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  {(pictureStatus.error || pictureStatus.success) && (
                    <div
                      className={`p-3 rounded-md text-sm mb-4 ${
                        pictureStatus.error
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {pictureStatus.error || pictureStatus.success}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-medium text-gray-800">
                          {userProfile.phone || "Belum diatur"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Alamat</p>
                        <p className="font-medium text-gray-800">
                          {userProfile.address || "Belum diatur"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Keamanan Akun</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canChangePassword && (
                    <div>
                      <Label>Kata Sandi</Label>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                          Atur ulang kata sandi Anda melalui email.
                        </p>
                        <Button
                          onClick={handleChangePassword}
                          variant="outline"
                          disabled={isResetLoading}
                        >
                          {isResetLoading ? "Mengirim..." : "Ubah Kata Sandi"}
                        </Button>
                      </div>
                      {resetSuccess && (
                        <p className="text-green-600 mt-2">
                          Email reset kata sandi telah dikirim.
                        </p>
                      )}
                      {resetError && (
                        <p className="text-red-600 mt-2">{resetError}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <Label>Ubah Email</Label>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">
                        Ubah alamat email yang terhubung dengan akun Anda.
                      </p>
                      <Button onClick={handleChangeEmail} variant="outline">
                        Ubah Email
                      </Button>
                    </div>
                    {changeEmailSuccess && (
                      <p className="text-green-600 mt-2">
                        {changeEmailSuccess}
                      </p>
                    )}
                    {changeEmailError && (
                      <p className="text-red-600 mt-2">{changeEmailError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {/* Dialogs */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Foto Profil</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan. Yakin?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
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

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={handleEditDialogClose}>
          <DialogContent className="max-w-md ">
            <DialogHeader>
              <DialogTitle>Edit Profil</DialogTitle>
              <DialogDescription>
                Ubah informasi profil Anda di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={editFormData.name}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  className={editErrors.name ? "border-red-500" : ""}
                />
                {editErrors.name && (
                  <p className="text-red-500 text-sm">{editErrors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={editFormData.phone}
                  onChange={(e) =>
                    handleEditFormChange("phone", e.target.value)
                  }
                  className={editErrors.phone ? "border-red-500" : ""}
                />
                {editErrors.phone && (
                  <p className="text-red-500 text-sm">{editErrors.phone}</p>
                )}
                <p className="text-gray-500 text-xs">
                  Format: 08xx, 62xx, atau +62xx
                </p>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="edit-address">Alamat</Label>
                <Textarea
                  id="edit-address"
                  placeholder="Masukkan alamat lengkap"
                  value={editFormData.address}
                  onChange={(e) =>
                    handleEditFormChange("address", e.target.value)
                  }
                  className={editErrors.address ? "border-red-500" : ""}
                  rows={3}
                />
                {editErrors.address && (
                  <p className="text-red-500 text-sm">{editErrors.address}</p>
                )}
              </div>

              {/* Error Message */}
              {profileUpdateError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {profileUpdateError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleEditDialogClose}
                disabled={isEditLoading}
              >
                Batal
              </Button>
              <Button onClick={handleEditSubmit} disabled={isEditLoading}>
                {isEditLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Confirmation Dialog */}
        <Dialog
          open={showEditConfirmDialog}
          onOpenChange={setShowEditConfirmDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Perubahan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menyimpan perubahan profil ini?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditConfirmDialog(false)}
                disabled={isEditLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmEditSubmit}
                disabled={isEditLoading}
              >
                {isEditLoading ? "Menyimpan..." : "Ya, Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation Dialog */}
        <Dialog
          open={showResetPasswordConfirmDialog}
          onOpenChange={setShowResetPasswordConfirmDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Reset Password</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mengirim link reset password ke email
                Anda?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordConfirmDialog(false)}
                disabled={isResetLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmResetPassword}
                disabled={isResetLoading}
              >
                {isResetLoading ? "Mengirim..." : "Ya, Kirim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Email Dialog */}
        <Dialog
          open={showChangeEmailDialog}
          onOpenChange={handleChangeEmailDialogClose}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ubah Alamat Email</DialogTitle>
              <DialogDescription>
                Masukkan alamat email baru. Link konfirmasi akan dikirim ke
                email baru Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Email Saat Ini</Label>
                <Input
                  id="current-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">Email Baru</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Masukkan email baru"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setChangeEmailError("");
                  }}
                  className={changeEmailError ? "border-red-500" : ""}
                />
              </div>

              {changeEmailError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {changeEmailError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleChangeEmailDialogClose}
                disabled={isChangeEmailLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleChangeEmailSubmit}
                disabled={isChangeEmailLoading}
              >
                Lanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Email Confirmation Dialog */}
        <Dialog
          open={showChangeEmailConfirmDialog}
          onOpenChange={setShowChangeEmailConfirmDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Perubahan Email</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mengubah email ke{" "}
                <strong>{newEmail}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowChangeEmailConfirmDialog(false)}
                disabled={isChangeEmailLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmChangeEmail}
                disabled={isChangeEmailLoading}
              >
                {isChangeEmailLoading ? "Memproses..." : "Ya, Ubah Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
