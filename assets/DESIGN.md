---
name: Modern Commerce Framework
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e82'
  primary: '#031636'
  on-primary: '#ffffff'
  primary-container: '#1a2b4c'
  on-primary-container: '#8293ba'
  inverse-primary: '#b6c6f0'
  secondary: '#264dd9'
  on-secondary: '#ffffff'
  secondary-container: '#4568f3'
  on-secondary-container: '#fffbff'
  tertiary: '#141819'
  on-tertiary: '#ffffff'
  tertiary-container: '#292c2e'
  on-tertiary-container: '#909395'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b6c6f0'
  on-primary-fixed: '#071b3b'
  on-primary-fixed-variant: '#364669'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c3ff'
  on-secondary-fixed: '#001355'
  on-secondary-fixed-variant: '#0035bd'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1440px
  gutter: 32px
  margin-edge: 64px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
  section-gap: 80px
---

## Brand & Style
The design system is engineered for high-stakes commerce environments where precision and reliability are paramount. It adopts a **Corporate Modern** aesthetic characterized by structural rigor and a refined editorial sensibility. The target audience—enterprise buyers and sophisticated retail consumers—expects a frictionless, high-performance experience that minimizes cognitive load.

The brand personality is authoritative yet accessible, using a "Less, but better" approach to visual elements. By prioritizing ample whitespace and a restricted color palette, the system communicates stability and transparency, fostering a deep sense of user trust.

## Colors
This design system utilizes a foundation of Deep Navy (#1A2B4C) to establish immediate authority. This primary color is used for key navigation elements, primary buttons, and high-level headings. The secondary color, a vibrant Digital Blue, is reserved for interactive states and specific calls to action to guide the user's eye.

The neutral palette is biased toward cool grays to maintain harmony with the deep blue accents. Backgrounds remain predominantly white or off-white (#F8FAFC) to maximize the "breathability" of the interface on large desktop displays. Success, warning, and error states should use desaturated versions of green, amber, and red to avoid breaking the professional tone.

## Typography
Manrope serves as the single typographic pillar, chosen for its modern, geometric construction and exceptional legibility at various scales. The type hierarchy relies on significant weight contrasts—pairing ExtraBold headlines with Regular body text—to create a clear path for the eye on information-dense commerce pages.

For wide screens, line lengths for body copy are strictly capped at 75 characters to maintain readability. Tracking is slightly tightened for large display headers to create a "locked-in" professional look, while smaller labels use increased letter spacing and uppercase styling for functional categorization.

## Layout & Spacing
The layout employs a **Fixed Grid** model optimized for 1440px+ resolutions. It uses a 12-column grid with generous 32px gutters to prevent content crowding. On ultra-wide displays, the content container remains centered at 1440px to ensure the user's focus remains in the primary interaction zone.

Spacing follows a strict 8px linear scale. Section gaps are intentionally large (80px+) to visually separate distinct product categories or content blocks, reinforcing the premium aesthetic. Structural layouts use asymmetrical compositions—such as a 4-column sidebar with an 8-column content area—to create sophisticated visual interest.

## Elevation & Depth
Elevation in this design system is achieved through **Tonal Layers** and extremely subtle **Ambient Shadows**. Surfaces do not "float" aggressively; instead, depth is communicated through a change in background color (e.g., moving from white to a very light gray base).

When shadows are necessary—such as for dropdown menus or active product cards—they must be highly diffused (20px+ blur) with low opacity (4-8%) and tinted with the primary blue hue to maintain color harmony. This prevents the "muddy" look of standard black shadows. Borders are used sparingly, utilizing 1px solid strokes in a light neutral tone to define boundaries without adding visual noise.

## Shapes
The design system adopts a **Soft** shape language. A standard radius of 0.25rem (4px) is applied to most UI components, providing a subtle hint of approachability without sacrificing the professional, architectural feel of the grid. Larger containers like cards or modals may use a 0.5rem (8px) radius to soften their presence against the background. Rectilinear forms dominate to reinforce the feeling of a structured, organized framework.

## Components
- **Buttons:** Primary buttons are solid Deep Navy (#1A2B4C) with white Manrope Medium text. Secondary buttons use a 1px border of the same navy. Interaction states are signaled by a slight shift in background saturation rather than a change in size.
- **Inputs:** Fields use a 1px neutral border that transitions to the secondary blue on focus. Labels sit strictly above the field in `label-bold` style for maximum clarity.
- **Cards:** Product cards are borderless with a subtle tonal background (#F8FAFC). On hover, they lift slightly using the ambient shadow profile and a subtle 1px border appearance.
- **Chips/Badges:** Used for status (e.g., "In Stock") or filters. These are rectangular with the standard 4px radius and utilize low-contrast background fills with high-contrast text.
- **Data Tables:** High-density with clear horizontal dividers. Headers are styled with the primary navy color to anchor the data.
- **Breadcrumbs:** Essential for commerce navigation, these use the `label-sm` style with chevron separators to provide clear orientation within the site hierarchy.