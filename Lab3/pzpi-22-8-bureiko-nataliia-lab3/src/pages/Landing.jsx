import { CreateUser } from "../components/forms/CreateUser"
import { Login } from "../components/forms/Login"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function Landing() {
  const [view, setView] = useState(0)
  const { t } = useTranslation()

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      {!view ? (
        <div className="flex flex-col w-96">
          <Login />
          <Button onClick={() => setView(!view)}>
            {t("login.createAccount")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col w-96">
          <CreateUser />
          <Button onClick={() => setView(!view)}>
            {t("login.button")}
          </Button>
        </div>
      )}
    </div>
  )
}
