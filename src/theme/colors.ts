export const colors = {
  court: '#C6F135',
  courtDark: '#8FCB1F',
  navy: '#0B1E3D',
  navyLight: '#132C54',
  navyDeep: '#060F20',
  orange: '#FF6A3D',
  white: '#FFFFFF',
  mist: '#AEB9CE',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.10)',
  danger: '#FF5470',
  success: '#3DDC97',
  gold: '#FFD54A',
  silver: '#D6DCE5',
  bronze: '#E0965A',
} as const;

export const gradients = {
  background: [colors.navyDeep, colors.navy, colors.navyLight] as const,
  primary: [colors.court, colors.courtDark] as const,
  accent: [colors.orange, '#FF3D77'] as const,
  gold: ['#FFE38A', colors.gold] as const,
};
