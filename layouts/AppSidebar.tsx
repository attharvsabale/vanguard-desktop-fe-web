"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { getInitials, useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  {
    label: "Clients",
    href: "/bd/clients",
    icon: Users,
    matches: (path: string) => path.startsWith("/bd/clients"),
  },
];

export default function AppSidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitials = user?.name ? getInitials(user.name) : "U";

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <aside className="w-[220px] shrink-0 bg-[#0A1B3D] text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <span className="text-[11px] tracking-[0.16em] font-semibold text-[#7A8AAE]">
          FINANCETEST
        </span>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.matches(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium transition
                    ${
                      active
                        ? "bg-white/[0.06] text-[#22D3A8]"
                        : "text-[#C7D0E4] hover:bg-white/[0.04] hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-[#0F2452] border border-white/10 flex items-center justify-center text-[12px] font-semibold text-[#22D3A8]">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {userName}
            </p>
            <p className="text-[11px] text-[#8C9AB8] truncate">{userEmail}</p>
          </div>
          <button
            type="button"
            aria-label="Logout"
            onClick={handleLogout}
            className="text-[#8C9AB8] hover:text-white transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
