// SmartPick Settings - Plugin settings and data structures

export type AIProvider = 'openai' | 'anthropic' | 'ollama' | 'custom';

export type OutputAction = 'replace' | 'insert' | 'clipboard';

export interface ToolbarItem {
  id: string;
  type: 'command' | 'ai' | 'separator' | 'url' | 'shortcut';
  icon: string;
  tooltip: string;
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
  toolbarDelay: number;
  toolbarOffsetTop: number;
  toolbarOffsetLeft: number;
  
  // AI
  aiConfig: AIConfig;
  
  // Prompt Templates
  promptTemplates: PromptTemplate[];
  
  // Conversation History (for multi-turn)
  enableMultiTurn: boolean;
  maxHistoryTurns: number;
  
  // Language
  language: 'zh' | 'en' | 'auto';
}

// Default built-in prompt templates
const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'translate-en',
    name: '翻译为英文',
    category: '翻译',
    prompt: '请将以下文本翻译成英文，只返回翻译结果，不要有任何解释：\n\n{{selection}}',
    outputAction: 'replace',
    isBuiltin: true,
  },
  {
    id: 'translate-zh',
    name: '翻译为中文',
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
    commandId: 'editor:toggle-bold',
    group: 'format',
    order: 0,
  },
  {
    id: 'italic',
    type: 'command',
    icon: 'italic',
    tooltip: '斜体',
    commandId: 'editor:toggle-italics',
    group: 'format',
    order: 1,
  },
  {
    id: 'highlight',
    type: 'command',
    icon: 'highlighter',
    tooltip: '高亮',
    commandId: 'editor:toggle-highlight',
    group: 'format',
    order: 2,
  },
  {
    id: 'sep1',
    type: 'separator',
    icon: '',
    tooltip: '',
    group: '',
    order: 3,
  },
  {
    id: 'ai-translate',
    type: 'ai',
    icon: 'languages',
    tooltip: '翻译',
    promptTemplateId: 'translate-en',
    group: 'ai',
    order: 4,
  },
  {
    id: 'ai-summarize',
    type: 'ai',
    icon: 'file-text',
    tooltip: '总结',
    promptTemplateId: 'summarize',
    group: 'ai',
    order: 5,
  },
  {
    id: 'ai-explain',
    type: 'ai',
    icon: 'help-circle',
    tooltip: '解释',
    promptTemplateId: 'explain',
    group: 'ai',
    order: 6,
  },
  {
    id: 'link-google',
    type: 'url',
    icon: 'search',
    tooltip: 'Google',
    url: 'https://www.google.com/search?q={{selection}}',
    group: 'link',
    order: 0,
  },
  {
    id: 'link-google-scholar',
    type: 'url',
    icon: 'graduation-cap',
    tooltip: 'Google Scholar',
    url: 'https://scholar.google.com/scholar?q={{selection}}',
    group: 'link',
    order: 1,
  },
  {
    id: 'link-baidu',
    type: 'url',
    icon: 'search',
    tooltip: 'Baidu',
    url: 'https://www.baidu.com/s?wd={{selection}}',
    group: 'link',
    order: 2,
  },
  {
    id: 'link-wechat',
    type: 'url',
    icon: 'message-circle',
    tooltip: 'WeChat',
    url: 'https://weixin.sogou.com/weixin?type=2&query={{selection}}',
    group: 'link',
    order: 3,
  },
  {
    id: 'link-chatgpt',
    type: 'url',
    icon: 'bot',
    tooltip: 'ChatGPT',
    url: 'https://chatgpt.com/?q={{selection}}',
    group: 'link',
    order: 4,
  },
  {
    id: 'link-gemini',
    type: 'url',
    icon: 'sparkles',
    tooltip: 'Gemini',
    url: 'https://gemini.google.com/app?text={{selection}}',
    group: 'link',
    order: 5,
  },
  {
    id: 'link-doubao',
    type: 'url',
    icon: 'message-square',
    tooltip: 'Doubao',
    url: 'https://www.doubao.com/chat/?q={{selection}}',
    group: 'link',
    order: 6,
  },
  {
    id: 'link-qianwen',
    type: 'url',
    icon: 'message-square',
    tooltip: 'Qianwen',
    url: 'https://tongyi.aliyun.com/qianwen/?q={{selection}}',
    group: 'link',
    order: 7,
  },
  {
    id: 'link-deepseek',
    type: 'url',
    icon: 'search',
    tooltip: 'DeepSeek',
    url: 'https://chat.deepseek.com/?q={{selection}}',
    group: 'link',
    order: 8,
  },
  {
    id: 'shortcut-todo',
    type: 'command',
    icon: 'check-square',
    tooltip: 'Toggle Todo',
    commandId: 'editor:toggle-checklist-status',
    group: 'shortcut',
    order: 0,
  },
  {
    id: 'shortcut-find',
    type: 'shortcut',
    icon: 'search',
    tooltip: 'Find',
    shortcutKeys: 'Cmd+F',
    group: 'shortcut',
    order: 1,
  },
];

const DEFAULT_GROUPS: CommandGroup[] = [
  { id: 'format', name: '格式', order: 0 },
  { id: 'ai', name: 'AI', order: 1 },
  { id: 'link', name: '链接', order: 2 },
  { id: 'shortcut', name: '快捷键', order: 3 },
];

export const DEFAULT_SETTINGS: SmartPickSettings = {
  toolbarItems: DEFAULT_TOOLBAR_ITEMS,
  commandGroups: DEFAULT_GROUPS,
  toolbarPosition: 'above',
  toolbarDelay: 200,
  toolbarOffsetTop: 28,
  toolbarOffsetLeft: 0,
  
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
};

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
