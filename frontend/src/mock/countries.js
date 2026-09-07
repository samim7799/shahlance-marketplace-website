// A curated country list for the signup dropdown.
export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy',
  'Netherlands', 'Ireland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Portugal',
  'Switzerland', 'Belgium', 'Austria', 'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'Qatar',
  'Kuwait', 'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Morocco',
  'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Indonesia', 'Malaysia', 'Singapore',
  'Thailand', 'Vietnam', 'Philippines', 'Japan', 'South Korea', 'China', 'Hong Kong',
  'Australia', 'New Zealand', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru',
  'Russia', 'Ukraine', 'Romania', 'Czech Republic', 'Greece', 'Hungary', 'Israel',
];
// deduplicate
export const COUNTRY_LIST = [...new Set(COUNTRIES)].sort();
