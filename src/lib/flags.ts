const ISO: Record<string, string> = {
  'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Angola': 'AO',
  'Argentina': 'AR', 'Australia': 'AU', 'Austria': 'AT', 'Belgium': 'BE',
  'Bolivia': 'BO', 'Bosnia-Herzegovina': 'BA', 'Brazil': 'BR', 'Cameroon': 'CM',
  'Canada': 'CA', 'Chile': 'CL', 'Colombia': 'CO', 'Costa Rica': 'CR',
  'Croatia': 'HR', 'Cuba': 'CU', 'Curaçao': 'CW', 'Czech Republic': 'CZ',
  'Czechia': 'CZ', 'Denmark': 'DK', 'Ecuador': 'EC', 'Egypt': 'EG',
  'England': 'GB', 'France': 'FR', 'Germany': 'DE', 'Ghana': 'GH',
  'Greece': 'GR', 'Guatemala': 'GT', 'Haiti': 'HT', 'Honduras': 'HN',
  'Hungary': 'HU', 'Iran': 'IR', 'Iraq': 'IQ', 'Italy': 'IT',
  'Ivory Coast': 'CI', 'Jamaica': 'JM', 'Japan': 'JP', 'Jordan': 'JO',
  'Kenya': 'KE', 'Korea Republic': 'KR', 'Mali': 'ML', 'Mexico': 'MX',
  'Morocco': 'MA', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Nigeria': 'NG',
  'Norway': 'NO', 'Panama': 'PA', 'Paraguay': 'PY', 'Peru': 'PE',
  'Poland': 'PL', 'Portugal': 'PT', 'Qatar': 'QA', 'Romania': 'RO',
  'Russia': 'RU', 'Saudi Arabia': 'SA', 'Scotland': 'GB-SCT', 'Senegal': 'SN',
  'Serbia': 'RS', 'Slovakia': 'SK', 'Slovenia': 'SI', 'South Africa': 'ZA',
  'South Korea': 'KR', 'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH',
  'Turkey': 'TR', 'Ukraine': 'UA', 'United States': 'US', 'Uruguay': 'UY',
  'Venezuela': 'VE', 'Wales': 'GB-WLS', 'Zimbabwe': 'ZW',
}

export function flagEmoji(nationality: string): string {
  const code = ISO[nationality]
  if (!code) return '🌐'
  if (code.includes('-')) return '🏴'
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('')
}

export function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000))
}
