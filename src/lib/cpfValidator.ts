export const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '');

  // Check if CPF has 11 digits
  if (cpf.length !== 11) {
    return false;
  }

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
};

export const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  
  if (match) {
    return [match[1], match[2], match[3], match[4]]
      .filter(group => group)
      .join('.')
      .replace(/\.(\d{2})$/, '-$1');
  }
  
  return value;
};
