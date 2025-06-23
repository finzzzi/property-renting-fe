"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/lib/validationSchemas";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, checkEmailExists } = useAuth();

  const initialValues: ForgotPasswordFormValues = {
    email: "",
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      const emailExists = await checkEmailExists(values.email);

      if (!emailExists) {
        setError("Email belum terdaftar");
        return;
      }

      await resetPassword(values.email);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error sending reset password email:", error);
      if (error.message === "User not found") {
        setError("Email tidak ditemukan");
      } else {
        setError("Terjadi kesalahan saat mengirim email reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? "Email Berhasil Dikirim!" : "Reset Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Silakan cek email dan ikuti instruksi untuk mereset password.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Tutup
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-gray-600 mb-6">
                Masukkan email Anda untuk menerima link reset password.
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={forgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isValid, dirty }) => (
                  <Form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contoh@gmail.com"
                        disabled={isLoading}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-slate-700 text-sm"
                      />
                    </div>

                    {error && (
                      <div className="text-slate-700 text-sm text-center">
                        {error}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || !isValid || !dirty}
                      >
                        {isLoading ? "Memeriksa email..." : "Kirim Link"}
                      </Button>
                    </div>
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
