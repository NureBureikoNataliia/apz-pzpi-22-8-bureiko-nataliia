import { Button } from "@/components/ui/button";
import { useLanguage } from "../context/LanguageContext";

export function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            onClick={toggleLanguage}
            className="px-4"
        >
            {language === 'en' ? 'Українська' : 'English'}
        </Button>
    );
} 