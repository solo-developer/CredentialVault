export type PasswordStrength = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export const calculateStrength = (password: string): { score: number; label: PasswordStrength; color: string } => {
  let score = 0;
  if (!password) return { score: 0, label: 'Very Weak', color: '#f43f5e' };

  // Length
  if (password.length > 6) score += 1;
  if (password.length > 10) score += 1;
  
  // Complexity
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return { score, label: 'Very Weak', color: '#f43f5e' };
    case 2:
      return { score, label: 'Weak', color: '#fb923c' };
    case 3:
      return { score, label: 'Medium', color: '#f59e0b' };
    case 4:
      return { score, label: 'Strong', color: '#10b981' };
    case 5:
    default:
      return { score, label: 'Very Strong', color: '#059669' };
  }
};
