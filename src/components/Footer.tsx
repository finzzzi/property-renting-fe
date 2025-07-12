import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-auto relative z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Stay.in Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Tentang Stay.in</h3>
            <ul className="space-y-2 text-base text-gray-400 font-semibold">
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Cara Memesan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Karir
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Cicilan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Fitur Rilis Terbaru
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Dukungan</h3>
            <ul className="space-y-2 text-base text-gray-400 font-semibold">
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Laporkan Masalah Keamanan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Ajukan Keluhan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Kebijakan Cookie
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Syarat Penggunaan
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Ikuti Kami</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className="text-base font-semibold">Facebook</span>
              </a>

              <a
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </div>
                <span className="text-base font-semibold">Instagram</span>
              </a>

              <a
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <span className="text-base font-semibold">TikTok</span>
              </a>

              <a
                href="#"
                className="flex items-center space-x-3 text-gray-400 hover:text-gray-300 transition-colors group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Youtube className="w-5 h-5" />
                </div>
                <span className="text-base font-semibold">YouTube</span>
              </a>
            </div>
          </div>

          {/* Download App Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              Download Aplikasi Stay.in
            </h3>
            <div className="space-y-3">
              <a href="#" className="block hover:opacity-80 transition-opacity">
                <img
                  src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v4.6.0/f/f519939e72eccefffb6998f1397901b7.svg"
                  alt="Download di Google Play"
                  className="w-full max-w-[140px] h-auto"
                />
              </a>

              <a href="#" className="block hover:opacity-80 transition-opacity">
                <img
                  src="https://d1785e74lyxkqq.cloudfront.net/_next/static/v4.6.0/1/18339f1ae28fb0c49075916d11b98829.svg"
                  alt="Download di App Store"
                  className="w-full max-w-[140px] h-auto"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            Copyright © 2025 Stay.in - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
