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
import { useEffect, useState, useRef } from "react";
import PasswordSetupModal from "@/components/PasswordSetupModal";
import { createClient } from "@/lib/supabase/client";

interface EditFormData {
  name: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const { user, userProfile, session, loading, resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState("");
  const [profileUpdateError, setProfileUpdateError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [showResetPasswordConfirmDialog, setShowResetPasswordConfirmDialog] =
    useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showChangeEmailConfirmDialog, setShowChangeEmailConfirmDialog] =
    useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isChangeEmailLoading, setIsChangeEmailLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changeEmailError, setChangeEmailError] = useState("");
  const [changeEmailSuccess, setChangeEmailSuccess] = useState("");
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    phone: "",
    address: "",
  });
  const [editErrors, setEditErrors] = useState<Partial<EditFormData>>({});
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

  // Initialize edit form data when profile is loaded or dialog opens
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

  // Handle email change confirmation from URL parameter
  useEffect(() => {
    const emailChanged = searchParams.get("email_changed");
    if (emailChanged === "true") {
      setChangeEmailSuccess(
        "Email berhasil diubah! Silakan login kembali jika diperlukan."
      );
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("email_changed");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
  };

  const handleChangePassword = () => {
    setShowResetPasswordConfirmDialog(true);
  };

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

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field

    // Remove all spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Check format patterns
    const patterns = [
      /^0\d{7,12}$/, // 0812345678 (8-13 digits total)
      /^62\d{8,12}$/, // 62812345678 (10-14 digits total)
      /^\+62\d{8,12}$/, // +62812345678 (11-15 chars total)
    ];

    return patterns.some((pattern) => pattern.test(cleanPhone));
  };

  const validateEditForm = (): boolean => {
    const errors: Partial<EditFormData> = {};
    let isValid = true;

    // Check if at least one field is filled
    const hasData =
      editFormData.name.trim() ||
      editFormData.phone.trim() ||
      editFormData.address.trim();
    if (!hasData) {
      setProfileUpdateError(
        "Minimal harus ada satu field yang akan diupdate (nama, phone, atau alamat)"
      );
      return false;
    }

    // Validate name
    if (editFormData.name.trim() && editFormData.name.trim().length === 0) {
      errors.name = "Nama tidak boleh kosong";
      isValid = false;
    }

    // Validate phone
    if (editFormData.phone.trim() && !validatePhoneNumber(editFormData.phone)) {
      errors.phone =
        "Format nomor telepon tidak valid. Gunakan format 0xxx, 62xxx, atau +62xxx";
      isValid = false;
    }

    setEditErrors(errors);
    if (!isValid) {
      setProfileUpdateError("");
    }
    return isValid;
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error when user starts typing
    if (editErrors[field]) {
      setEditErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear general error message
    if (profileUpdateError) {
      setProfileUpdateError("");
    }
  };

  const handleEditSubmit = () => {
    if (!validateEditForm()) return;
    setShowEditConfirmDialog(true);
  };

  const handleConfirmEditSubmit = async () => {
    setIsEditLoading(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");
    setShowEditConfirmDialog(false);

    try {
      // Prepare data - only send non-empty fields
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
        setProfileUpdateSuccess("Profile berhasil diupdate");
        setShowEditDialog(false);
        // Refresh halaman untuk update data profil
        window.location.reload();
      } else {
        setProfileUpdateError(data.message || "Gagal mengupdate profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setProfileUpdateError("Terjadi kesalahan saat mengupdate profile");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setEditErrors({});
    setProfileUpdateError("");
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChangeEmail = () => {
    setShowChangeEmailDialog(true);
  };

  const handleChangeEmailSubmit = () => {
    if (!newEmail.trim()) {
      setChangeEmailError("Email baru harus diisi");
      return;
    }

    if (!validateEmail(newEmail)) {
      setChangeEmailError("Format email tidak valid");
      return;
    }

    if (newEmail === user?.email) {
      setChangeEmailError("Email baru tidak boleh sama dengan email saat ini");
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
          <CardHeader className="flex flex-row items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profil</span>
            </Button>
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
                  <p className="font-medium">{user?.email}</p>
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

                {/* Change Email Section */}
                <div className="flex gap-2 items-center justify-between pt-4 border-t">
                  <div>
                    <h3 className="font-medium">Alamat Email</h3>
                    <p className="text-sm text-gray-500">
                      Ubah alamat email akun Anda
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangeEmail}
                    disabled={isChangeEmailLoading}
                    className="flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>
                      {isChangeEmailLoading ? "Memproses..." : "Ubah Email"}
                    </span>
                  </Button>
                </div>

                {/* Change Email Success Message */}
                {changeEmailSuccess && (
                  <div className="text-green-600 bg-green-50 p-3 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Berhasil!</span>
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {changeEmailSuccess}
                    </div>
                  </div>
                )}

                {/* Change Email Error Message */}
                {changeEmailError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {changeEmailError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>Ubah informasi profil Anda.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
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
                onChange={(e) => handleEditFormChange("phone", e.target.value)}
                className={editErrors.phone ? "border-red-500" : ""}
              />
              {editErrors.phone && (
                <p className="text-red-500 text-sm">{editErrors.phone}</p>
              )}
              <p className="text-gray-500 text-xs">
                Format yang diterima: 0xxx, 62xxx, atau +62xxx
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
              {isEditLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Confirmation Dialog */}
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
            <Button onClick={handleConfirmEditSubmit} disabled={isEditLoading}>
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
              Masukkan alamat email baru. Link konfirmasi akan dikirim ke email
              baru Anda.
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
