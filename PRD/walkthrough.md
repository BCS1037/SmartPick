# Fix Footnote Command ID and Icon

## Changes

### smartpick

#### [MODIFY] [settings.ts](file:///Users/bcs/MacSync/SmartPick/smartpick/src/settings.ts)

- Updated `ToolbarItem` for `footnote`:
  - Changed `commandId` from `markdown:insert-footnote` to `editor:insert-footnote`.
  - Changed `icon` from `footprints` to `lucide-footprints`.

## Verification Results

### Manual Verification

- [x] Verified code changes in `src/settings.ts` match requirements.
- [x] Rebuilt the plugin (verified `main.js` updated).
- [ ] User to verify in Obsidian:
  - Reload plugin.
  - Check toolbar icon is `lucide-footprints`.
  - Check clicking "Footnote" button inserts a footnote.
