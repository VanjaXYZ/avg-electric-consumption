import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"

import { cn } from "../../lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

type Props = {
  className?: string
}

export function ThemeToggle({ className }: Props) {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    return (
        <Select value={theme ?? "system"} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger className={cn("w-[140px] min-w-0", className)}>
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