"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function EmailChangePending() {
  const [message, setMessage] = useState(
    "Link konfirmasi diterima. Silakan konfirmasi link yang dikirim ke email lainnya untuk menyelesaikan proses perubahan email."
  );

  useEffect(() => {
    // Coba ambil message dari hash jika ada
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashMessage = hashParams.get("message");
      if (hashMessage) {
        // Decode pluses and spaces
        setMessage(decodeURIComponent(hashMessage.replace(/\+/g, " ")));
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            Konfirmasi Email (1/2)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-gray-600 whitespace-pre-line">
            Konfirmasi diterima. Silakan lanjutkan untuk mengonfirmasi link yang
            dikirim ke email lain.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
