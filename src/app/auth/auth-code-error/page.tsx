"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
  const getErrorMessage = () => {
    return {
      title: "Link Verifikasi Tidak Valid",
      message: "Link verifikasi email kadaluarsa atau tidak valid",
      icon: "⚠️",
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-6xl">{errorInfo.icon}</div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">{errorInfo.message}</p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link href="/register">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Daftar Ulang
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
