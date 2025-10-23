"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") return;
      
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      // Check if user is backend user
      try {
        const response = await fetch("/api/check-backend-user");
        const data = await response.json() as { isBackendUser: boolean };
        
        if (!data.isBackendUser) {
          router.push("/buyer");
          return;
        }
      } catch (error) {
        console.error("Error checking backend user:", error);
        router.push("/buyer");
        return;
      }
      
      setIsChecking(false);
    };

    void checkAccess();
  }, [session, status, router]);

  const navigationItems = [
    { name: "Dashboard", href: "/backend" },
    { name: "Kontingente", href: "/backend/reserves" },
    { name: "Karten", href: "/backend/tickets" },
    { name: "Benutzer", href: "/backend/buyers" },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Backend Ball Website
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === item.href
                        ? "border-blue-500 text-gray-900"
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
                {session?.user?.email}
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
    </div>
  );
}
