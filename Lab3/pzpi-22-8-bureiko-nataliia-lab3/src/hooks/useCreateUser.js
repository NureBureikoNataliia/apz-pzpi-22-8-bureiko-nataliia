import { useState } from 'react'
import { createEmployee } from '../services/api'

export function useCreateUser() {
    const [isLoading, setIsLoading] = useState(false)
    
    const createUser = async (userData) => {
        setIsLoading(true)
        try {
            const response = await createEmployee(userData)
            return { success: !response.data.message, data: response.data }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setIsLoading(false)
        }
    }
    
    return { createUser, isLoading }
}