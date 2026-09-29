/**
 * Ministry of Tribal Affairs (MoTA) Portal Configuration
 * GIGW 3.0 & NIC Compliant Enterprise Configuration
 */

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'or' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const PORTAL_CONFIG = {
  // SET TO false WHEN DEPLOYING TO PRODUCTION TO EASILY HIDE THE TESTING ROLE SWITCHER
  SHOW_DEMO_ROLE_SWITCHER: true,

  PORTAL_NAME: "National Tribal Scholarship Portal",
  GOVERNMENT_MINISTRY: "Ministry of Tribal Affairs",
  GOVERNMENT_MINISTRY_HI: "जनजातीय कार्य मंत्रालय",
  DEVELOPER_ORGANIZATION: "National Informatics Centre (NIC)",
  GAZETTE_VERSION: "GIGW 3.0 Verified",
  DEFAULT_ITEMS_PER_PAGE: 5,
  LOCAL_STORAGE_KEY_PREFIX: 'mota_scholarship_portal_v2',
};
