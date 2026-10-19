---
sidebar_position: 13
---

# Appearance

Appearance settings give the platform the organization's own logos and brand colors, applied across the web interface and on the login page. The branding is held in the platform settings, so one instance carries one brand, shown to every user.

To manage it, navigate to **Settings** → **Platform** → **Appearance** tab. The tab is offered only to users who hold the [branding permission](#access-control).

## Colors

Each color is a six-digit hexadecimal value prefixed with `#`, such as `#0073CF`, typed or chosen with the color picker. A field left empty keeps the platform default, which it shows as its placeholder, so setting one color changes only that color.

| Color          | What it changes                                                    | Themes         | Platform default |
|----------------|--------------------------------------------------------------------|----------------|------------------|
| **Primary**    | Buttons, links, active states and the page header                  | Light and dark | `#0073CF`        |
| **Secondary**  | Accents, chips and informational badges                            | Light and dark | `#0369A1`        |
| **Background** | The page background and raised surfaces such as cards and dialogs | Light only     | `#F8FAFC`        |
| **Text**       | Body text and headings                                             | Light only     | `#1F2937`        |

The platform derives hover and dark-theme shades from each color; the page header and solid buttons use the exact **Primary**. Success, danger and warning colors, dividers and charts are never branded.

## Logos

The **Logos** section has one slot per theme, **Light** and **Dark**. The logo is shown in the page header and on the login page, and a slot left empty shows the platform logo in that theme, never the other slot's logo.

A logo is a PNG or SVG file of at most 1 MB, ideally with a transparent background, and an aspect ratio between 1:1 and 6:1 is recommended. The format is recognized from the file content, not from its extension: a PNG must be well formed, and an SVG must declare the SVG namespace and carry no document type declaration.

The platform sanitizes an uploaded SVG before storing it. It keeps only drawing elements, which removes scripts, embedded foreign content and SVG animation elements, and it strips event handlers and references to anything outside the file. The stored logo is therefore not byte-for-byte the upload.

## Saving and resetting

**Save** stores the colors and logos shown on the tab. Before anything is stored, it checks the colors against the WCAG 2.1 AA contrast requirements in both themes: 4.5:1 for text, and 3:1 for input borders and status indicators. If a combination falls short, the **Contrast check** dialog lists the findings and, where it can, suggests a nearby shade that passes. **Save anyway** stores the colors as they are.

**Reset to Default** removes the configured colors, logos and [default theme](#theme-selection), and the instance returns to the platform's own look.

## Theme selection

The header icon cycles through **System**, **Light** and **Dark**; **System** follows the operating system preference. The choice is stored in the browser, so it applies per browser rather than per account.

An administrator can set a default theme, `light` or `dark`, for browsers in which the user has not chosen a mode. It is set only through the [API](#api), and a **Save** on the Appearance tab keeps the stored value. A user's own choice, including **System**, always takes precedence over the default theme.

## Access control

Changing branding requires the `updateBranding` action on the `settings` resource, shown in the role permissions editor as **Update Branding** under **Settings**. It is separate from the `update` action that governs the other platform settings, and neither action grants the other.

A role that manages the appearance also needs the `list` action on `settings` to read the current branding; without it the Appearance tab stays read-only. `list` also lets the role read the other platform settings, though not change them.

`updateBranding` changes platform state, so it is not part of the [`auditor`](../concept-design/architecture/access-control/roles-permissions.md#auditor-role) role.

:::note[Branding is public]
To render the login page, the platform serves the logos, the brand colors and the default theme without authentication. Do not use a logo that must not be public.
:::

## When users see a change

The administrator who saves a change sees it at once. Other users see it the next time they load or reload the web interface; a page that is already open keeps the branding it loaded. Browsers may cache the branding for up to 60 seconds, so a reload within a minute of the change can still show the previous branding. With several `Core` replicas, a replica other than the one that saved the change serves it after its next settings cache refresh, which runs every 30 seconds by default and is set in seconds by the `Core` environment variable `SETTINGS_CACHE_REFRESH_INTERVAL`.

## API

Branding has its own operations in the Other API: [Get platform branding](/api/core-other#tag/settings/GET/v1/settings/platform/branding), [Update platform branding](/api/core-other#tag/settings/PUT/v1/settings/platform/branding), and [Get branding](/api/core-other#tag/branding/GET/v1/branding), which needs no authentication and is what the web interface reads. An update replaces the whole branding, so a field left out is cleared: read the branding, change it, and send all of it back. Colors written through the API are not contrast-checked.
