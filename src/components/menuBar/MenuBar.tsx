import { Menu } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, useNavigate } from "react-router-dom"
import {
    useAuthUsername,
    useIsAdmin,
    useIsLoggedIn
} from "../../hooks/useIsAdmin"
import { clearAuthSession } from "../../lib/auth-storage"
import { initialsFromDisplayName } from "../../lib/initials"
import { LanguageSwitcher } from "../languageSwitcher/LanguageSwitcher"
import { ThemeToggle } from "../themeToggle/ThemeToggle"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet"

export function MenuBar() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isAdmin = useIsAdmin()
    const isLoggedIn = useIsLoggedIn()
    const storedUsername = useAuthUsername()
    const displayName = isLoggedIn
        ? storedUsername ?? t("menu.userFallback")
        : null
    const avatarInitials = displayName
        ? initialsFromDisplayName(displayName)
        : "?"
    return (
        <div className="flex flex-wrap gap-2">
            <Sheet >
                <SheetTrigger asChild>
                    <Button variant="outline" className="capitalize">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
                >
                    <SheetHeader className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-11 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                                    {avatarInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-1 flex items-start gap-1.5">
                                <SheetTitle className="w-full truncate text-left text-base">
                                    {displayName ?? t("menu.guest")}
                                </SheetTitle>
                                {/* {isLoggedIn && authRole ? (
                                    <Badge variant="secondary">{authRole}</Badge>
                                ) : null} */}
                            </div>
                        </div>
                        <SheetDescription>{t("menu.description")}</SheetDescription>
                    </SheetHeader>
                    <div className="no-scrollbar flex flex-col gap-2 overflow-y-auto px-4">
                        <NavLink to="/" end>
                            {t("nav.recommendation")}
                        </NavLink>
                        {isAdmin && (
                            <>
                                <NavLink to="/admin/tax-groups">
                                    {t("nav.taxGroups")}
                                </NavLink>
                                <NavLink to="/admin/plans">{t("nav.plans")}</NavLink>
                                <NavLink to="/admin/analytics">
                                    {t("nav.analytics")}
                                </NavLink>
                            </>
                        )}
                    </div>
                    <div className="mt-6 space-y-4 border-t px-4 pt-4">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {t("menu.systemSettings")}
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="sheet-theme" className="text-sm">
                                {t("common.theme")}
                            </Label>
                            <div id="sheet-theme">
                                <ThemeToggle className="w-full" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sheet-language" className="text-sm">
                                {t("common.language")}
                            </Label>
                            <div id="sheet-language">
                                <LanguageSwitcher className="w-full" />
                            </div>
                        </div>
                    </div>
                    <SheetFooter className="flex-col gap-2 sm:flex-col">
                        {isLoggedIn ? (
                            <SheetClose asChild>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        clearAuthSession()
                                        navigate("/login", { replace: true })
                                    }}
                                >
                                    {t("auth.signOut")}
                                </Button>
                            </SheetClose>
                        ) : (
                            <SheetClose asChild>
                                <Button asChild>
                                    <Link to="/login">{t("auth.signIn")}</Link>
                                </Button>
                            </SheetClose>
                        )}
                        <SheetClose asChild>
                            <Button variant="outline">{t("common.cancel")}</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
