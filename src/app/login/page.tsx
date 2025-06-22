"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema, LoginFormValues } from "@/lib/validationSchemas";

export default function Login() {
  const { signInWithGoogle, signInWithFacebook, user, signInWithPassword } =
    useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    try {
      await signInWithPassword(values.email, values.password);
    } catch (error) {
      console.error("Error signing in:", error);
      setLoginError("Email atau password tidak valid");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      localStorage.setItem("selectedRole", "traveler");
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      localStorage.setItem("selectedRole", "traveler");
      await signInWithFacebook();
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-5">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Selamat Datang Kembali
            </h2>
          </div>

          <Card className="w-full border-0 shadow-none">
            <CardContent className="pt-6">
              <Formik
                initialValues={initialValues}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
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
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-slate-700 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <a
                          href="/forgot-password"
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Lupa kata sandi?
                        </a>
                      </div>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-slate-700 text-sm"
                      />
                    </div>

                    {loginError && (
                      <div className="text-slate-700 text-sm text-center">
                        {loginError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-800"
                      disabled={isLoading || !isValid || !dirty}
                    >
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </Form>
                )}
              </Formik>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Atau masuk dengan
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285f4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34a853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#fbbc05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#ea4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleFacebookSignIn}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="#1877f2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <a
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Daftar di sini
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Beautiful hotel lobby"
          fill
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    </div>
  );
}
