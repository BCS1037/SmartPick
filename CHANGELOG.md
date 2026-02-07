# Changelog

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
