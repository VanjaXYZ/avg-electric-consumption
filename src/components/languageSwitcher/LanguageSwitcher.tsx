import { useState } from "react"
import { useTranslation } from "react-i18next"
import { STORAGE_KEY } from "../../i18n"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation()
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language)

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language)
        i18n.changeLanguage(language)
        localStorage.setItem(STORAGE_KEY, language)
    }

    return (
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
                <SelectValue placeholder={t("common.language")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sr">Srpski</SelectItem>
            </SelectContent>
        </Select>
    )
}