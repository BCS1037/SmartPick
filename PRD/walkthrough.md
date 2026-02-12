# Walkthrough: Update Link Icons

## Changes
### Settings Update
Updated the default icons for search commands in `src/settings.ts`:
- **Google Search**: Changed from `remix-ChromeLine` to `lucide-chrome`.
- **Baidu Search**: Changed from `remix-BaiduFill` to `lucide-paw-print`.

## Verification Steps
1.  **Build the Plugin**: Run `npm run build` (or `npm run dev`) to compile the changes.
2.  **Reload Plugin**: Reload the SmartPick plugin in Obsidian.
3.  **Check Toolbar**: Select text to trigger the toolbar (if the search commands are enabled).
    - Verify that the Google search button now uses the Chrome icon.
    - Verify that the Baidu search button now uses the Paw Print icon.
4.  **Check Settings**: Go to SmartPick Settings -> Toolbar Items.
    - Verify the icons displayed for Google and Baidu commands match the new icons.

## Artifacts
- [Implementation Plan](implementation_plan.md)
- [Chat History](chat_history.md)
