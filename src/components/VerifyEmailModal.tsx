"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  fullName: string;
  role: "traveler" | "owner";
}

export default function VerifyEmailModal({
  isOpen,
  onClose,
  email,
  fullName,
  role,
}: VerifyEmailModalProps) {
  const [countdown, setCountdown] = useState(10);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const { signInWithEmail } = useAuth();

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isOpen && countdown === 0) {
      setIsResendDisabled(false);
    }
  }, [countdown, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      setIsResendDisabled(true);
      setResendMessage("");
    }
  }, [isOpen]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      await signInWithEmail(email, fullName, role);
      setResendMessage("Email verifikasi telah dikirim ulang!");

      setCountdown(10);
      setIsResendDisabled(true);
    } catch (error) {
      console.error("Error resending email:", error);
      setResendMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full relative">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            Email Verifikasi Terkirim!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Mail className="h-16 w-16 text-blue-500" />
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">Silakan cek email Anda</p>
            <p className="font-semibold text-gray-900 break-all">{email}</p>
          </div>

          {/* Resend Email Section */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-900 pb-2">Belum menerima email?</p>
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResendDisabled || isResending}
                variant="outline"
                className="w-full text-white bg-slate-800 hover:bg-slate-900 hover:text-white cursor-pointer"
              >
                {isResending
                  ? "Mengirim ulang..."
                  : isResendDisabled
                  ? `Kirim ulang email (${countdown}s)`
                  : "Kirim ulang email verifikasi"}
              </Button>

              {resendMessage && (
                <div
                  className={`text-sm text-center ${
                    resendMessage.includes("Terjadi kesalahan")
                      ? "text-red-600"
                      : "text-slate-800"
                  }`}
                >
                  {resendMessage}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
