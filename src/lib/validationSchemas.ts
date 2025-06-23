import * as Yup from "yup";

export const registrationSchema = Yup.object({
  nama: Yup.string()
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .required("Nama lengkap wajib diisi")
    .matches(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi")
    .lowercase(),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi")
    .lowercase()
    .trim(),
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
});

export const passwordSetupSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .max(50, "Password maksimal 50 karakter")
    .required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([Yup.ref("password")], "Konfirmasi password tidak cocok"),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi")
    .lowercase()
    .trim(),
});

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .max(50, "Password maksimal 50 karakter")
    .required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([Yup.ref("password")], "Konfirmasi password tidak cocok"),
});

export interface RegistrationFormValues {
  nama: string;
  email: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface PasswordSetupFormValues {
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}
