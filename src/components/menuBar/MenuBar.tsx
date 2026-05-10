import { Menu } from "lucide-react"
import { Button } from "../ui/button"
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
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useIsAdmin, useIsLoggedIn } from "../../hooks/useIsAdmin"
import { clearAuthSession } from "../../lib/auth-storage"
import { ThemeToggle } from "../themeToggle/ThemeToggle"
import { LanguageSwitcher } from "../languageSwitcher/LanguageSwitcher"

export function MenuBar() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isAdmin = useIsAdmin()
    const isLoggedIn = useIsLoggedIn()
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
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="no-scrollbar overflow-y-auto px-4 flex flex-col gap-2">
                        <NavLink to="/" end>
                            {t("nav.recommendation")}
                        </NavLink>
                        {isAdmin && (
                            <>
                                <NavLink to="/admin/tax-groups">
                                    {t("nav.taxGroups")}
                                </NavLink>
                                <NavLink to="/admin/plans">{t("nav.plans")}</NavLink>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
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
