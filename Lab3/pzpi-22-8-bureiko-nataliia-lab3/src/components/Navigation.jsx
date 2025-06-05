import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

export function Navigation() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const isAdmin = sessionStorage.getItem("Admin") !== null;

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    const NavLink = ({ to, children }) => (
        <a
            href={to}
            onClick={(e) => {
                e.preventDefault();
                navigate(to);
            }}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
            {children}
        </a>
    );
    
    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-end items-center h-16">
                    <div className="flex items-center space-x-4">
                        <LanguageToggle />
                        <Button variant="outline" onClick={handleLogout}>
                            {t('logout')}
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
    
} 