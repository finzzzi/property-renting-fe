"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "@/contexts/AuthContext";
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/lib/validationSchemas";

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { updatePasswordWithToken, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialValues: ResetPasswordFormValues = {
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      await updatePasswordWithToken(values.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError("Terjadi kesalahan saat mengubah password. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSuccess ? "Password Berhasil Diubah!" : "Buat Password Baru"}
          </h2>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {isSuccess ? "Berhasil!" : "Reset Password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">
                    Password berhasil diubah. Silakan login dengan password baru
                    Anda.
                  </p>
                </div>

                <Button onClick={handleBackToLogin} className="w-full">
                  Kembali ke Login
                </Button>
              </div>
            ) : (
              <>
                <Formik
                  initialValues={initialValues}
                  validationSchema={resetPasswordSchema}
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
                          disabled={isLoading}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Konfirmasi Password Baru
                        </Label>
                        <Field
                          as={Input}
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          disabled={isLoading}
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-600 text-sm"
                        />
                      </div>

                      {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                          {error}
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleBackToLogin}
                          disabled={isLoading}
                        >
                          Kembali
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isLoading || !isValid || !dirty}
                        >
                          {isLoading ? "Mengubah..." : "Ubah Password"}
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
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
