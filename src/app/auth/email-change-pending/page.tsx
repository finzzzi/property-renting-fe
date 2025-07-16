"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EmailChangePending() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));

      // Success / info message
      const hashMessage = hashParams.get("message");
      if (hashMessage) {
        setMessage(decodeURIComponent(hashMessage.replace(/\+/g, " ")));
      }

      // Error handling (expired, invalid, etc.)
      const errorCode = hashParams.get("error_code");
      const errorDesc = hashParams.get("error_description");
      if (errorCode || errorDesc) {
        const readable = errorDesc
          ? decodeURIComponent(errorDesc.replace(/\+/g, " "))
          : "Link tidak valid atau sudah kedaluwarsa.";
        setErrorMessage(readable);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            {errorMessage ? "Link Tidak Valid" : "Konfirmasi Email (1/2)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {errorMessage ? (
            <div className="flex flex-col items-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <p className="text-gray-600 text-sm">
                Silakan minta penggantian email kembali.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-gray-600 whitespace-pre-line">
                {message ||
                  "Link konfirmasi diterima. Silakan konfirmasi link yang dikirim ke email lainnya untuk menyelesaikan proses perubahan email."}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/login">
              <Button className="w-full">Kembali ke halaman login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
