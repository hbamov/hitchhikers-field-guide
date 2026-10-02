export const authMessages = {
  login: {
    title: "Welcome aboard",
    description: "Your next stop is waiting.",
    submit: "Sign in",
    switchPrompt: "New to this corner of space?",
    switchLink: "Create an account",
  },

  register: {
    title: "Join the next expedition",
    description: "Every great trip starts somewhere.",
    submit: "Create traveler account",
    switchPrompt: "Already have an account?",
    switchLink: "Sign in",
  },

  fields: {
    name: "Name",
    email: "Email",
    password: "Password",
  },

  validation: {
    nameTooShort: "Enter at least 2 characters.",
    invalidEmail: "Enter a valid email address.",
    passwordRequired: "Enter your password.",
    passwordTooShort: "Use at least 6 characters.",
  },

  passwordReset: {
    action: "Forgot password?",
    emailRequired:
      "Enter your email address first, then choose “Forgot password?”.",
    success:
      "If an account exists for that email, a password reset link is on its way.",
    error: "Could not send reset email.",
  },

  errors: {
    invalidCredentials: "Email or password is incorrect.",
    emailAlreadyInUse: "An account with this email already exists.",
    tooManyAttempts: "Too many attempts. Wait a moment and try again.",
    unableToContinue: "Unable to continue. Please try again.",
    firebaseNotConfigured:
      "Firebase is not configured yet. Add the project values to your environment setup to enable account actions.",
  },

  submitting: "Preparing…",
  footer: "Don’t panic. Keep your towel close.",
} as const;
