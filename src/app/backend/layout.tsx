"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FloatingActionButtons from "~/components/FloatingActionButtons";

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      await signIn("credentials", { email, password, callbackUrl: "/backend" });
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") return;
      
      if (!session) {
        setIsChecking(false);
        return;
      }

      // Check if user is backend user
      try {
        const response = await fetch("/api/check-backend-user");
        const data = await response.json() as { isBackendUser: boolean };
        
        if (!data.isBackendUser) {
          setErrorMessage("You are not authorized. Please login with backend credentials.");
        }
      } catch (error) {
        console.error("Error checking backend user:", error);
        setErrorMessage("Error checking authorization. Please try again.");
      }
      
      setIsChecking(false);
    };

    void checkAccess();
  }, [session, status]);

  const navigationItems = [
    { name: "Dashboard", href: "/backend" },
    { name: "Kontingente", href: "/backend/reserves" },
    { name: "Liefermethoden", href: "/backend/delivery-methods" },
    { name: "Karten", href: "/backend/tickets" },
    { name: "Käufer", href: "/backend/buyers" },
    { name: "Absolventen Import", href: "/backend/import-alumni" },
  ];

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show login form if no session or if session exists but user is not backend user
  if (!session || (session && errorMessage)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Backend Login</h1>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email Adresse"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Passwort"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Übertrage..." : "Einloggen"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 backend-layout backend-bg">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex flex-col justify-center items-center text-gray-500">
                <span className="text-lg font-light tracking-wider text-gray-600">HTL Ball 2026</span>
                <span className="text-xs font-bold tracking-widest uppercase text-violet-600">Backend</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? "border-violet-400 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name ?? session?.user?.email}
              </span>
              <button
                onClick={session ? () => signOut() : () => router.push("/backend/login")}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                {session ? "Abmelden": "Anmelden"}
              </button>
            </div>
          </div>
        </div>
      </nav>    

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
}
