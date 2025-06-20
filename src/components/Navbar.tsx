import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="w-full bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className="text-2xl text-white font-bold"
              style={{ fontFamily: "var(--font-fira-sans)" }}
            >
              Stay.in
            </span>
          </Link>

          {/* Login dan Register Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-900 hover:text-white font-bold"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
              asChild
            >
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
