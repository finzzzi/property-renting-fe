"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  passwordSetupSchema,
  PasswordSetupFormValues,
} from "@/lib/validationSchemas";

interface PasswordSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordSetupModal({
  isOpen,
  onClose,
}: PasswordSetupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { updatePassword, refreshUserSession, userProfile } = useAuth();
  const router = useRouter();

  const initialValues: PasswordSetupFormValues = {
    password: "",
    confirmPassword: "",
  };

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

  const handleSubmit = async (values: PasswordSetupFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      await updatePassword(values.password);
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
            {isSuccess
              ? "Password Berhasil Disimpan!"
              : `Selamat Datang ${userProfile?.name}!`}
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

              <Formik
                initialValues={initialValues}
                validationSchema={passwordSetupSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password Baru</Label>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Masukkan password baru"
                        disabled={isLoading}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-slate-700 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Konfirmasi Password
                      </Label>
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Konfirmasi password baru"
                        disabled={isLoading}
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-slate-700 text-sm"
                      />
                    </div>

                    {error && (
                      <div className="text-slate-700 text-sm text-center">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !isValid || !dirty}
                    >
                      {isLoading ? "Menyimpan..." : "Simpan Password"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
