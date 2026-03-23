# Reusable Components Package

This folder is a copy-ready package for shared layout pieces and brand colors.

## Folder Structure

components/
- header/
  - header.html
- footer/
  - footer.html
- styles/
  - main-colors.css
- README.md

## What To Copy

1. Copy the entire `components/` folder into another project.
2. Ensure your project already has Bootstrap and Font Awesome loaded.
3. Import the color tokens first:

```html
<link rel="stylesheet" href="components/styles/main-colors.css">
```

4. Copy `components/header/header.html` and `components/footer/footer.html` into your page templates.

## Main Color Instructions

Edit `components/styles/main-colors.css` only. Do not hardcode colors in component files.

- `--primary-color`: main brand color
- `--primary-strong`: darker primary for hover/active states
- `--accent-color`: highlights and callouts
- `--success-color`: success messages
- `--danger-color`: errors and destructive actions
- `--light-bg`: light background surfaces
- `--dark-bg`: dark backgrounds
- `--surface-color`: cards and elevated surfaces
- `--text-color`: main readable text
- `--muted-text`: secondary text

## Required Assets

These files are referenced by `footer.html`:
- `asset/img/home/qrfooter.png`
- `asset/img/home/downloadframe.png`

This file is referenced by `header.html`:
- `asset/img/logo.webp`

If your folder structure is different, update the image `src` paths in the component files.
