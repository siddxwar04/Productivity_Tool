import { Text, TextInput, StyleProp, TextStyle } from 'react-native';

export const FONTS = {
  headingBold: 'SpaceGrotesk_700Bold',
  bodyRegular: 'DMSans_400Regular',
  labelMedium: 'DMSans_500Medium',
} as const;

/** Large screen titles (ScreenHeader, hub titles, onboarding titles). */
export const SCREEN_TITLE = {
  fontFamily: FONTS.headingBold,
  letterSpacing: -0.5,
} as const;

/** Section headings (h2 level). */
export const SECTION_HEADING = {
  fontFamily: FONTS.headingBold,
  letterSpacing: -0.3,
} as const;

/** Screen/onboarding titles without extra letter-spacing (e.g. pre-styled). */
export const HEADING = {
  fontFamily: FONTS.headingBold,
} as const;

export const BODY = {
  fontFamily: FONTS.bodyRegular,
} as const;

export const LABEL = {
  fontFamily: FONTS.labelMedium,
} as const;

export const BADGE = {
  fontFamily: FONTS.labelMedium,
} as const;

type ComponentWithDefaultStyle = {
  defaultProps?: { style?: StyleProp<TextStyle> };
};

export function configureDefaultFonts(): void {
  const defaultStyle = { fontFamily: FONTS.bodyRegular };
  const TextComponent = Text as typeof Text & ComponentWithDefaultStyle;
  const TextInputComponent = TextInput as typeof TextInput & ComponentWithDefaultStyle;
  TextComponent.defaultProps = TextComponent.defaultProps ?? {};
  TextComponent.defaultProps.style = defaultStyle;
  TextInputComponent.defaultProps = TextInputComponent.defaultProps ?? {};
  TextInputComponent.defaultProps.style = defaultStyle;
}
