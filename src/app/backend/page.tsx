import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import DashboardStats from "~/components/DashboardStats";
import SalesKillSwitch from "~/components/SalesKillSwitch";
import { db } from "~/server/db";
import { shouldShowCard } from "~/config/backendPermissions";
import type { CSSProperties, ReactElement } from "react";

type Section = {
    title: string;
    description: string;
    href: string;
    hoverBg: string;
    iconBg: string;
    titleHover: string;
    hoverColor: string;
    icon: ReactElement;
};

// Move sections outside component to prevent recreation on every render
const sections: ReadonlyArray<Section> = [
    {
      title: "Kontingente",
      description: "Verwalte Karten-Kontingente und Begrenzungen",
      href: "/backend/reserves",
      hoverBg: "hover:bg-blue-50",
      iconBg: "bg-blue-500 hover:bg-blue-600",
      titleHover: "group-hover:text-blue-600",
      hoverColor: "rgba(59,130,246,0.5)",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Liefermethoden",
      description: "Verwalte Versandmethoden und Zuschläge",
      href: "/backend/delivery-methods",
      hoverBg: "hover:bg-teal-50",
      iconBg: "bg-teal-500 hover:bg-teal-600",
      titleHover: "group-hover:text-teal-600",
      hoverColor: "rgba(20,184,166,0.5)",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      title: "Käufer Übersicht",
      description: "Übersicht über alle registrierten Käufer",
      href: "/backend/buyers",
      hoverBg: "hover:bg-purple-50",
      iconBg: "bg-purple-500 hover:bg-purple-600",
      titleHover: "group-hover:text-purple-600",
      hoverColor: "rgba(168,85,247,0.5)",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Absolventen Import",
      description: "Importiere Absolventen E-Mails",
      href: "/backend/import-alumni",
      hoverBg: "hover:bg-green-50",
      iconBg: "bg-green-500 hover:bg-green-600",
      titleHover: "group-hover:text-green-600",
      hoverColor: "rgba(34,197,94,0.5)",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
    },
];

type Props = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

export default async function BackendDashboard(props: Props) {
    // Handle both sync and async searchParams (Next.js 13+ vs 14+)
    const searchParams = props.searchParams instanceof Promise 
      ? await props.searchParams 
      : props.searchParams ?? {};
    const session = await getServerSession(authOptions);
    const fullName = session?.user?.name ?? session?.user?.email ?? "im Backend";
    const displayName = fullName.includes(' ') ? fullName.split(' ')[0] : fullName;

    // Get user's group
    let groupName: string | null = null;
    if (session?.user?.email) {
      const backendUser = await db.backendUsers.findUnique({
        where: { email: session.user.email },
        include: { group: true },
      });
      groupName = backendUser?.group?.name ?? null;
    }

    // Filter sections based on permissions
    const visibleSections = sections.filter((section) =>
      shouldShowCard(groupName, section.title)
    );

    const errorMessage = searchParams?.error;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen {displayName}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Wähle einen Bereich aus, um mit der Verwaltung zu beginnen.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
      
      {groupName === null ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Keiner Gruppe zugewiesen
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Du wurdest noch keiner Gruppe zugewiesen. Bitte kontaktieren einen Administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : visibleSections.length > 0 ? (
        <div className="-mt-2 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className={`group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${section.hoverBg} backend-layout card`}
              style={{ "--backend-card-hover": section.hoverColor } as CSSProperties}
            >
              <div>
                <span className={`inline-flex p-3 rounded-lg text-white ${section.iconBg}`}>
                  {section.icon}
                </span>
              </div>
              <div className="mt-4">
                <h3 className={`text-lg font-medium text-gray-900 ${section.titleHover}`}>
                  {section.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {section.description}
                </p>
              </div>
              <span
                className="absolute top-4 right-4 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <p className="text-gray-600">
            Keine Bereiche verfügbar.
          </p>
        </div>
      )}
      
      {/* Sales Kill Switch - Only for Admin */}
      {groupName === "Admin" && (
        <div className="mt-6">
          <SalesKillSwitch />
        </div>
      )}

      {/* Dashboard Stats Overview - Only for Admin */}
      {groupName === "Admin" && (
        <div className="-mt-6 py-8">
          <DashboardStats />
        </div>
      )}      
    </div>
  );
}
