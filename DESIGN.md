---
name: Ashikur Rahman Portfolio
description: Light studio portfolio and layer-indexed notes for an ERP and full-stack developer.
colors:
  ground: "#eef0ec"
  ground-soft: "#e4e7e2"
  stage: "#0c0e0d"
  stage-soft: "#161a18"
  ink: "#0d0f0e"
  ink-soft: "#3c423f"
  ink-faint: "#5d635f"
  on-dark: "#f4f5f2"
  emerald: "#0ea85f"
  emerald-deep: "#087a44"
  on-emerald: "#ffffff"
  focus: "#087a44"
  stage-raised: "#1f2522"
  line-field: "#8a918c"
  mint: "#7fe0ae"
  danger: "#b3261e"
  danger-deep: "#8c1d18"
  danger-soft: "#fbe9e7"
  surface-white: "#ffffff"
typography:
  display:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(3rem, 0.8rem + 7.4vw, 9.5rem)"
    fontWeight: 450
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(2rem, 1rem + 3.2vw, 4rem)"
    fontWeight: 450
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1rem + 1.9vw, 2.75rem)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 1rem + 1.1vw, 1.9rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1rem + 0.5vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
  prose:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1rem + 0.2vw, 1.15rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Geist Variable', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.04em"
  mono:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, 'Cascadia Code', monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.65
  mono-code-mark:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, 'Cascadia Code', monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  hairline: "2px"
  chip: "6px"
  field: "12px"
  code: "14px"
  figure: "16px"
  stage: "clamp(14px, 1.6vw, 24px)"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 3.5vw, 56px)"
  max: "1600px"
  header-h: "96px"
  reading-measure: "36em"
components:
  pill-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  pill-dark-hover:
    backgroundColor: "{colors.emerald}"
  pill-light:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  pill-light-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
  round-button:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "48px"
  filter-chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
  layer-chip:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.stage}"
    rounded: "{rounded.chip}"
    padding: "3px 9px"
  text-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "48px"
  stage-panel:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.stage}"
    padding: "clamp(28px, 4vw, 64px)"
  figure-stage:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.figure}"
    padding: "clamp(18px, 3vw, 32px)"
  code-block:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.code}"
    typography: "{typography.mono}"
  layer-rail:
    textColor: "{colors.ink-faint}"
    width: "240px"
  soft-tile:
    backgroundColor: "{colors.ground-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.stage}"
    padding: "clamp(20px, 2.4vw, 32px)"
  soft-tile-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
---

# Design System: Ashikur Rahman Portfolio

## Overview

**Creative North Star: "The Light Studio with a Dark Stage"**

The build describes itself in its own token file: a light studio look, a cool off-white ground, near-black ink, one saturated accent taken from the AR logo, and a dark stage for anything that is a working system. The pages are calm, large-type and mostly flat. Real systems are shown on the dark stage: the hero, the 3D plates in "How I build", the attendance feed, the blog masthead, every blog figure and every code block. The stage is where proof goes. The light ground is where the explanation goes.

Display type is Geist set large and light (weight 450) with tight negative tracking. Body text is Geist at a reading size with generous leading. JetBrains Mono is the machine voice. It is used for code, for system codes such as layer codes, for figure numbers, and on the home page for data readouts such as dates, counts and status. Emerald is a single accent. It is used in small, deliberate doses: focus rings, links, the active state, the live pulse, figure accents, and one full deep-emerald field (About) as the home page's single color moment. The green arch behind the Intro portrait is the only other large emerald shape, and it belongs to the portrait.

The blog ("Notes") applies the same world more strictly. Notes are filed by system layer (Interface, API, Business logic, Data). The layer rail and the numbered "Fig. n" stage figures are its signature.

**Key Characteristics:**
- Cool off-white ground with near-black ink; dark stage panels for working systems.
- One emerald accent, rationed; deep emerald when it sits on the light ground as text.
- Geist display at weight 450 with negative tracking; Geist body; JetBrains Mono as the machine voice.
- Fully rounded pill controls with rolling-letter hover text.
- Large soft stage radius that scales with the viewport.
- Mostly flat surfaces; soft ambient shadows only on objects that float.

## Colors

The palette is a cool neutral range, light and dark, with one emerald accent from the logo.

### Primary
- **Logo Emerald** (`emerald`): the only accent. It is used for the active layer tick on the rail, the layer chip in the blog masthead, the live pulse dot, figure accent nodes and pulses, and decorative fills that carry no text. On the dark stage it appears as itself. White text never sits on bright emerald (3.10:1).
- **Deep Emerald** (`emerald-deep`): emerald as text on the light ground. It is used for prose links, list markers, layer codes, figure numbers on the light ground, and the active rail code. It is also the full background of the About section, the home page's single color field, and the fill behind any white text: the contact submit pill, dark-pill hover, the user chat bubble, active How-I-build plates and chips, and text selection. White on deep emerald is 5.42:1; secondary white text on it uses alpha 0.9 or more.

### Neutral
- **Studio Ground** (`ground`): the page background everywhere.
- **Soft Ground** (`ground-soft`): tonal tiles on the ground, such as inline code chips, blockquotes, post tags, and the previous/next note tiles.
- **Stage** (`stage`): the dark panel for working systems: masthead, figures, code blocks and hero.
- **Stage Soft** (`stage-soft`): the radial glow inside the post masthead, giving the stage depth without a shadow.
- **Ink** (`ink`): primary text, dark pills, active filter chips, and the reading-progress bar.
- **Ink Soft** (`ink-soft`): ledes, excerpts, captions and secondary text (8.96:1 on the ground).
- **Ink Faint** (`ink-faint`): dates, meta and the inactive rail (5.36:1 on the ground, 4.93:1 on soft ground).
- **Focus** (`focus`, deep emerald): the 2px focus outline and field focus ring. It clears 3:1 on every surface: 4.72 on the ground, 4.34 on soft ground, 5.42 on white, 3.58 on the stage.
- **On Dark** (`on-dark`): text on the stage. Secondary stage text uses it at reduced alpha (0.55 to 0.78).
- **Surface White** (`surface-white`): light pills, round icon buttons and form fields.
- **Stage Raised** (`stage-raised`): the face of the 3D plates in How I build, one step up from the stage.
- **Field Line** (`line-field`): form field borders (3.23:1 on white, meeting WCAG 1.4.11 for input boundaries).
- **Mint** (`mint`): emerald detail on the stage only: code keywords and figure code chips (12:1 on the stage).
- **Danger** (`danger`, `danger-deep`, `danger-soft`): the one error red for field borders, error text, the admin delete button and the figure error notice; `danger-deep` on the `danger-soft` tint for admin error banners.

On the dark stage, code and figure detail use a small syntax range: keywords and figure code chips in `mint` (a token), strings in sand, numbers in pale blue, comments in grey-green (tuned values inside the code component).

**The Rationed Emerald Rule.** Emerald marks state and direction: focus, links, the active item, live signals, and the accent node in a figure. It is never a decorative fill on the ground, with two exceptions: the deep-emerald About field, and the green arch behind the Intro portrait (see Portrait Arch). On the blog surface the rule is stricter. Emerald marks the layer system (the active rail tick and code, index layer codes, the masthead layer chip, figure numbers, figure accent nodes and pulses), plus focus, links, list markers and the entry-arrow hover. Nothing else is emerald. The direction contract names only "active layer, focus and links". The build also uses emerald for the other layer-system marks listed here, and this file records what the build does.

**The Deep-on-Light Rule.** Emerald text on the light ground is always deep emerald (4.72:1 on the ground). Bright emerald is for the stage, for fills, and for strokes.

**The Stage Ink Rule.** On the stage, primary text and data answers are near-white (`on-dark`), not emerald. Emerald on the stage marks state; it does not carry content.

Contrast note: fixed 2026-11-15 to meet WCAG 2.2 AA, which PRODUCT.md commits to. `ink-faint` darkened from #6d746f to #5d635f, white text moved from bright to deep emerald, the focus outline moved to deep emerald, About-panel secondary text raised to 0.9 alpha, and dimmed figure table rows raised to 0.55 alpha. A Playwright scan of every visible text element on the home page, blog index, the three posts, not-found and admin login found no text below AA (it skips text over gradients, images and canvas). Field placeholders use #6d746f on white (4.7:1).

## Typography

**Display Font:** Geist Variable (with Segoe UI, system-ui)
**Body Font:** Geist Variable (with Segoe UI, system-ui)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace, Cascadia Code)

**Character:** One neutral grotesk does all the human talking, set light and tight at large sizes. A monospace speaks only when the system speaks: code, codes, numbers and readouts.

### Hierarchy
- **Display** (450, `display`): section titles on the home page (Intro, Experience, Notes, AI ERP). Also the blog index "Notes" title, which uses its own clamp (3.4rem to 6rem, line-height 0.9, -0.04em).
- **Headline** (450, `headline`): the post title in the masthead, balanced wrap, max 18em.
- **Statement** (450, `statement`): the hero statement and similar one-line claims.
- **Title** (500, `title`): entry titles in the layer rows and section h2s in prose (1.5rem to 2rem, 500, -0.025em). Prose h3s are 1.2rem at weight 600.
- **Lede** (400, `lede`): index ledes, post excerpts and the next-note titles.
- **Body** (400, `body`): page text.
- **Prose** (400, `prose`): the blog reading column, held to a 36em measure (about 70 characters, because Geist runs wide).
- **Label** (500, `label`, uppercase): header links, hero rail captions, intro data terms and pill text (pills use 0.8rem at weight 600).
- **Mono** (`mono` / `mono-code-mark`): code blocks at 0.84rem/1.65. Layer codes, figure numbers and code-bar language tags use 0.68 to 0.74rem with 0.04 to 0.08em tracking.

**The Light Display Rule.** Large Geist is set at weight 450 with negative tracking (-0.025em to -0.045em). Large headings are never bold.

**The Machine Voice Rule.** JetBrains Mono is for things a system emits: code, layer and system codes, figure numbers, and data readouts. It is never used for people-facing labels such as tags, categories or form labels. On the blog it is limited further to code, layer codes and figure numbers.

**The Uppercase Name Rule.** "ASHIKUR RAHMAN" is set in uppercase at weight 600 with 0.06em tracking in the header, hero and footer. This is a brand commitment from PRODUCT.md.

## Layout

The frame is a centered container (`max`, 1600px) with a fluid gutter (`gutter`, 16px to 56px) and a fixed header allowance (`header-h`, 96px). Section padding uses large fluid clamps (about 96px to 200px vertically). There is no fixed spacing scale; spacing is set per component with `clamp()` values tuned to the viewport.

Stage panels sit inset by the gutter rather than running full bleed. Above 1680px the post masthead centers within the max width.

On the blog index, the head is a two-column grid: the title on the left, the lede and the layer filter on the right. Below it are four layer rows, each with a label column (`minmax(180px, 0.28fr)`) and a posts column. Each entry is laid out as date / title and excerpt / meta / arrow. The post body is a three-column grid: the rail column, a reading column of at most 40rem, and an empty right column. On wide screens (1200px and up), figures in the prose extend 200px into that empty right margin.

Responsive behavior that carries meaning:
- At 960px and below, the index head stacks, the masthead becomes a single column, and entry dates move above titles.
- At 820px and below, the layer rail becomes a slim sticky strip under the header: four columns of tick and code, with the progress bar along the bottom edge. Layer names and the table of contents are hidden.
- At 560px and below, prose tables drop their forced 480px minimum width so cells wrap, and the database-choice figure stacks each row with labelled answers.
- At 520px and below, the masthead insets to 10px with tighter padding.

**The Inset Stage Rule.** Stage panels that hold a single system (hero stage, blog masthead, figures, code, demos) sit inside the gutter with a rounded corner, as objects on the ground. Whole dark sections ("How I build", Contact, the footer) run full bleed and invert the header (`data-header-dark`).

**The Wrap, Don't Clip Rule.** Grid tracks that hold figures or tables use `minmax(0, 1fr)`. On phones, tables wrap or stack. They are never cut off mid-word.

## Elevation & Depth

Depth is a hybrid. Most depth comes from tone: dark stage panels on the light ground, soft-ground tiles, and a radial `stage-soft` glow inside the masthead. Hairline shadows (`0 1px 0` at low alpha) separate the scrolled header and the mobile rail strip from the content below. Large, soft, low-contrast ambient shadows are reserved for objects that float above a stage or above the page (the attendance feed card, the "How I build" plates, the header menu sheet, the parcel info card) and for hover lift (skill chips, skills panels). Focus on form fields uses a 4px emerald halo at 14% alpha.

### Shadow Vocabulary
- **Hairline separator** (`box-shadow: 0 1px 0 rgba(13, 15, 14, 0.08)`): the scrolled header bar and the sticky rail strip on phones.
- **Floating sheet** (`box-shadow: 0 24px 60px rgba(13, 15, 14, 0.12)`): the header menu panel.
- **Floating object on stage** (`box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35)`): the attendance feed and the plates (`0 30px 50px rgba(0,0,0,0.45)` with a 1px inset light edge).
- **Lift on hover** (`box-shadow: 0 12px 24px -10px rgba(13, 15, 14, 0.35)`): skill chips, paired with a -3px lift.
- **Field focus ring** (`border-color: var(--focus); box-shadow: 0 0 0 1px var(--focus), 0 0 0 5px rgba(8, 122, 68, 0.16)`): text inputs on focus.

**The Float-Only Shadow Rule.** A shadow means "this object floats". Panels, cards and figures resting on the ground have no shadow; their depth comes from tone. A hovered panel or chip may gain a soft lift shadow (the skills panels, skill chips).

## Shapes

The form language is soft and consistent. Controls are fully rounded pills (`pill`). Icon buttons are circles. Large panels use the stage radius (`stage`, 14px to 24px with the viewport). Figures use 16px, code blocks 14px, form fields and figure nodes 12px, and small chips 6px. Borders are 1px hairlines at low alpha: ink at 8 to 16% on the ground, and on-dark at 8 to 16% on the stage. A solid ink rule (1px) marks the top of the layer index and the head of a prose table. The dashed border is reserved for draft and error states.

**The Nested Radius Tendency.** Radii generally step down as elements nest: stage panel, then figure stage, then node, then chip. This is a tendency, not a strict rule. The stage radius shrinks to 14px on small screens, while a lead figure (16px) or a plate (18px) inside it stays larger.

## Components

### Buttons
Tactile and quiet: dark or white pills whose text rolls letter by letter on hover.
- **Shape:** fully rounded (`pill`), 48px tall, 24px side padding, uppercase label text at 0.8rem and weight 600.
- **Dark pill:** ink fill with on-dark text; on hover it fills emerald.
- **Light pill:** white fill with ink text; on hover it inverts to ink.
- **Accent pill:** deep emerald fill (white label 5.42:1), used only for the contact form submit; on hover it turns ink.
- **Hover / Focus:** the label rolls (each character slides up 110% over 520ms on `ease-out`). Pressing scales the pill to 0.97. Focus shows a 2px emerald outline with a 3px offset.
- **Round button:** a 48px white circle; on hover it inverts to ink; pressing scales it to 0.94.

### Chips
- **Filter chip:** a transparent pill with a 1px ink border at 16% alpha, 44px tall. On hover the border turns ink. When pressed (`aria-pressed`) it fills ink with on-dark text.
- **Layer chip:** a small emerald block (6px radius) with stage-colored text, used in the post masthead meta row.
- **Tag:** a soft-ground pill in Geist (0.8rem, ink soft). Tags are not set in mono.
- **Draft tag:** a dashed-outline pill in uppercase at 0.68rem with reduced opacity.

### Cards / Containers
- **Stage panel:** stage fill, stage radius, fluid padding, on-dark text. Used for the masthead, hero and system demos.
- **Soft tile:** soft-ground fill with the stage radius. On hover it inverts to ink (previous/next note).
- **Shadow Strategy:** tonal; see Elevation & Depth.

### Inputs / Fields
- **Style:** white field, 1.5px light border, 12px radius, at least 48px tall, 1rem text.
- **Focus:** the border turns emerald, with a 4px emerald halo at 14% alpha.
- **Error:** the border turns red, with an error message below the field.

### Navigation
- **Header:** brand top left (the AR logo masked in emerald, plus the uppercase name), actions top right. It is transparent at the top of the page, a solid bar with a hairline once scrolled, and dark over dark sections.
- **Index layer filter:** the filter chips described above.

### Layer Rail (signature)
A thin left rail in the post body: four rows (UI / API / LOGIC / DATA), each with a tick, a mono code and a name. The row for the layer of the section in view lights up: its tick goes full width in emerald, its code turns deep emerald and its name turns ink. Prose sections declare their layer with `::layer` markers. Below the rows sit a 2px reading-progress bar in ink and a short table of contents with an `aria-current` state. On phones it becomes the sticky four-column strip described in Layout.

### Numbered Figure (signature)
Every figure sits on a dark stage panel (16px radius, `minmax(0,1fr)` track) on the light ground. Below the panel is a caption that starts with a mono "Fig. n" number in deep emerald (mint when the figure is inside the masthead). Figure internals use hairline nodes on the stage, one emerald accent node, connectors with a travelling emerald pulse (switched off under reduced motion), and small uppercase table headers. Code inside a figure resets the prose chip: it is mint on a transparent background.

### Code Block
A stage panel with a 14px radius. A thin top bar holds the mono language tag and a pill-shaped Copy button. Below it is mono code at 0.84rem/1.65 with the mint, sand and blue syntax range. Selected text gets an emerald highlight.

### Intro Loader (signature)
A first-visit intro of about 2 seconds (`Preloader.tsx`, `lib/preloader.ts`). It tells the site's one idea before the hero does: a system is built from the database up. On the full-screen stage (`stage` with a `stage-soft` radial glow), three 14px-radius plates on `stage-raised` drop into a CSS 3D stack, bottom first: PostgreSQL (a 4 x 4 grid of cells, every fifth one emerald), ASP.NET Core (mint mono request lines) and React (a header strip and emerald/mint bars). The stack opens up, then the dark screen closes down onto the hero's dark stage, and the hero animation starts from there.
- **When it plays:** only on the home page itself (no `#section` deep link), only once per browser (`ar-intro-seen` in localStorage; blocked storage counts as seen), and never with reduced motion or data saver. Everyone else gets the hero straight away.
- **Exits:** any click, key, wheel or touch finishes it at once; a 3.2 s hard cap lifts it no matter what. Page scroll is locked while it covers the page.
- **Cost:** CSS 3D transforms and GSAP only, no WebGL. It is decorative and hidden from screen readers.

### Contact Dock
Black icons on one white pill in the header (WhatsApp, email, GitHub, Facebook), 40px circular links with 4px pill padding. On hover or focus a link fills ink with on-dark icon color, and an ink label tooltip (white over dark sections) slides in below it. On phones (the header's small breakpoint) the pill background goes away: each link becomes its own 44px white circle, tooltips are hidden, and Facebook moves to the menu. Email opens Gmail compose (`lib/contact.ts`) rather than `mailto:`.

### Portrait Arch
In the Intro section the portrait is a cut-out photo standing in a green arch: fully round top, stage-radius base, about 78% of the photo's height, so the head rises above it. The arch is an emerald-to-deep-emerald gradient with a soft highlight near the top, an inner base shadow and an emerald glow underneath. The photo carries two drop shadows (a close contact one and a soft wide one) to lift it off the arch. This is the one place where emerald is a large fill outside the About field; it is part of the portrait, not a section background.

### Design Gallery
A horizontal strip of uploaded design work (`DesignGallery.tsx`): columns of `clamp(200px, 22vw, 300px)`, 16px gap, scroll snap, swipe on phones. Each item is a 4:5 image, `object-fit: cover`, 14px radius, on `bg-soft` while it loads; a linked item scales to 1.03 on hover. Images are managed in the admin (Design tab, `/admin/design`) and served by the API as WebP of at most 100 KB. The section stays hidden while there is nothing to show.

## Do's and Don'ts

### Do:
- **Do** put working systems (figures, code, demos, mastheads) on the dark stage, inset within the gutter with the stage radius.
- **Do** number every blog figure "Fig. n" in mono and give it a caption.
- **Do** use deep emerald for emerald text on the light ground, and near-white for content on the stage.
- **Do** set large headings in Geist at weight 450 with negative tracking.
- **Do** use `minmax(0, 1fr)` tracks for figures and tables, and let tables wrap or stack under 560px.
- **Do** give every interactive element the 2px deep-emerald (`focus`) outline, and honor reduced motion (pulses and travelling dots stop).
- **Do** put post meta (layer chip, category, date, reading time, draft) below the excerpt.

### Don't:
- **Don't** use emerald as a decorative fill on the ground beyond the About field and the Intro portrait arch. On the blog, emerald marks only the layer system, focus and links.
- **Don't** set tags, categories, phone labels or other people-facing labels in mono.
- **Don't** put a kicker or eyebrow line above a heading.
- **Don't** add a shadow to a panel at rest on the ground; shadows are for floating objects and hover lift.
- **Don't** let the prose inline-code chip style reach code inside figures.

## Review Record

Finish review, 2026-11-15, blog surface (`/blog`, `/blog/:slug`), verdict: **ship with fixes**. The verdict is recorded here as it was relayed with this documentation pass; no written review file exists on disk. The evidence is Playwright screenshots, captured in segments, under `.impeccable/review/` (index, layer filter, posts on desktop and mobile, focus states, reduced motion, not-found, code selection, home and admin login).

All five material fixes are applied in the shipped code:
1. Code inside figures resets the prose chip, so it is mint on transparent (`blog.css`, the `.prose .figure code` reset).
2. The masthead meta row sits below the excerpt, with no kicker above the h1 (`BlogPost.tsx`).
3. Prose tables drop their minimum width under 560px so cells wrap (`blog.css`).
4. Mono is removed from post tags and from the DbChoice phone labels (`.post-tags li` and the `td::before` labels are Geist).
5. DbChoice engine answers use near-white ink (`on-dark`), not emerald (`DbChoice.tsx`, the `tr.is-engine td` rule).

Earlier fixes, also present in the code: prose table rules are scoped to the prose table wrapper, the figure stage uses a `minmax(0, 1fr)` track, and DbChoice stacks its rows under 560px with labelled answers.

The reviewer asked to keep: the layer rail lighting each section's layer via `::layer` markers, and the "Fig. n" figures on dark stage panels on the light ground.

## Raster Provenance

Shipping raster images (`public/media/`). No other rasters ship from `src`. The project media folder is empty. Design gallery images are not files in the repo: they are uploaded through the admin and stored as WebP in the `DesignPosts` table.
- `og-image.jpg`: the social share preview image (Open Graph and Twitter card), made for this site from the brand mark and portrait. Same provenance as those sources.
- `logo.png`: the AR logo. PRODUCT.md names it as the brand mark and the source of the emerald accent. It is used as the favicon, as a CSS mask (filled emerald) in the header and hero, and in the admin view. Origin, author and license are not recorded: **provenance unknown** beyond its brand designation.
- `ashikur-half-560.webp` and `ashikur-half-900.webp`: a responsive pair showing Ashikur Rahman with arms folded, in a green shirt (per the alt text), used in the Hero and Intro. Photographer, source file and license are not recorded: **provenance unknown**.

### Cleanup, 2026-11-15
After the review: one error red and one mint replace the two of each; off-token hexes became tokens (`stage-raised`, `line-field`); the About section's small "About" line above the statement was removed (the statement is now the h2, with "About" kept for screen readers); the home note card's category moved from above the title into the meta line, and that meta line is now Geist like the blog. A "Sign in" link to `/admin` was added at the end of the header menu foot and to the footer links.
