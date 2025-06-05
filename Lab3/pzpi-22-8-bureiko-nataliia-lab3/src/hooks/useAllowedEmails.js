import { useState, useEffect } from 'react'
import { loadAllowedEmailsFromExcel } from '../services/excelService'

export function useAllowedEmails() {
    const [allowedEmails, setAllowedEmails] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadEmails() {
            try {
                const emails = await loadAllowedEmailsFromExcel()
                setAllowedEmails(emails)
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        loadEmails()
    }, [])

    return { allowedEmails, isLoading, error }
}