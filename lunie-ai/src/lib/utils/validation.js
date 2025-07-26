
// src/lib/utils/validation.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    errors: [
      ...(password.length < 6 ? ['Password must be at least 6 characters'] : []),
      ...(!password.match(/\d/) ? ['Password must contain at least one number'] : []),
      ...(!password.match(/[a-zA-Z]/) ? ['Password must contain at least one letter'] : [])
    ]
  }
}

export const validateChatbotName = (name) => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Chatbot name must be at least 2 characters' }
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Chatbot name must be less than 50 characters' }
  }
  return { isValid: true, error: null }
}

export const validateUrl = (url) => {
  try {
    new URL(url)
    return { isValid: true, error: null }
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
}

export const validateFileUpload = (file, maxSizeMB = 10) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'File type not supported. Please upload PDF, Word, Excel, text, or image files.' 
    }
  }

  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${fileSizeMB.toFixed(2)}MB` 
    }
  }

  return { isValid: true, error: null }
}
