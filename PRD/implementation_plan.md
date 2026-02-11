# Implementation Plan - Toolbar Trigger on Select All (Cmd+A)

## Goal Description
Enable the SmartPick toolbar to appear when the user selects all text using `Cmd+A` (or `Ctrl+A`) (or any large selection where the start is off-screen). Currently, the toolbar is positioned based on the *start* of the selection. For "Select All", start is at the top of the document, causing the toolbar to render off-screen (negative top coordinates relative to viewport).

## User Review Required
> [!NOTE]
> This change primarily affects the **positioning** of the toolbar for large selections. It ensures visibility by clamping the toolbar to the top of the viewport when the selection start is above.

## Proposed Changes

### [SmartPick UI]
Modify `src/toolbar/ToolbarUI.ts` to implement clamping logic for vertical positioning.

#### [MODIFY] [ToolbarUI.ts](file:///Users/bcs/MacSync/SmartPick/smartpick/src/toolbar/ToolbarUI.ts)
- Update `render` method in `ToolbarUI` class.
- After calculating `top`, check if it is less than a minimum visible padding (e.g., `10px`).
- If existing logic places the toolbar above the viewport (`top < 10`), clamp it to `10`.
- Optionally consider `bottom` check if toolbar would cover selection, but for large selections (Select All), `bottom` is far down, so clamping to top is correct ("sticky header" behavior).

## Verification Plan

### Manual Verification
1.  Open a long Markdown note (needs scrolling).
2.  Scroll to the middle/bottom.
3.  Press `Cmd+A` (Select All) shortcut.
4.  **Expected**: The SmartPick toolbar appears at the top of the viewport and is visible.
5.  **Verify**: Selection with mouse (normal small selection) still positions correctly above the text.
