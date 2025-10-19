import Link from "next/link";

export default function BackendDashboard() {
  const sections = [
    {
      title: "Ticket Kontingente",
      description: "Verwalten Sie verfügbare Ticket-Kontingente und Preise",
      href: "/backend/reserves",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Verkaufte Tickets",
      description: "Übersicht über verkaufte Tickets und Statistiken",
      href: "/backend/tickets",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Benutzer Verwaltung",
      description: "Verwalten Sie Backend-Benutzer und Berechtigungen",
      href: "/backend/users",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Test",
      description: "Das ist eine Testkarte",
      href: "/backend/test",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Willkommen im Backend
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Wählen Sie einen Bereich aus, um mit der Verwaltung zu beginnen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div>
              <span className={`inline-flex p-3 rounded-lg ${section.color} text-white`}>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
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
    </div>
  );
}
