/**
 * Country codes and phone formatting utilities for WhatsApp and CRM integration.
 */

export interface CountryCodeItem {
  code: string;
  country: string;
  flag: string;
  name: string;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia (+60)' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan (+81)' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China (+86)' },
  { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan (+92)' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh (+880)' },
  { code: '+977', country: 'NP', flag: '🇳🇵', name: 'Nepal (+977)' },
  { code: '+94', country: 'LK', flag: '🇱🇰', name: 'Sri Lanka (+94)' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria (+234)' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa (+27)' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil (+55)' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia (+62)' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines (+63)' },
  { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand (+64)' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy (+39)' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain (+34)' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia (+7)' },
  { code: '+974', country: 'QA', flag: '🇶🇦', name: 'Qatar (+974)' },
  { code: '+968', country: 'OM', flag: '🇴🇲', name: 'Oman (+968)' },
  { code: '+965', country: 'KW', flag: '🇰🇼', name: 'Kuwait (+965)' },
  { code: '+973', country: 'BH', flag: '🇧🇭', name: 'Bahrain (+973)' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt (+20)' },
];

/**
 * Splits a full raw phone number into countryCode and localPhone.
 */
export function splitPhoneAndCountryCode(fullPhone: string, defaultCode = '+91'): { countryCode: string; localPhone: string } {
  if (!fullPhone) return { countryCode: defaultCode, localPhone: '' };
  const trimmed = fullPhone.trim();

  // Check matching prefixes in our known country codes
  for (const item of COUNTRY_CODES) {
    if (trimmed.startsWith(item.code)) {
      const local = trimmed.slice(item.code.length).replace(/^[-\s]+/, '');
      return { countryCode: item.code, localPhone: local };
    }
  }

  // If starts with + but custom code
  if (trimmed.startsWith('+')) {
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { countryCode: match[1], localPhone: match[2].trim() };
    }
  }

  // If 10 digits or no country code, return defaultCode
  return { countryCode: defaultCode, localPhone: trimmed };
}

/**
 * Formats full phone number with country code prefix e.g. "+919876543210" or "919876543210".
 */
export function formatFullPhone(countryCode: string, localPhone: string): string {
  const digits = (localPhone || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  const code = (countryCode || '+91').trim();
  const normalizedCode = code.startsWith('+') ? code : `+${code}`;
  return `${normalizedCode}${digits}`;
}
