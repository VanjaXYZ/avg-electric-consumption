import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useTranslation } from "react-i18next"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    return (
        <Select value={theme ?? "system"} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("common.theme")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="system">{t("common.system")}</SelectItem>
                <SelectItem value="light">{t("common.light")}</SelectItem>
                <SelectItem value="dark">{t("common.dark")}</SelectItem>
            </SelectContent>
        </Select>
    )
}