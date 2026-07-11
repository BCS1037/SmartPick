# Changelog

## [0.8.1] - 2026-07-11

### Changed
- **Mobile toolbar placement**: The selection toolbar now appears below the Obsidian page header, keeping page-header actions reachable and avoiding the native selection menu and keyboard.
- **Mobile More actions**: Tapping `...` opens a same-width, horizontally scrollable second toolbar row. Desktop keeps the vertical More menu.
- **Toolbar timing**: Removed the configurable delay and mobile minimum wait. Selection checks now use a fixed 200 ms delay.
- **Settings layout**: Settings content now uses a centered 700 px column, and tab buttons size to their labels.

### Fixed
- **Mobile selection preservation**: Tapping `...` keeps the active CodeMirror selection, so overflow actions apply to the selected text.
- **Desktop More menu placement**: The menu now chooses available space above or below its toolbar and becomes scrollable when space is limited.
- **Desktop dismissal**: Outside clicks are captured before CodeMirror can stop propagation, closing both the toolbar and More menu without reopening from the same mouse gesture.
- **Settings review compliance**: Replaced the broad CSS `:has()` selector with an explicit settings-host class.

## [0.8.0] - 2026-07-09

### Added

- **Mobile support**: SmartPick can now load on Obsidian mobile with touch selection detection, mobile toolbar sizing, and mobile-friendly command ordering controls.
- **Mobile note sharing**: Copy current note file now opens the system share sheet on mobile and falls back to copying note content when file sharing is unavailable.
- **Settings import/export**: Added JSON export and import from the AI settings tab. Exports include toolbar commands, AI commands, provider settings, model settings, and behavior options.
- **Optional API key export**: API keys are excluded by default. Users can explicitly include them when creating a trusted local backup.
- **Automatic settings backups**: SmartPick now writes a backup in the plugin directory before settings migration or import.

### Fixed

- **Mobile toolbar positioning**: Mobile toolbar placement now anchors to the selected text center and clamps to the viewport to avoid drifting off target.
- **Settings migration preservation**: Future migrations now preserve existing AI configuration and user-customized built-in AI command prompts/output behavior instead of resetting them to defaults.

## [0.7.5] - 2026-06-28

### Fixed

- **Store Compliance & API Deprecations**:
  - Bumped `minAppVersion` to `1.13.0` to officially align with declarative settings APIs (`getSettingDefinitions`, `update()`).
  - Replaced custom HTML heading tags in the settings tab with native `Setting` header components for consistent UI styling.
  - Replaced all deprecated `.setWarning()` calls with `.setDestructive()` for destructive actions.
  - Switched from `activeWindow.setTimeout` to `window.setTimeout` for timer functions.
  - Removed deprecated `.setDynamicTooltip()` calls on sliders and removed duplicated `.setValue()` calls.
  - Simplified settings tab `refresh()` code and bypassed the deprecated `display()` handler.

## [0.7.4] - 2026-06-28

### Added

- **Inline AI commands**: AI prompts are now stored directly on toolbar commands. AI commands can be edited in place, including name, prompt, icon, and output behavior.
- **Unified command creation**: The Add command flow now opens a command-type picker for Obsidian commands, AI commands, web links, and keyboard shortcuts.
- **More menu**: The selection toolbar shows the first 8 enabled commands and moves the rest into a More menu, with a direct SmartPick settings shortcut at the bottom.

### Changed

- **Prompt architecture migration**: Removed the standalone prompt templates tab. Existing custom prompt templates are migrated into custom AI commands, and legacy AI commands are backfilled with inline prompts.
- **Toolbar command management**: Settings now separate custom commands and built-in commands into compact icon grids with enable/disable controls and drag sorting.
- **Default command set**: Reduced the default enabled toolbar commands to keep the toolbar shorter and move less common actions behind user opt-in.

### Fixed

- **Settings alignment**: Fixed SmartPick settings alignment in Obsidian's settings modal, including host content padding, declarative setting-row padding, and inherited `h3` title padding inside command cards.
- **Settings tab refresh**: Fixed unstable settings tab refresh behavior under Obsidian 1.13+ declarative settings.

## [0.7.0] - 2026-05-27

### Added

- **Quiet Mode (Hold Modifier to Trigger)**: Added a highly anticipated quiet-mode trigger mechanism. Users can now choose to only show the SmartPick toolbar when holding down a specific modifier key while selecting text, completely eliminating accidental hover popups.
- **Custom Modifier Keys**: Provided flexible settings to select the trigger key in options. Options include `Cmd / Ctrl` (smart OS-native fallback), `Ctrl`, `Cmd (Mac)`, `Alt / Option`, and `Shift`.
- **Dynamic Conditional Settings UI**: The custom modifier key dropdown is conditionally rendered only when the Quiet Mode toggle is active, utilizing dynamic re-rendering on toggle changes.
- **Zero-Conflict Native Key Interception**: Leveraged synchronous event modifier checks (`e.shiftKey`, `e.altKey`, etc.) directly on native `mouseup` and `keyup` listeners, ensuring complete immunity from complex key sequence lag or standard system shortcut overrides (e.g. `Cmd+C`).

## [0.6.7] - 2026-05-13

### Fixed

- **Documentation**: Updated repository URLs in `README.md` to point to the correct GitHub repository (`BCS1037/SmartPick`) to resolve community review warnings.

## [0.6.6] - 2026-05-13

### Fixed

- **CSS Compliance**: Removed all `!important` declarations from `styles.css` and `styles/styles.css` to comply with Obsidian community plugin requirements. Increased selector specificity (e.g., using `button.class`) to ensure styles remain correctly applied.

## [0.6.5] - 2026-05-13

### Fixed

- **Plugin Submission**: Addressed remaining Obsidian community review feedback:
  - Bumped `minAppVersion` to `1.8.7` for `getLanguage` API compatibility.
  - Added release notes generation to GitHub Actions release workflow.
  - Resolved `require('electron')` issues by avoiding explicit string requires.
  - Cleaned up ESLint `any` warnings with proper typing for `loadData()` and Electron APIs.
  - Removed unused variable errors in try-catch blocks.
  - Switched from `activeWindow.setTimeout` to `window.setTimeout` for timer compatibility.
  - Switched from `requestAnimationFrame` to `window.requestAnimationFrame`.
- **Popout Window Crash**: Fixed a `HierarchyRequestError` that caused the toolbar to fail to appear. The issue was due to improperly creating elements on the root `activeDocument` object instead of within the view's content element.

## [0.6.4] - 2026-05-13

### Fixed

- **Popout Window Crash**: Fixed a `HierarchyRequestError` that caused the toolbar to fail to appear. The issue was due to improperly creating elements on the root `activeDocument` object instead of within the view's content element.

## [0.6.3] - 2026-05-13

### Fixed

- **Code Quality**: Addressed all remaining Obsidian plugin review issues for final community submission:
  - Replaced all explicit `any` types with proper interfaces in AI providers (`AnthropicProvider`, `OllamaProvider`, `OpenAIProvider`).
  - Replaced raw DOM API calls (`document`, `window`, `navigator`) with Obsidian native APIs (`activeDocument`, `activeWindow`, `Platform`) to ensure popout window compatibility.
  - Refactored language detection to use Obsidian's `getLanguage()` API instead of raw `localStorage`.
  - Added GitHub Actions artifact attestation to release workflow (`.github/workflows/release.yml`) for security provenance.
  - Bumped `minAppVersion` to `1.4.4` to satisfy new Obsidian API requirements.
  - Removed deprecated `builtin-modules` package dependency and migrated to native Node.js `node:module`.
  - Cleaned up unused variables and unused ESLint rules.
## [0.6.2] - 2026-04-11

### Fixed

- **Settings Persistence**: Fixed a critical bug where user-customized command enabled/disabled states were reset to defaults on every Obsidian restart. The migration logic that syncs defaults now only runs once, and user preferences are properly preserved across restarts.
- **Command Palette**: Fixed duplicate plugin name prefix in command palette — commands previously showed as "SmartPick: SmartPick: Copy" and now correctly display as "SmartPick: Copy".

## [0.6.1] - 2026-04-07

### Fixed

- **Copy Note File**: Resolves an issue on MacOS where pasting a copied file via `CMD+V` would only paste the file path string in apps relying on `text/plain`. We now utilize the native Electron Buffer API (`public.file-url`) for seamless and reliable file object attachment compatibility across Finder and major applications.


## [0.6.0] - 2026-04-07

### Added

- **Copy Note File**: New command to copy the entire markdown file object to the system clipboard.
  - Icon: `paperclip` (Lucide).
  - Functionality: Allows users to paste the note as an attachment directly into AI chat interfaces (ChatGPT, Claude, etc.).
- **Copy Note Content**: New command to copy the full markdown content of the current note.

### Improved

- **Settings UI Redesign**: Major overhaul of the configuration interface for better clarity and efficiency:
  - **8-Column Grid**: Toolbar items now display in a compact 8-column layout.
  - **Hover Labels**: Command names are hidden by default and appear as high-contrast tooltips (above icons) on hover.
  - **Progressive Disclosure**: AI badges and visibility toggles are hidden until hover to reduce visual clutter.
  - **Unified Backgrounds**: Icon backgrounds now expand to fill the entire rectangular frame of each item.

## [0.5.7] - 2026-04-02
- **AI Configuration**: Added support for manual model ID input in settings.
- **AI Streaming**: Optimized response rendering (150ms interval) for smoother generation and reduced UI stutter.

## [0.5.3] - 2026-02-15

### Maintenance

- **Internal**: Moved PRD directory out of the repository structure.

## [0.5.2] - 2026-02-14

### Fixed

- **Commands**: Fixed `insert-footnote` command ID to `editor:insert-footnote` and updated icon to `lucide-footprints`.

## [0.5.1] - 2026-02-12

### Fixed

- **Icons**: Corrected icons for Google and Baidu search commands to use `lucide-chrome` and `lucide-paw-print`.

## [0.5.0] - 2026-02-12

### Added

- **Commands**: Added **Insert Quote** and **Insert Footnote** commands to the built-in tools.

### Improved

- **Toolbar Configuration**: Updated the default toolbar items:
  - Removed **Italic** command from built-in tools.
  - Streamlined default enabled commands to reduce clutter (enabled: Bold, Superscript, Subscript, Inline Code, Quote, Footnote, Callout, Copy, Paste, Clear Formatting, Translate, Explain, Google, Gemini).
- **Icons**: Updated icons for Google, Baidu, and DeepSeek commands for better visual recognition.

### Fixed

- **Toolbar**: Resolved an issue where duplicate items appeared in the built-in tools group.
- **Migration**: Improved settings migration to ensure new defaults are correctly applied to existing users.

## [0.4.1] - 2026-02-12

### Fixed

- **Toolbar**: Fixed an issue where the toolbar was not visible when selecting all text (`Cmd+A`) in long documents. The toolbar now automatically repositions to remain visible at the top of the viewport.

## [0.4.0] - 2026-02-10

### Added

- **Feature**: Double-click to show toolbar — double-clicking in the editor area now triggers the toolbar, even without selecting text. Ideal for insert-type commands (e.g., insert table, callout, code block).
- **Setting**: Added toggle to enable/disable the double-click trigger in toolbar settings.
- **UI**: Buttons that require text selection (AI, URL) are visually disabled when no text is selected.

## [0.3.3] - 2026-02-10

### Added

- **Feature**: Added enable/disable toggle for commands, allowing users to hide commands from the toolbar without deleting them.

### Improved

- **UI**: Reduced spacing in command groups on settings page for a more compact layout:
  - Decreased group padding and margins.
  - Reduced title font size and spacing.
  - Optimized vertical space usage between groups.

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
