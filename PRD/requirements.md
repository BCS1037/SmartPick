# Fix Footnote Command ID and Icon

## Goal Description

The `insert-footnote` command in SmartPick is currently using an incorrect command ID (`markdown:insert-footnote`). It needs to be updated to `editor:insert-footnote` to function correctly with Obsidian's internal commands. Additionally, the icon should be updated to `lucide-footprints` specificially.

## Proposed Changes

### smartpick

#### [MODIFY] [settings.ts](file:///Users/bcs/MacSync/SmartPick/smartpick/src/settings.ts)

- Update `ToolbarItem` with id `footnote`:
    - Change `commandId` from `markdown:insert-footnote` to `editor:insert-footnote`.
    - Change `icon` from `footprints` to `lucide-footprints` (to match user request, although `footprints` might resolve to the same, `lucide-` prefix is commonly used in this codebase for specific overrides).

## Verification Plan

### Manual Verification

- Rebuild the plugin.
- Reload the plugin in Obsidian.
- Verify that the "Footnote" button in the toolbar now has the `lucide-footprints` icon.
- Click the "Footnote" button and verify it correctly inserts a footnote (using the `editor:insert-footnote` command).

