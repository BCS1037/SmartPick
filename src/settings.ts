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
  promptTemplateId?: string;    // For AI commands
  url?: string;                 // For URL/URI commands
  shortcutKeys?: string;        // For Keyboard Shortcuts
  group: string;
  order: number;
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
  commandGroups: CommandGroup[];
  toolbarPosition: 'above' | 'below';
  toolbarVerticalOffset: number;
  
  // AI
  aiConfig: AIConfig;
  
  // Prompt Templates
  promptTemplates: PromptTemplate[];
  
  // Conversation History (for multi-turn)
  enableMultiTurn: boolean;
  maxHistoryTurns: number;
  
  // Language
  language: 'zh' | 'en' | 'auto';
  
  // Double-click trigger
  enableDoubleClickTrigger: boolean;
}

// Default built-in prompt templates
const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'translate',
    name: '翻译',
    category: '翻译',
    prompt: 'Please translate the following text into Chinese, return only the translation without any explanation:\n\n{{selection}}',
    outputAction: 'replace',
    isBuiltin: true,
  },
  {
    id: 'summarize',
    name: '总结',
    category: '文本处理',
    prompt: '请用简洁的语言总结以下内容的要点：\n\n{{selection}}',
    outputAction: 'insert',
    isBuiltin: true,
  },
  {
    id: 'explain',
    name: '解释',
    category: '文本处理',
    prompt: '请用通俗易懂的语言解释以下内容：\n\n{{selection}}',
    outputAction: 'insert',
    isBuiltin: true,
  },
  {
    id: 'improve-writing',
    name: '改进写作',
    category: '写作',
    prompt: '请改进以下文本的写作质量，使其更加清晰、流畅和专业，只返回改进后的文本：\n\n{{selection}}',
    outputAction: 'replace',
    isBuiltin: true,
  },
  {
    id: 'fix-grammar',
    name: '修正语法',
    category: '写作',
    prompt: '请修正以下文本中的语法和拼写错误，只返回修正后的文本：\n\n{{selection}}',
    outputAction: 'replace',
    isBuiltin: true,
  },
  {
    id: 'expand',
    name: '扩展内容',
    category: '写作',
    prompt: '请扩展以下内容，添加更多细节和解释：\n\n{{selection}}',
    outputAction: 'insert',
    isBuiltin: true,
  },
  {
    id: 'simplify',
    name: '简化',
    category: '文本处理',
    prompt: '请简化以下内容，使其更加简洁易懂：\n\n{{selection}}',
    outputAction: 'replace',
    isBuiltin: true,
  },
];

// Default toolbar items
const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    id: 'bold',
    type: 'command',
    icon: 'bold',
    tooltip: '加粗',
    enabled: true,
    commandId: 'editor:toggle-bold',
    group: 'builtin',
    order: 0,
  },
  {
    id: 'superscript',
    type: 'command',
    icon: 'superscript',
    tooltip: '上标',
    enabled: true,
    commandId: 'smartpick:superscript',
    group: 'builtin',
    order: 1,
  },
  {
    id: 'subscript',
    type: 'command',
    icon: 'subscript',
    tooltip: '下标',
    enabled: true,
    commandId: 'smartpick:subscript',
    group: 'builtin',
    order: 2,
  },
  {
    id: 'highlight',
    type: 'command',
    icon: 'highlighter',
    tooltip: '高亮',
    enabled: false,
    commandId: 'editor:toggle-highlight',
    group: 'builtin',
    order: 3,
  },
  {
    id: 'quote',
    type: 'command',
    icon: 'quote',
    tooltip: '引用',
    enabled: true,
    commandId: 'editor:toggle-blockquote',
    group: 'builtin',
    order: 4,
  },
  {
    id: 'footnote',
    type: 'command',
    icon: 'footprints',
    tooltip: '脚注',
    enabled: true,
    commandId: 'markdown:insert-footnote',
    group: 'builtin',
    order: 5,
  },
  {
    id: 'callout',
    type: 'command',
    icon: 'alert-circle',
    tooltip: '插入 Callout',
    enabled: true,
    commandId: 'editor:insert-callout',
    group: 'builtin',
    order: 6,
  },
  {
    id: 'copy',
    type: 'command',
    icon: 'copy',
    tooltip: '复制',
    enabled: true,
    commandId: 'smartpick:copy',
    group: 'builtin',
    order: 7,
  },
  {
    id: 'paste',
    type: 'command',
    icon: 'clipboard',
    tooltip: '粘贴',
    enabled: true,
    commandId: 'smartpick:paste',
    group: 'builtin',
    order: 8,
  },
  {
    id: 'cut',
    type: 'command',
    icon: 'scissors',
    tooltip: '剪切',
    enabled: false,
    commandId: 'smartpick:cut',
    group: 'builtin',
    order: 9,
  },
  {
    id: 'inline-code',
    type: 'command',
    icon: 'code',
    tooltip: '行内代码',
    enabled: true,
    commandId: 'editor:toggle-code',
    group: 'builtin',
    order: 10,
  },
  {
    id: 'code-block',
    type: 'command',
    icon: 'file-code',
    tooltip: '代码块',
    enabled: false,
    commandId: 'smartpick:insert-code-block',
    group: 'builtin',
    order: 11,
  },
  {
    id: 'table',
    type: 'command',
    icon: 'table',
    tooltip: '插入表格',
    enabled: false,
    commandId: 'editor:insert-table',
    group: 'builtin',
    order: 12,
  },
  {
    id: 'clear-formatting',
    type: 'command',
    icon: 'remove-formatting',
    tooltip: '清除格式',
    enabled: true,
    commandId: 'smartpick:clear-formatting',
    group: 'builtin',
    order: 13,
  },
  {
    id: 'sep1',
    type: 'separator',
    icon: '',
    tooltip: '',
    enabled: true,
    group: '',
    order: 14,
  },
  {
    id: 'ai-translate',
    type: 'ai',
    icon: 'languages',
    tooltip: '翻译',
    enabled: true,
    promptTemplateId: 'translate',
    group: 'ai',
    order: 15,
  },
  {
    id: 'ai-summarize',
    type: 'ai',
    icon: 'file-text',
    tooltip: '总结',
    enabled: false,
    promptTemplateId: 'summarize',
    group: 'ai',
    order: 16,
  },
  {
    id: 'ai-explain',
    type: 'ai',
    icon: 'help-circle',
    tooltip: '解释',
    enabled: true,
    promptTemplateId: 'explain',
    group: 'ai',
    order: 17,
  },
  {
    id: 'link-google',
    type: 'url',
    icon: 'lucide-chrome',
    tooltip: 'Google',
    enabled: true,
    url: 'https://www.google.com/search?q={{selection}}',
    group: 'link',
    order: 0,
  },
  {
    id: 'link-google-scholar',
    type: 'url',
    icon: 'graduation-cap',
    tooltip: 'Google Scholar',
    enabled: false,
    url: 'https://scholar.google.com/scholar?q={{selection}}',
    group: 'link',
    order: 1,
  },
  {
    id: 'link-baidu',
    type: 'url',
    icon: 'lucide-paw-print',
    tooltip: 'Baidu',
    enabled: false,
    url: 'https://www.baidu.com/s?wd={{selection}}',
    group: 'link',
    order: 2,
  },
  {
    id: 'link-chatgpt',
    type: 'url',
    icon: 'bot',
    tooltip: 'ChatGPT',
    enabled: false,
    url: 'https://chatgpt.com/?q={{selection}}',
    group: 'link',
    order: 4,
  },
  {
    id: 'link-gemini',
    type: 'url',
    icon: 'sparkles',
    tooltip: 'Gemini',
    enabled: true,
    url: 'https://gemini.google.com/app?text={{selection}}',
    group: 'link',
    order: 5,
  },
  {
    id: 'link-deepseek',
    type: 'url',
    icon: 'lucide-fish',
    tooltip: 'DeepSeek',
    enabled: false,
    url: 'https://chat.deepseek.com/?q={{selection}}',
    group: 'link',
    order: 8,
  },
  {
    id: 'shortcut-todo',
    type: 'command',
    icon: 'check-square',
    tooltip: 'Toggle Todo',
    enabled: false,
    commandId: 'editor:toggle-checklist-status',
    group: 'shortcut',
    order: 0,
  },
  {
    id: 'shortcut-find',
    type: 'shortcut',
    icon: 'search',
    tooltip: 'Find',
    enabled: false,
    shortcutKeys: 'Cmd+F',
    group: 'shortcut',
    order: 1,
  },
];

const DEFAULT_GROUPS: CommandGroup[] = [
  { id: 'format', name: '格式', order: 0 },
  { id: 'ai', name: 'AI', order: 1 },
  { id: 'builtin', name: '内置工具集', order: 2 },
  { id: 'link', name: '链接', order: 3 },
  { id: 'shortcut', name: '快捷键', order: 4 },
];

// Redundant code removed. DEFAULT_TOOLBAR_ITEMS is already fully defined above.

export const DEFAULT_SETTINGS: SmartPickSettings = {
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
  commandGroups: DEFAULT_GROUPS,
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
  
  promptTemplates: DEFAULT_TEMPLATES,
  
  enableMultiTurn: false,
  maxHistoryTurns: 5,
  
  language: 'auto',
  
  enableDoubleClickTrigger: true,
};

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
