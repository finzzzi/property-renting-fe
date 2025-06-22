# Auth Module - Modular Architecture

Modul auth ini telah di-refactor menjadi struktur yang lebih modular untuk meningkatkan maintainability dan reusability.

## Struktur File

```
src/lib/auth/
├── index.ts                 # Barrel export untuk semua modul
├── types.ts                 # Interface dan type definitions
├── authOperations.ts        # Operasi authentication (sign in, sign out, dll)
├── userOperations.ts        # Operasi user profile
├── validationOperations.ts  # Operasi validasi dan pengecekan
├── oauthOperations.ts       # Operasi OAuth dan helper functions
└── README.md               # Dokumentasi ini
```

## Deskripsi Modul

### 1. `types.ts`

Berisi semua interface dan type definitions yang digunakan di seluruh auth module:

- `UserProfile` - Interface untuk profil user
- `EmailStatusResult` - Result dari pengecekan status email
- `UserRoleResult` - Result dari pengecekan role user
- `AuthContextType` - Type untuk Auth Context

### 2. `authOperations.ts`

Berisi operasi-operasi authentication utama:

- `signInWithGoogle()` - Sign in dengan Google OAuth
- `signInWithFacebook()` - Sign in dengan Facebook OAuth
- `signInWithEmail()` - Sign in dengan email (OTP)
- `signInWithPassword()` - Sign in dengan email dan password
- `updatePassword()` - Update password user
- `signOut()` - Sign out user
- `refreshUserSession()` - Refresh session user

### 3. `userOperations.ts`

Berisi operasi-operasi yang berkaitan dengan user profile:

- `fetchUserProfile()` - Mengambil profil user dari database

### 4. `validationOperations.ts`

Berisi operasi-operasi validasi dan pengecekan:

- `checkEmailExists()` - Cek apakah email sudah ada di database
- `checkEmailStatus()` - Cek status email (ada dan verified atau tidak)
- `checkUserRole()` - Cek role user berdasarkan email

### 5. `oauthOperations.ts`

Berisi operasi-operasi OAuth dan helper functions:

- `isEmailProvider()` - Helper untuk cek apakah user menggunakan email provider
- `updateOAuthUserRole()` - Update role untuk OAuth user

### 6. `index.ts`

Barrel export yang mengekspor semua fungsi dari modul-modul di atas untuk kemudahan import.

## Cara Penggunaan

### Import di AuthContext

```typescript
import {
  AuthContextType,
  UserProfile,
  signInWithGoogle,
  signInWithFacebook,
  // ... fungsi lainnya
} from "@/lib/auth";
```

### Import di komponen lain (jika diperlukan)

```typescript
import { checkEmailExists, fetchUserProfile } from "@/lib/auth";
```
