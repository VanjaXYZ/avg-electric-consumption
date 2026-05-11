import { useState } from "react"
import { useTranslation } from "react-i18next"
import { STORAGE_KEY } from "../../i18n"
import { cn } from "../../lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"

type Props = {
    className?: string
}

export function LanguageSwitcher({ className }: Props) {
    const { i18n, t } = useTranslation()
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language)

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language)
        i18n.changeLanguage(language)
        localStorage.setItem(STORAGE_KEY, language)
    }

    return (
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className={cn("min-w-0", className)}>
                <SelectValue placeholder={t("common.language")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sr">Srpski</SelectItem>
            </SelectContent>
        </Select>
    )
}