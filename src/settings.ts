// SmartPick Settings - Plugin settings and data structures

export type AIProvider = 'openai' | 'anthropic' | 'ollama' | 'custom';

export type OutputAction = 'replace' | 'insert' | 'clipboard';

export interface ToolbarItem {
  id: string;
  type: 'command' | 'ai' | 'separator' | 'url' | 'shortcut';
  icon: string;
  tooltip: string;
  enabled: boolean;             // Controls whether command shows in toolbar
  hotkey?: string;
  commandId?: string;           // For Obsidian commands
  promptTemplateId?: string;    // Legacy AI template ID, migrated to prompt
  prompt?: string;              // For inline AI commands
  outputAction?: OutputAction;  // How AI output is handled
  url?: string;                 // For URL/URI commands
  shortcutKeys?: string;        // For Keyboard Shortcuts
  group: string;
  order: number;
  isBuiltin?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  outputAction: OutputAction;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isBuiltin: boolean;
}

export interface CommandGroup {
  id: string;
  name: string;
  order: number;
}

export interface AIConfig {
  provider: AIProvider;
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
  availableModels: string[];
  temperature: number;
  maxTokens: number;
}

export interface SmartPickSettings {
  // Toolbar
  toolbarItems: ToolbarItem[];
  toolbarPosition: 'above' | 'below';
  toolbarVerticalOffset: number;
  
  // AI
  aiConfig: AIConfig;
  
  // Conversation History (for multi-turn)
  enableMultiTurn: boolean;
  maxHistoryTurns: number;
  
  // Double-click trigger
  enableDoubleClickTrigger: boolean;

  // Modifier key trigger
  enableModifierKeyTrigger: boolean;
  modifierKey: 'CmdOrCtrl' | 'Control' | 'Meta' | 'Alt' | 'Shift';

  // Migration version tracker (internal, do not display in settings UI)
  migrationVersion: number;
}

// Default toolbar items
const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    id: 'superscript',
    type: 'command',
    icon: 'superscript',
    tooltip: '上标',
    enabled: true,
    commandId: 'smartpick:superscript',
    group: 'builtin',
    order: 0,
    isBuiltin: true,
  },
  {
    id: 'subscript',
    type: 'command',
    icon: 'subscript',
    tooltip: '下标',
    enabled: true,
    commandId: 'smartpick:subscript',
    group: 'builtin',
    order: 1,
    isBuiltin: true,
  },
  {
    id: 'highlight',
    type: 'command',
    icon: 'highlighter',
    tooltip: '高亮',
    enabled: false,
    commandId: 'editor:toggle-highlight',
    group: 'builtin',
    order: 12,
    isBuiltin: true,
  },
  {
    id: 'footnote',
    type: 'command',
    icon: 'footprints',
    tooltip: '脚注',
    enabled: true,
    commandId: 'editor:insert-footnote',
    group: 'builtin',
    order: 7,
    isBuiltin: true,
  },
  {
    id: 'callout',
    type: 'command',
    icon: 'alert-circle',
    tooltip: '插入 Callout',
    enabled: true,
    commandId: 'editor:insert-callout',
    group: 'builtin',
    order: 8,
    isBuiltin: true,
  },
  {
    id: 'inline-code',
    type: 'command',
    icon: 'code',
    tooltip: '行内代码',
    enabled: true,
    commandId: 'editor:toggle-code',
    group: 'builtin',
    order: 2,
    isBuiltin: true,
  },
  {
    id: 'code-block',
    type: 'command',
    icon: 'file-code',
    tooltip: '代码块',
    enabled: false,
    commandId: 'smartpick:insert-code-block',
    group: 'builtin',
    order: 13,
    isBuiltin: true,
  },
  {
    id: 'table',
    type: 'command',
    icon: 'table',
    tooltip: '插入表格',
    enabled: false,
    commandId: 'editor:insert-table',
    group: 'builtin',
    order: 14,
    isBuiltin: true,
  },
  {
    id: 'clear-formatting',
    type: 'command',
    icon: 'remove-formatting',
    tooltip: '清除格式',
    enabled: true,
    commandId: 'smartpick:clear-formatting',
    group: 'builtin',
    order: 9,
    isBuiltin: true,
  },
  {
    id: 'paste-url-into-selection',
    type: 'command',
    icon: 'link-2',
    tooltip: '粘贴链接到选区',
    enabled: true,
    commandId: 'smartpick:paste-url-into-selection',
    group: 'builtin',
    order: 3,
    isBuiltin: true,
  },
  {
    id: 'copy-note',
    type: 'command',
    icon: 'clipboard-list',
    tooltip: '拷贝当前笔记内容',
    enabled: false,
    commandId: 'smartpick:copy-note',
    group: 'builtin',
    order: 15,
    isBuiltin: true,
  },
  {
    id: 'copy-note-file',
    type: 'command',
    icon: 'paperclip',
    tooltip: '拷贝当前笔记文件 (作为附件)',
    enabled: true,
    commandId: 'smartpick:copy-note-file',
    group: 'builtin',
    order: 4,
    isBuiltin: true,
  },
  {
    id: 'ai-translate',
    type: 'ai',
    icon: 'languages',
    tooltip: '翻译',
    enabled: true,
    prompt: 'Please translate the following text into Chinese, return only the translation without any explanation:\n\n{{selection}}',
    outputAction: 'replace',
    group: 'builtin',
    order: 5,
    isBuiltin: true,
  },
  {
    id: 'ai-summarize',
    type: 'ai',
    icon: 'file-text',
    tooltip: '总结',
    enabled: false,
    prompt: '请用简洁的语言总结以下内容的要点：\n\n{{selection}}',
    outputAction: 'insert',
    group: 'builtin',
    order: 16,
    isBuiltin: true,
  },
  {
    id: 'ai-explain',
    type: 'ai',
    icon: 'help-circle',
    tooltip: '解释',
    enabled: false,
    prompt: '请用通俗易懂的语言解释以下内容：\n\n{{selection}}',
    outputAction: 'insert',
    group: 'builtin',
    order: 17,
    isBuiltin: true,
  },
  {
    id: 'ai-improve-writing',
    type: 'ai',
    icon: 'pencil',
    tooltip: '改进写作',
    enabled: false,
    prompt: '请改进以下文本的写作质量，使其更加清晰、流畅和专业，只返回改进后的文本：\n\n{{selection}}',
    outputAction: 'replace',
    group: 'builtin',
    order: 18,
    isBuiltin: true,
  },
  {
    id: 'ai-fix-grammar',
    type: 'ai',
    icon: 'check-check',
    tooltip: '修正语法',
    enabled: false,
    prompt: '请修正以下文本中的语法和拼写错误，只返回修正后的文本：\n\n{{selection}}',
    outputAction: 'replace',
    group: 'builtin',
    order: 19,
    isBuiltin: true,
  },
  {
    id: 'ai-expand',
    type: 'ai',
    icon: 'arrow-up-right',
    tooltip: '扩展内容',
    enabled: false,
    prompt: '请扩展以下内容，添加更多细节和解释：\n\n{{selection}}',
    outputAction: 'insert',
    group: 'builtin',
    order: 20,
    isBuiltin: true,
  },
  {
    id: 'ai-simplify',
    type: 'ai',
    icon: 'minus-circle',
    tooltip: '简化',
    enabled: false,
    prompt: '请简化以下内容，使其更加简洁易懂：\n\n{{selection}}',
    outputAction: 'replace',
    group: 'builtin',
    order: 21,
    isBuiltin: true,
  },
  {
    id: 'link-google',
    type: 'url',
    icon: 'globe',
    tooltip: 'Google',
    enabled: true,
    url: 'https://www.google.com/search?q={{selection}}',
    group: 'builtin',
    order: 6,
    isBuiltin: true,
  },
  {
    id: 'link-google-scholar',
    type: 'url',
    icon: 'graduation-cap',
    tooltip: 'Google Scholar',
    enabled: false,
    url: 'https://scholar.google.com/scholar?q={{selection}}',
    group: 'builtin',
    order: 22,
    isBuiltin: true,
  },
  {
    id: 'link-baidu',
    type: 'url',
    icon: 'paw-print',
    tooltip: 'Baidu',
    enabled: false,
    url: 'https://www.baidu.com/s?wd={{selection}}',
    group: 'builtin',
    order: 23,
    isBuiltin: true,
  },
  {
    id: 'link-chatgpt',
    type: 'url',
    icon: 'bot',
    tooltip: 'ChatGPT',
    enabled: false,
    url: 'https://chatgpt.com/?q={{selection}}',
    group: 'builtin',
    order: 24,
    isBuiltin: true,
  },
  {
    id: 'link-gemini',
    type: 'url',
    icon: 'sparkles',
    tooltip: 'Gemini',
    enabled: false,
    url: 'https://gemini.google.com/app?text={{selection}}',
    group: 'builtin',
    order: 25,
    isBuiltin: true,
  },
  {
    id: 'link-deepseek',
    type: 'url',
    icon: 'fish',
    tooltip: 'DeepSeek',
    enabled: false,
    url: 'https://chat.deepseek.com/?q={{selection}}',
    group: 'builtin',
    order: 26,
    isBuiltin: true,
  },
  {
    id: 'shortcut-todo',
    type: 'command',
    icon: 'check-square',
    tooltip: 'Toggle Todo',
    enabled: false,
    commandId: 'editor:toggle-checklist-status',
    group: 'builtin',
    order: 27,
    isBuiltin: true,
  },
];

export const DEFAULT_SETTINGS: SmartPickSettings = {
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
  toolbarPosition: 'above',
  toolbarVerticalOffset: 26,
  
  aiConfig: {
    provider: 'openai',
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    defaultModel: 'gpt-4o-mini',
    availableModels: [],
    temperature: 0.7,
    maxTokens: 2000,
  },
  
  enableMultiTurn: false,
  maxHistoryTurns: 5,
  
  enableDoubleClickTrigger: true,

  enableModifierKeyTrigger: false,
  modifierKey: 'CmdOrCtrl',

  migrationVersion: 3,
};

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
