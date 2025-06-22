"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface PasswordSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordSetupModal({
  isOpen,
  onClose,
}: PasswordSetupModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { updatePassword, refreshUserSession } = useAuth();
  const router = useRouter();

  const handleContinue = useCallback(async () => {
    setIsContinueLoading(true);
    try {
      await refreshUserSession();
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      setIsContinueLoading(false);
    }
  }, [refreshUserSession, onClose, router]);

  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      handleContinue();
    }
  }, [isSuccess, countdown, handleContinue]);

  useEffect(() => {
    if (isSuccess) {
      setCountdown(5);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(password);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Terjadi kesalahan saat menyimpan password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? "Password Berhasil Disimpan!" : "Selamat Datang!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Sekarang Anda dapat menggunakan semua fitur aplikasi.
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full"
                disabled={isContinueLoading}
              >
                {isContinueLoading ? "Memuat..." : `Lanjutkan (${countdown})`}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-6">
                Silakan buat password baru untuk melanjutkan.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password baru"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="text-gray-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Password"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
