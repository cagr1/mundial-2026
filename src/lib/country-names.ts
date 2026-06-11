// TLA (ESPN 3-letter abbreviation) → ISO 3166-1 alpha-2.
// ESPN no siempre usa códigos FIFA: Arabia Saudita es KSA, no SAU, etc.
// Se incluyen variantes para cubrir posibles cambios de la API.
// Compartido entre MatchCard (banderas) y la localización de nombres.
export const TLA_ISO2: Record<string, string> = {
  // CONCACAF
  MEX: 'mx', USA: 'us', CAN: 'ca',
  PAN: 'pa', CRC: 'cr', HON: 'hn', HND: 'hn',
  SLV: 'sv', GTM: 'gt', JAM: 'jm',
  TRI: 'tt', HAI: 'ht', CUB: 'cu',
  NCA: 'ni', GUY: 'gy', SUR: 'sr',
  CUW: 'cw',                          // Curaçao (ESPN: CUW)
  // CONMEBOL
  ARG: 'ar', BRA: 'br', COL: 'co',
  ECU: 'ec', URU: 'uy', CHI: 'cl',
  BOL: 'bo', PAR: 'py', PER: 'pe', VEN: 've',
  // UEFA
  FRA: 'fr', GER: 'de', ESP: 'es', POR: 'pt',
  NED: 'nl', BEL: 'be',
  ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', NIR: 'gb-nir',
  ITA: 'it', CRO: 'hr', HRV: 'hr', SUI: 'ch', CHE: 'ch',
  DEN: 'dk', NOR: 'no', SWE: 'se',
  POL: 'pl', CZE: 'cz', SVK: 'sk',
  HUN: 'hu', ROU: 'ro', SRB: 'rs',
  UKR: 'ua', TUR: 'tr', GRE: 'gr',
  ISL: 'is', IRL: 'ie', AUT: 'at', SVN: 'si',
  ALB: 'al', GEO: 'ge', MKD: 'mk',
  MNE: 'me', BIH: 'ba', KOS: 'xk',
  FIN: 'fi', EST: 'ee', LVA: 'lv', LTU: 'lt',
  // CAF
  MAR: 'ma', SEN: 'sn', CMR: 'cm',
  GHA: 'gh', NGA: 'ng', NGR: 'ng',
  EGY: 'eg', RSA: 'za', ZAF: 'za',
  ALG: 'dz', DZA: 'dz',
  TUN: 'tn', CIV: 'ci', GUI: 'gn',
  MLI: 'ml', BFA: 'bf', ZIM: 'zw',
  MOZ: 'mz', TAN: 'tz', UGA: 'ug',
  ANG: 'ao', COD: 'cd', ETH: 'et',
  CPV: 'cv',                          // Cabo Verde (ESPN: CPV)
  GAB: 'ga', CGO: 'cg', TOG: 'tg',
  BEN: 'bj', GNB: 'gw', SLE: 'sl',
  LBR: 'lr', GNQ: 'gq', COM: 'km',
  SSD: 'ss', SDN: 'sd', SOM: 'so',
  RWA: 'rw', BDI: 'bi', ERI: 'er',
  // AFC
  KOR: 'kr', JPN: 'jp', IRN: 'ir',
  KSA: 'sa', SAU: 'sa',              // Arabia Saudita (ESPN: KSA)
  QAT: 'qa', AUS: 'au',
  CHN: 'cn', IRQ: 'iq', JOR: 'jo',
  UAE: 'ae', IDN: 'id', UZB: 'uz',
  TKM: 'tm', KUW: 'kw', OMN: 'om',
  BHR: 'bh', IND: 'in', SYR: 'sy',
  TJK: 'tj', KGZ: 'kg', KAZ: 'kz',
  VIE: 'vn', THA: 'th', MAS: 'my', MYS: 'my',
  PHI: 'ph', SIN: 'sg', PAK: 'pk',
  LBN: 'lb', PLE: 'ps', YEM: 'ye',
  // OFC
  NZL: 'nz', FIJ: 'fj',
}

// Casos que Intl.DisplayNames no resuelve (subdivisiones de UK, Kosovo)
// o donde el resultado de ICU es inconsistente entre locales.
type Locale = 'es' | 'en' | 'pt' | 'zh' | 'hi'
const OVERRIDES: Record<string, Record<Locale, string>> = {
  ENG: { es: 'Inglaterra', en: 'England', pt: 'Inglaterra', zh: '英格兰', hi: 'इंग्लैंड' },
  SCO: { es: 'Escocia', en: 'Scotland', pt: 'Escócia', zh: '苏格兰', hi: 'स्कॉटलैंड' },
  WAL: { es: 'Gales', en: 'Wales', pt: 'País de Gales', zh: '威尔士', hi: 'वेल्स' },
  NIR: { es: 'Irlanda del Norte', en: 'Northern Ireland', pt: 'Irlanda do Norte', zh: '北爱尔兰', hi: 'उत्तरी आयरलैंड' },
  KOS: { es: 'Kosovo', en: 'Kosovo', pt: 'Kosovo', zh: '科索沃', hi: 'कोसोवो' },
  // Costa de Marfil: ICU devuelve "Côte d'Ivoire" en es/en; preferimos el exónimo local.
  CIV: { es: 'Costa de Marfil', en: 'Ivory Coast', pt: 'Costa do Marfim', zh: '科特迪瓦', hi: 'आइवरी कोस्ट' },
}

// Cache de instancias de Intl.DisplayNames por locale.
const displayNamesCache = new Map<string, Intl.DisplayNames>()
function regionNames(locale: string): Intl.DisplayNames | null {
  if (displayNamesCache.has(locale)) return displayNamesCache.get(locale)!
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' })
    displayNamesCache.set(locale, dn)
    return dn
  } catch {
    return null
  }
}

/**
 * Nombre del país localizado a partir del TLA de ESPN.
 * Usa overrides manuales para casos especiales y, si no, Intl.DisplayNames.
 * Cae a `fallback` (normalmente el nombre en inglés de ESPN) si no se resuelve.
 */
export function localizedCountry(tla: string | undefined, locale: string, fallback = ''): string {
  const key = (tla ?? '').toUpperCase()
  const ov = OVERRIDES[key]
  if (ov) return ov[(locale as Locale)] ?? ov.en

  const iso2 = TLA_ISO2[key]
  if (iso2 && !iso2.includes('-')) {
    const dn = regionNames(locale)
    const name = dn?.of(iso2.toUpperCase())
    // Intl devuelve el código tal cual si no conoce la región → no sirve
    if (name && name.toUpperCase() !== iso2.toUpperCase()) return name
  }
  return fallback
}
