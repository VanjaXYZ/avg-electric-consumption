import { useTranslation } from "react-i18next"
import { NavLink, Outlet } from "react-router-dom"
import { useIsAdmin } from "../../hooks/useIsAdmin"
import { cn } from "../../lib/utils"
import { MenuBar } from "../menuBar/MenuBar"
import { Separator } from "../ui/separator"

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
          isActive && "bg-muted text-foreground"
        )
      }
      end
    >
      {label}
    </NavLink>
  )
}

export function AppLayout() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <header className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <MenuBar />

          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-semibold tracking-tight">
              {t("app.title")}
            </div>
            <div className="text-xs text-muted-foreground">{t("app.subtitle")}</div>
          </div>
          <nav className="flex items-center gap-1">
            <NavItem to="/" label={t("nav.recommendation")} />
            {isAdmin && (
              <>
                <NavItem to="/admin/tax-groups" label={t("nav.taxGroups")} />
                <NavItem to="/admin/plans" label={t("nav.plans")} />
                <NavItem to="/admin/analytics" label={t("nav.analytics")} />
              </>
            )}
          </nav>
        </div>
        <Separator />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

