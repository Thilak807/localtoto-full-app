export const allowedAdminPhones: string[] = [
  '9113702314',
  '9113750231',
  // Add more allowed phone numbers here (digits only)
];

export function isAllowedAdmin(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const normalized = phone.replace(/\D/g, '');
  return allowedAdminPhones.includes(normalized);
}



