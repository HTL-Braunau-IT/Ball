"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import FloatingActionButtons from "~/components/FloatingActionButtons";
import { FilteredDataProvider } from "~/contexts/FilteredDataContext";
import { shouldShowNavigationItem } from "~/config/backendPermissions";

const navigationItems = [
  { name: "Dashboard", href: "/backend" },
  { name: "Kontingente", href: "/backend/reserves" },
  { name: "Liefermethoden", href: "/backend/delivery-methods" },
  { name: "Käufer", href: "/backend/buyers" },
  { name: "Absolventen Import", href: "/backend/import-alumni" },
] as const;

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
  const [hasAccess, setHasAccess] = useState(false);
  const [groupName, setGroupName] = useState<string | null>(null);

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

      // Check if user is backend user AND authenticated via credentials provider
      try {
        const response = await fetch("/api/check-backend-user");
        const data = await response.json() as { 
          isBackendUser: boolean;
          isCredentialsProvider: boolean;
          hasAccess: boolean;
          provider?: string;
          groupName?: string | null;
        };
        
        setHasAccess(data.hasAccess);
        setGroupName(data.groupName ?? null);
        
        // Only show error if user is authenticated via credentials but not a backend user
        // Don't show error for email provider users - they'll just see the login form
        if (!data.hasAccess && data.isCredentialsProvider && !data.isBackendUser) {
          setErrorMessage("You are not authorized. Please login with backend credentials.");
        }
      } catch (error) {
        console.error("Error checking backend user:", error);
        setErrorMessage("Error checking authorization. Please try again.");
        setHasAccess(false);
        setGroupName(null);
      }
      
      setIsChecking(false);
    };

    void checkAccess();
  }, [session, status]);

  // navigationItems hoisted above to avoid re-creation on re-renders

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Bitte warten...</p>
        </div>
      </div>
    );
  }

  // Show login form if no session or if session exists but user doesn't have access
  if (!session || (session && !hasAccess)) {
    return (
      <div className="min-h-screen backend-layout backend-bg flex items-center justify-center px-4 theme-gold" style={{ background: 'radial-gradient(35% 35% at 20% 30%, rgba(242, 218, 189, 0.60) 0%, rgba(242, 218, 189, 0.38) 22%, rgba(242, 218, 189, 0.00) 60%), radial-gradient(28% 28% at 80% 25%, rgba(230, 190, 140, 0.55) 0%, rgba(230, 190, 140, 0.36) 18%, rgba(230, 190, 140, 0.00) 58%), radial-gradient(30% 30% at 72% 78%, rgba(220, 160, 100, 0.50) 0%, rgba(220, 160, 100, 0.30) 20%, rgba(220, 160, 100, 0.00) 58%), linear-gradient(135deg, #fffaf0 0%, #fdf3e7 45%, #fae8d7 100%)' }}>
        <div className="max-w-md w-full">
          <div className="rounded-xl bg-white/40 backdrop-blur-sm shadow-sm ring-1 ring-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="flex flex-col justify-center items-center text-gray-600 mb-4">
                <span className="text-xl font-medium tracking-wide">HTL Ball 2026</span>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#A5662F' }}>Backend</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Anmeldung</h1>
            </div>
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E6C39A] focus:border-[#E6C39A] bg-white/80 backdrop-blur-sm"
                  placeholder="Email Adresse"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E6C39A] focus:border-[#E6C39A] bg-white/80 backdrop-blur-sm"
                  placeholder="Passwort"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D19A5C] hover:bg-[#B36B2C] text-white py-2.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
              >
                {isLoading ? "Übertrage..." : "Einloggen"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen backend-layout backend-bg">
      {/* Top Navigation Bar */}
      <nav className="border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="mt-6 rounded-xl bg-white/40 backdrop-blur-sm shadow-sm ring-1 ring-gray-200">
            <div className="flex justify-between h-14 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 flex flex-col justify-center items-center text-gray-600 text-center">
                  <span className="text-base font-medium tracking-wide">HTL Ball 2026</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-violet-600">Backend</span>
                </div>
                <div className="hidden sm:flex sm:items-center sm:gap-1">
                  {navigationItems
                    .filter((item) => {
                      // Dashboard is always shown
                      if (item.name === "Dashboard") return true;
                      // Filter based on permissions
                      return shouldShowNavigationItem(groupName, item.name);
                    })
                    .map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                            : "text-gray-600 hover:text-violet-700 hover:bg-violet-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                </div>
              </div>
              
              {/* User info and logout */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">
                  {session?.user?.name ?? session?.user?.email}
                </span>
                <button
                  onClick={session ? () => signOut() : () => router.push("/backend/login")}
                  className={`${
                    session
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                      : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                  } px-3 py-1.5 rounded-md text-sm transition-colors`}
                >
                  {session ? "Abmelden": "Anmelden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>    

      {/* Main content */}
      <FilteredDataProvider>
        <main className="max-w-7xl mx-auto pt-3 pb-6 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Floating Action Buttons */}
        <FloatingActionButtons />
      </FilteredDataProvider>
    </div>
  );
}
