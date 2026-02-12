# Requirement: Update Search Icons

## Goal

Update the icons for existing search commands in the SmartPick plugin to better represent their respective services.

## Changes

- **Google Search**: Change icon from `remix-ChromeLine` to `lucide-chrome`.
- **Baidu Search**: Change icon from `remix-BaiduFill` to `lucide-paw-print`.

## Files

### [settings.ts](file:///Users/bcs/MacSync/SmartPick/smartpick/src/settings.ts)

- Update `DEFAULT_TOOLBAR_ITEMS`:
  - `link-google`: set `icon` to `'lucide-chrome'`
  - `link-baidu`: set `icon` to `'lucide-paw-print'`

## Verification

1.  **Manual Test**:
    - Build and reload the plugin.
    - Check the toolbar or settings specific command icons.
    - Verify "Google" command shows the Chrome icon.
    - Verify "Baidu" command shows the Paw Print icon.
