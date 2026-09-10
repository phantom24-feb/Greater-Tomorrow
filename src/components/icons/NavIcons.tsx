export type NavIconName =
  | "results"
  | "tuition"
  | "register"
  | "books"
  | "account"
  | "settings"
  | "home"
  | "dashboard"
  | "students"
  | "announcements"
  | "logout";

interface NavIconProps {
  name: NavIconName;
}

export function NavIcon({ name }: NavIconProps) {
  switch (name) {
    case "results":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M8.5 13.5l2 2 4-4.5" />
        </svg>
      );
    case "tuition":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.2c0-1.1 1-2 2.5-2s2.5.7 2.5 1.7c0 2.4-5 1.6-5 4.3 0 1.1 1.1 1.9 2.5 1.9s2.5-.8 2.5-1.9" />
          <path d="M12 6v1.3M12 16.7V18" />
        </svg>
      );
    case "register":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
          <circle cx="9" cy="10.3" r="2" />
          <path d="M5.8 16.5c.6-1.7 1.9-2.6 3.2-2.6s2.6.9 3.2 2.6" />
          <path d="M15 9.5h3.2M15 12.5h3.2" />
        </svg>
      );
    case "books":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <path d="M4 5.5C5.5 4.6 7.5 4.2 9 4.5c1 .2 1.8.6 2.5 1.1V19c-.7-.5-1.5-.9-2.5-1.1-1.5-.3-3.5.1-5 1V5.5Z" />
          <path d="M20 5.5c-1.5-.9-3.5-1.3-5-1-1 .2-1.8.6-2.5 1.1V19c.7-.5 1.5-.9 2.5-1.1 1.5-.3 3.5.1 5 1V5.5Z" />
        </svg>
      );
    case "account":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
        </svg>
      );
    case "settings":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
        </svg>
      );
    case "dashboard":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="1.2" />
        </svg>
      );
    case "home":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <path d="m3.5 10.5 8.5-7 8.5 7" />
          <path d="M5.5 9.5v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-10M9.5 20.5v-6h5v6" />
        </svg>
      );
    case "students":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <circle cx="8.5" cy="8" r="2.8" />
          <circle cx="16.5" cy="9" r="2.2" />
          <path d="M3.5 19c.8-2.9 2.9-4.5 5-4.5s4.2 1.6 5 4.5" />
          <path d="M14.8 14.8c1.7.1 3.3 1.5 3.9 4" />
        </svg>
      );
    case "announcements":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <path d="M3 10.5v3a1 1 0 0 0 1 1h1.8l3.6 3.2c.6.6 1.6.1 1.6-.7v-9.2c0-.8-1-1.3-1.6-.7L5.8 9.5H4a1 1 0 0 0-1 1Z" />
          <path d="M14.5 8c1.8 1 3 2.6 3 4.5s-1.2 3.5-3 4.5" />
          <path d="M14.5 4.5c3.2 1.5 5.5 4.4 5.5 8s-2.3 6.5-5.5 8" />
        </svg>
      );
    case "logout":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-full w-full"
        >
          <path d="M9 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h3" />
          <path d="M14.5 16.5 19 12l-4.5-4.5" />
          <path d="M19 12H9" />
        </svg>
      );
    default:
      return null;
  }
}
