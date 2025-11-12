export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  export function validatePassword(password) {
    // Example: password must be at least 6 characters
    return typeof password === 'string' && password.length >= 6;
  }
  
  export function validateName(name) {
    // Must be at least 2 characters and not empty
    return typeof name === 'string' && name.trim().length >= 2;
  }
  