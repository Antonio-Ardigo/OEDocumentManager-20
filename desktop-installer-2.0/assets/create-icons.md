# Desktop Installer 2.0 - Icon Creation Guide

For a professional Windows installation experience, you'll need to create the following icon files and place them in this `assets/` directory:

## Required Icon Files

### 1. Application Icons
- **icon.png** (512x512px) - Main application icon in PNG format
- **icon.ico** (256x256px) - Windows icon file with multiple sizes embedded
- **icon-large.png** (1024x1024px) - High-resolution icon for modern displays

### 2. Installer Icons  
- **installer-icon.ico** (256x256px) - Custom icon for the installer executable
- **uninstaller-icon.ico** (256x256px) - Icon for the uninstaller

### 3. Background Images
- **installer-background.png** (600x400px) - Background image for installer UI
- **dmg-background.png** (660x400px) - Background for macOS DMG (future use)

## Icon Design Guidelines

### Visual Style
- **Modern and Professional** - Clean, minimal design
- **Consistent with Brand** - Use WSM operational excellence colors
- **High Contrast** - Clearly visible on both light and dark backgrounds
- **Scalable Design** - Looks good at all sizes from 16x16 to 1024x1024

### Color Palette Suggestions
Based on the application's operational excellence theme:
- **Primary Blue**: #3B82F6 (professional, trustworthy)
- **Accent Orange**: #F59E0B (operational excellence, improvement)
- **Background White**: #FFFFFF 
- **Text Dark**: #1F2937

### Icon Elements
Consider incorporating these visual elements:
- **Gear/Cog** - Represents operational processes
- **Checkmark** - Represents excellence and quality
- **Arrow/Flow** - Represents process improvement
- **Grid/Framework** - Represents the 8-element structure

## Tools for Icon Creation

### Free Tools
- **GIMP** - Free image editor with ICO export plugin
- **Paint.NET** - Windows image editor with ICO support
- **Inkscape** - Vector graphics for scalable designs

### Online Tools
- **Canva** - Easy-to-use design platform
- **Figma** - Professional design tool (free tier)
- **Icon8** - Icon generator and editor

### Professional Tools
- **Adobe Illustrator** - Vector-based icon design
- **Adobe Photoshop** - Raster-based icon editing
- **Sketch** - macOS design tool

## Icon Specifications

### Windows ICO Format
Create .ico files with multiple embedded sizes:
- 16x16px
- 32x32px  
- 48x48px
- 64x64px
- 128x128px
- 256x256px

### PNG Format
High-quality PNG files with transparency:
- Use 32-bit color depth
- Include alpha transparency
- Optimize file size without quality loss

## Quick Setup

If you don't have custom icons ready, you can:

1. **Use Default Windows Icons** - The installer will use generic Windows icons
2. **Download Free Icons** - Use sites like Icons8, Flaticon, or Iconify
3. **Generate Simple Icons** - Use online icon generators with text/initials

## Automatic Fallbacks

The installer includes automatic fallbacks:
- If custom icons are missing, it uses Windows default icons
- The installer will still work perfectly without custom icons
- Custom icons enhance the professional appearance but are not required

Place your icon files in this directory and rebuild the installer to include them automatically.