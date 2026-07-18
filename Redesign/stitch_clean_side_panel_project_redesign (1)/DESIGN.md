---
name: Editorial Research System
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#5a413c'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#8e706b'
  outline-variant: '#e2beb9'
  surface-tint: '#b22b1b'
  primary: '#860400'
  on-primary: '#ffffff'
  primary-container: '#a82315'
  on-primary-container: '#ffbeb3'
  inverse-primary: '#ffb4a7'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#3f4140'
  on-tertiary: '#ffffff'
  tertiary-container: '#565857'
  on-tertiary-container: '#cececc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a7'
  on-primary-fixed: '#410100'
  on-primary-fixed-variant: '#900f05'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e3e1'
  tertiary-fixed-dim: '#c6c7c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#454746'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
spacing:
  unit: 8px
  container-max: 1120px
  gutter: 32px
  margin-mobile: 20px
  section-gap: 120px
  stack-sm: 12px
  stack-md: 24px
---

## Brand & Style

The design system is rooted in the "New Editorial" aesthetic—a fusion of classical academic publishing and modern digital minimalism. It targets a professional audience seeking depth, clarity, and authority. 

The visual narrative is built on the concept of the "living document." It prioritizes content hierarchy above all else, using generous whitespace (negative space) to allow information to breathe. The mood is intellectual, objective, and premium. Design elements borrow from architectural drafting and research papers, utilizing thin structural lines, monospaced metadata, and high-contrast serif typography to establish a sense of permanence and rigor.

**Key Stylistic Pillars:**
- **Minimalism:** No unnecessary decoration; every element serves a functional or hierarchical purpose.
- **Academic Rigor:** Monospaced accents suggest data-driven origins and technical precision.
- **Premium Publishing:** Large, elegant serif headings paired with a strictly disciplined grid.

## Colors

The palette is strictly curated to emphasize the "Ink on Paper" feel. 

- **Primary (Accent):** A deep, scholarly Oxblood Red (#A82315), used sparingly for highlights, vertical indicators, and primary calls to action. It denotes importance without being loud.
- **Secondary (Ink):** An off-black charcoal (#1A1A1A) for maximum readability and a softer contrast than pure black.
- **Tertiary (Paper):** A warm, light grey (#F5F5F3) used for subtle background containment and secondary surfaces to reduce eye strain.
- **Neutral (Slate):** Mid-tone greys for metadata, captions, and structural lines.

## Typography

This design system employs a high-contrast typographic pairing to distinguish between narrative content and technical data.

- **Headings (Source Serif 4):** Sophisticated and authoritative. Use "Display" sizes for project titles and "Headline" sizes for section breaks.
- **Body (Inter):** A neutral, highly legible sans-serif for long-form case study text. The line height is intentionally open (1.6) to improve reading stamina.
- **Data & Metadata (JetBrains Mono):** Monospaced type is used exclusively for "Document ID," "Metadata," and "Technical Specs" to evoke the feeling of a research report or code documentation. It should always be uppercase or small-caps when used as labels.

## Layout & Spacing

The layout follows a **Fixed Column Grid** philosophy inspired by editorial spreads. 

- **Desktop:** A 12-column grid with a maximum content width of 1120px. Primary case study text should typically occupy a central 8-column span to maintain an optimal line length for readability, leaving the outer columns for "marginalia" (metadata, dates, or side-notes).
- **Sectioning:** Use aggressive vertical spacing (`section-gap`) between major case study phases (e.g., Problem vs. Solution) to create a sense of progression.
- **Rhythm:** All spacing is a multiple of 8px. Use tight spacing for related metadata stacks and generous padding for image containers.

## Elevation & Depth

To maintain the "Paper" aesthetic, this design system avoids traditional shadows. Depth is communicated through **structural layering and tonal contrast.**

- **Flat Hierarchy:** Surfaces are primarily flat. Visual separation is achieved through thin 1px borders (#E0E0E0) or subtle shifts in background color (White vs. #F5F5F3).
- **The "Rule" Line:** A 1px horizontal or vertical line in the Primary Red or Neutral grey is used to anchor content and define transitions.
- **Overlays:** When modals or tooltips are required, use a high-contrast solid border with a 0px offset, creating a "cut-out" effect rather than a floating one.

## Shapes

The shape language is **Sharp (0px)**. 

To reinforce the professional, institutional feel, rounded corners are avoided entirely. Buttons, input fields, image containers, and decorative elements all utilize hard 90-degree angles. This reflects the precision of a printed document and the architectural nature of a structured case study.

## Components

- **Buttons:** Primary buttons are solid Charcoal (#1A1A1A) with white text, 0px radius, and Monospaced labels. Secondary buttons use a 1px charcoal border.
- **Metadata Blocks:** Enclosed in a 1px neutral border with a light grey (#F5F5F3) background. Use Monospaced fonts for keys (e.g., `YEAR: 2024`) and labels.
- **Vertical Accents:** Use a 4px wide vertical "Primary Red" bar to the left of the main project title or featured quotes to draw the eye.
- **Images:** Presented in a "Gallery Frame" style—contained within sharp borders, often with a monospaced caption aligned to the bottom-left or right.
- **Case Study Lists:** Bullet points should use square markers or simple dashes to maintain the minimalist, technical aesthetic.
- **Input Fields:** Bottom-border only (1px) for a clean, editorial look. Labels sit above in Monospaced caps.