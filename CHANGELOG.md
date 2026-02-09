# Changelog

## [0.3.2] - 2026-02-09

### Fixed
- **Code Quality**: Fixed remaining sentence case issue for Obsidian plugin review:
    - Changed "Openai" → "OpenAI" in API provider dropdown options (proper brand name capitalization).

## [0.3.1] - 2026-02-09

### Fixed
- **Code Quality**: Addressed remaining sentence case issues for Obsidian plugin review:
    - Fixed 10 UI text strings to use proper sentence case (first word capitalized, rest lowercase except proper nouns).
    - Used backtick-wrapped examples in placeholders to skip sentence case validation for technical identifiers.
    - Fixed dropdown option text: "Custom (OpenAI-compatible)".
    - Replaced hardcoded English strings with i18n translation function calls.
    - Fixed "API Key" → "API key" in i18n.ts.

## [0.3.0] - 2026-02-09

### Fixed
- **Code Quality**: Resolved all remaining Obsidian plugin review issues:
    - Fixed unawaited promises with `void` operator in `CommandManager.ts` and `PreviewModal.ts`.
    - Removed unnecessary type assertion in `Toolbar.ts`.
    - Converted 15 UI texts to sentence case for consistency.
    - Fixed promise-in-void-function issues in callbacks.
    - Removed unused `ToolbarItem` and `Notice` imports.

## [0.2.9] - 2026-02-08

### Fixed
- **Code Quality**: Addressed all Obsidian plugin review issues:
    - Replaced all `any` types with proper TypeScript interfaces.
    - Added `void` operators to handle async IIFEs in callbacks.
    - Removed unused variables and imports.
    - Replaced `@ts-ignore` comments with proper type assertions.

## [0.2.8] - 2026-02-08

### Changed

- **Command**: Renamed "Translate" command to "翻译" and restricted functionality to English-to-Chinese translation only.
- **Data Migration**: Automatically migrate old translation template IDs to prevent conflicts.

### Improved

- **UI**: Optimized toolbar appearance by reducing overall size, removing button backgrounds, and eliminating separators for a cleaner look.

### Fixed

- **Layout**: Corrected toolbar alignment issue when selecting multi-line text.

## [0.2.7] - 2026-02-07

### Fixed
- **Submission**: Addressed Obsidian plugin review feedback:
    - Fixed unawaited promises and async/await usage.
    - Improved type safety by removing explicit `any` types.
    - Refactored Settings UI to use Obsidian's `Setting` API for headers.
    - Moved inline styles to CSS classes.

## [0.2.6] - 2026-02-07

### Added
- **UI**: Improved Settings UI layout:
    - Compacted command list grid (3 items per row).
    - Moved delete button to the edit modal for cleaner interface.
    - Adjusted toolbar button positions in settings.
- **Docs**: Updated README with URL scheme support, custom prompt templates, and Brat installation guide.

### Fixed
- **Fix**: Resolved issue where "SmartPick" toolbar AI commands (Gemini, Doubao, Qwen, etc.) did not copy selected text to clipboard.
- **Polish**: Removed "Link copied to clipboard" notification for a seamless experience.

## [0.2.5] - 2026-02-05

### Added
- Feature: Added ability to edit existing toolbar items (commands, AI, urls, shortcuts).
- Localization: Added comprehensive translations for edit modals.

### Improved
- UI: Added "Edit" button (pencil icon) to toolbar items in settings.
- UX: Toolbar items in settings derived click-to-edit behavior.
- UI: Improved delete icon positioning for command groups.

### Fixed
- Fixed layout alignment for default command groups (Link, Shortcut) to allow proper deletion and display.

## [0.2.4] - 2026-02-04

### Fixed
- Addressed code review feedback (replaced inline styles with CSS classes, cleaned up manifest description).

## [0.2.3] - 2026-02-04

### Added
- Added built-in **Link** group with preset searches: Google, Google Scholar, Baidu, WeChat, DeepSeek, ChatGPT, Gemini, Doubao, Qianwen.
- Added built-in **Shortcut** group with presets: Toggle Todo (Alt+L), Find (Cmd+F).

## [0.2.2] - 2026-02-04

### Polish
- Removed debug logs introduced in v0.2.1 for troubleshooting purposes.

## [0.2.1] - 2026-02-04

### Fixed
- Fixed an issue where clicking on shortcut toolbar items did not trigger the action.

## [0.2.0] - 2026-02-04

### Added
- Added support for **Keyboard Shortcuts** in the toolbar, allowing triggering of system hotkeys (macOS supported).
- Implemented **Auto-capture** for shortcut input: users can press keys to record the shortcut combination.
- Added localization for shortcut features.

## [0.1.2] - 2026-02-04

### Added
- Added support for System Shortcuts and URL/Link commands.
- Added support for `{{selection}}` placeholder in URL commands.
- Added "Add Link/Shortcut" button in settings.



## [0.1.1] - 2026-02-03

### Fixed
- Fixed built-in commands and templates remaining in Chinese when language content is set to English.
