export const validateUserForm = (user, allowedEmails) => {
    const errors = []
    
    if (user.password !== user.confirmPassword) {
        errors.push('Passwords do not match')
    }
    
    if (!allowedEmails.includes(user.email.toLowerCase().trim())) {
        errors.push('This email is not authorized for registration')
    }
    
    if (!user.position) {
        errors.push('Please select your position')
    }
    
    return errors
}