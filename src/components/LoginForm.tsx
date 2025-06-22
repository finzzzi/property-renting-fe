import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema, LoginFormValues } from "@/lib/validationSchemas";

interface LoginFormProps {
  type: "traveler" | "owner";
  onGoogleSignIn: () => void;
  onFacebookSignIn: () => void;
}

export default function LoginForm({
  type,
  onGoogleSignIn,
  onFacebookSignIn,
}: LoginFormProps) {
  const isOwner = type === "owner";
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { signInWithPassword, checkEmailExists, checkUserRole } = useAuth();

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const emailExists = await checkEmailExists(values.email);

      if (!emailExists) {
        setLoginError("Email belum terdaftar");
        return;
      }

      const userRoleResult = await checkUserRole(values.email);

      if (userRoleResult.exists && userRoleResult.role) {
        if (userRoleResult.role !== type) {
          const currentRole =
            userRoleResult.role === "traveler" ? "traveler" : "owner";
          setLoginError(
            `Akun anda terdaftar sebagai ${currentRole}, silakan masuk sesuai jenis akun`
          );
          return;
        }
      }

      try {
        await signInWithPassword(values.email, values.password);
      } catch (passwordError) {
        console.error("Password error:", passwordError);
        setLoginError("Password yang Anda masukkan salah");
        return;
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginError("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-1/2 space-y-3 sm:space-y-4 px-2 sm:px-1">
      <div className="text-center p-2 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          {isOwner
            ? "🏨 Masuk sebagai pemilik properti"
            : "🛌 Masuk sebagai pencari penginapan"}
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ isValid, dirty }) => (
          <Form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`email-${type}`}>Email</Label>
              <Field
                as={Input}
                id={`email-${type}`}
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
                <Label htmlFor={`password-${type}`}>Kata Sandi</Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <Field
                as={Input}
                id={`password-${type}`}
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
              {isLoading
                ? "Memproses..."
                : `Masuk sebagai ${isOwner ? "Owner" : "Traveler"}`}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Social Login Section */}
      <div className="mt-4 sm:mt-6">
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

        <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="w-full h-10 sm:h-12 text-xs sm:text-sm"
            onClick={onGoogleSignIn}
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
            className="w-full h-10 sm:h-12 text-xs sm:text-sm"
            onClick={onFacebookSignIn}
          >
            <svg className="w-5 h-5 mr-2" fill="#1877f2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
