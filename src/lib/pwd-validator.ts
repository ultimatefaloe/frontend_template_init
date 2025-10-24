// Password validation utility with comprehensive requirements

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

// Comprehensive list of supported symbols
export const SUPPORTED_SYMBOLS = [
  '!',
  '@',
  '#',
  '$',
  '%',
  '&',
  '*',
  '(',
  ')',
  '-',
  '_',
  '+',
  '=',
  '[',
  ']',
  '{',
  '}',
  '|',
  ':',
  ';',
  '"',
  "'",
  '<',
  '>',
  ',',
  '.',
  '?',
  '/',
];

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
  supportedSymbols: SUPPORTED_SYMBOLS,
};

export function validatePassword(password: string): PasswordValidationResult {
  // Trim the password
  const trimmedPassword = password.trim();
  const errors: string[] = [];

  // Check minimum length
  if (trimmedPassword.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    );
  }

  // Check maximum length
  if (trimmedPassword.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(
      `Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`
    );
  }

  // Check for uppercase letter
  if (
    PASSWORD_REQUIREMENTS.requireUppercase &&
    !/[A-Z]/.test(trimmedPassword)
  ) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check for lowercase letter
  if (
    PASSWORD_REQUIREMENTS.requireLowercase &&
    !/[a-z]/.test(trimmedPassword)
  ) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check for number
  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(trimmedPassword)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for supported symbol
  if (PASSWORD_REQUIREMENTS.requireSymbol) {
    const symbolRegex = new RegExp(
      `[${SUPPORTED_SYMBOLS.map(s =>
        s === '\\' || s === ']' || s === '^' || s === '-' ? '\\' + s : s
      ).join('')}]`
    );
    if (!symbolRegex.test(trimmedPassword)) {
      errors.push(
        `Password must contain at least one symbol: ${SUPPORTED_SYMBOLS.join(
          ' '
        )}`
      );
    }
  }

  // Check for unsupported characters
  const allowedCharsRegex =
    /^[A-Za-z0-9!@#$%^&*()\-_+=\[\]{}|\\:;\"'<>,.?/~`]*$/;
  if (!allowedCharsRegex.test(trimmedPassword)) {
    errors.push('Password contains unsupported characters');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    const hasVariety = [
      /[A-Z]/.test(trimmedPassword),
      /[a-z]/.test(trimmedPassword),
      /[0-9]/.test(trimmedPassword),
      new RegExp(
        `[${SUPPORTED_SYMBOLS.map(s =>
          s === '\\' || s === ']' || s === '^' || s === '-' ? '\\' + s : s
        ).join('')}]`
      ).test(trimmedPassword),
    ].filter(Boolean).length;

    if (trimmedPassword.length >= 12 && hasVariety >= 4) {
      strength = 'strong';
    } else if (trimmedPassword.length >= 8 && hasVariety >= 3) {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function getPasswordStrengthColor(
  strength: 'weak' | 'medium' | 'strong'
): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'strong':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export function getPasswordStrengthText(
  strength: 'weak' | 'medium' | 'strong'
): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    default:
      return '';
  }
}

// Helper function to trim password and validate
export function processPassword(password: string): {
  trimmed: string;
  validation: PasswordValidationResult;
} {
  const trimmed = password.trim();
  const validation = validatePassword(trimmed);
  return { trimmed, validation };
}
