# Walkthrough - Toolbar Trigger on Select All (Cmd+A)

## Implementation Summary
The SmartPick toolbar positioning logic has been enhanced to ensure visibility when the user selects a large amount of text (e.g., using `Cmd+A` or `Ctrl+A`). Previously, the toolbar was positioned relative to the *selection start*, which could be off-screen for large selections, rendering the toolbar invisible.

## Changes
### [SmartPick UI]
#### [MODIFY] [ToolbarUI.ts](file:///Users/bcs/MacSync/SmartPick/smartpick/src/toolbar/ToolbarUI.ts)
- Updated `render` method to clamp the vertical position (`top`) of the toolbar.
- Added a check: if the calculated `top` position is less than `10px` (indicating it would be off-screen or too close to the edge), it is clamped to `10px`.
- This ensures the toolbar "sticks" to the top of the viewport when the actual selection start is further up.

## Verification
### Manual Verification Steps
1.  **Open a Long Note**: Open a Markdown file that is long enough to require scrolling.
2.  **Scroll Down**: Scroll to the middle or bottom of the note.
3.  **Select All**: Press `Cmd+A` (macOS) or `Ctrl+A` (Windows/Linux) to select all text.
4.  **Observe Toolbar**: Verify that the SmartPick toolbar appears at the top of the viewport (with a small padding) and is fully visible and clickable.
5.  **Normal Selection**: Verify that selecting a small amount of text with the mouse still positions the toolbar correctly above the selection (not pinned to the top unless necessary).
