import { verifyEmployee } from "../../services/api"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import i18n from '../../i18n'
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Login() {
    const [user, setUser] = useState({
        email: "",
        password: "",
    })

    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    function handleChange(e) {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    function changeLanguage(lang) {
        i18n.changeLanguage(lang)
        localStorage.setItem("lang", lang)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        try {
            let response = await verifyEmployee(user)
            
            if(response && response.token) {
                // Clear any existing sessions
                sessionStorage.clear();
                
                // Set the token
                const token = response.token;
                axios.defaults.headers.common["authorization"] = `Bearer ${token}`;

                // Set the appropriate role token
                if (response.admin === true) {
                    sessionStorage.setItem("Admin", token);
                    navigate("/admin");
                } else {
                    sessionStorage.setItem("Consultant", token);
                    navigate("/consultant-dashboard");
                }
            } else {
                alert(t("login.invalid"))
            }
        } catch (error) {
            console.error("Login error:", error)
            alert(t("login.serverError"))
        }
    }

    return (
        <div>
            <div className="flex gap-4 mb-4">
                <Button className="flex-1 w-full bg-stone-400" onClick={() => changeLanguage("en")}>en English</Button>
                <Button className="flex-1 w-full bg-stone-400" onClick={() => changeLanguage("uk")}>🇺🇦 Українська</Button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <Input 
                    placeholder={t("login.email")} 
                    onChange={handleChange} 
                    name="email" 
                    value={user.email}
                    type="email"
                    required 
                    maxLength={50}
                    className="mb-4"
                />
                <Input 
                    placeholder={t("login.password")} 
                    onChange={handleChange} 
                    name="password" 
                    value={user.password}
                    type="password" 
                    required 
                    maxLength={8}
                    className="mb-4"
                />
                <Button type="submit" className="mb-4">{t("login.button")}</Button>
            </form>
        </div>
    ) 
}
