import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import DashboardStats from "~/components/DashboardStats";

// Move sections outside component to prevent recreation on every render
const sections = [
    {
      title: "Kontingente",
      description: "Verwalte Karten-Kontingente",
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
      title: "Verkaufte Karten",
      description: "Übersicht über verkaufte Karten",
      href: "/backend/tickets",
      hoverBg: "hover:bg-orange-50",
      iconBg: "bg-orange-500 hover:bg-orange-600",
      titleHover: "group-hover:text-orange-600",
      hoverColor: "rgba(249,115,22,0.5)",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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

export default async function BackendDashboard() {
    const session = await getServerSession(authOptions);
    const fullName = session?.user?.name ?? session?.user?.email ?? "im Backend";
    const displayName = fullName.includes(' ') ? fullName.split(' ')[0] : fullName;

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className={`group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${section.hoverBg} backend-layout card`}
            style={{ ["--backend-card-hover" as any]: section.hoverColor }}
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
      {/* Dashboard Stats Overview */}
      <div className="-mt-6 py-8">
        <DashboardStats />
      </div>      
    </div>
  );
}
