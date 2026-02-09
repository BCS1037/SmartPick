// SmartPick i18n - Internationalization support
// Supports Chinese and English

export type Language = 'zh' | 'en';

export interface I18nStrings {
  // Plugin
  pluginName: string;
  pluginDescription: string;
  
  // Settings
  settingsTitle: string;
  generalSettings: string;
  language: string;
  languageDesc: string;
  auto: string;
  zh: string;
  en: string;
  toolbarSettings: string;
  aiSettings: string;
  promptTemplates: string;
  
  // Toolbar Settings
  toolbarDelay: string;
  toolbarDelayDesc: string;
  toolbarVerticalOffset: string;
  toolbarVerticalOffsetDesc: string;
  toolbarHorizontalOffset: string;
  toolbarHorizontalOffsetDesc: string;
  addCommand: string;
  addAICommand: string;
  addUrlCommand: string;
  addShortcutCommand: string;
  removeCommand: string;
  commandGroup: string;
  newGroup: string;
  ungrouped: string;
  enterCommandId: string;
  commandNotFound: string;
  enterTooltip: string;
  enterIconName: string;
  enterUrl: string;
  enterShortcut: string;
  enterName: string;
  editCommand: string;
  editAICommand: string;
  editUrlCommand: string;
  editShortcutCommand: string;
  delete: string;
  deleteCommand: string;
  deleteCommandDesc: string;
  save: string;
  selectTemplateId: string;
  templateNotFound: string;
  enterGroupName: string;
  selectCommand: string;
  selectIcon: string;
  searchCommands: string;
  searchIcons: string;
  defaultIcon: string;
  
  // AI Settings
  apiProvider: string;
  apiProviderDesc: string;
  apiUrl: string;
  apiUrlDesc: string;
  apiKey: string;
  apiKeyDesc: string;
  fetchModels: string;
  fetchModelsDesc: string;
  fetchingModels: string;
  selectModel: string;
  selectModelDesc: string;
  temperature: string;
  temperatureDesc: string;
  maxTokens: string;
  maxTokensDesc: string;
  testConnection: string;
  connectionSuccess: string;
  connectionFailed: string;
  
  // Prompt Templates
  templateName: string;
  templatePrompt: string;
  templateCategory: string;
  addNewTemplate: string;
  addTemplate: string;
  editTemplate: string;
  deleteTemplate: string;
  defaultTemplates: string;
  customTemplates: string;
  cantEditBuiltin: string;
  
  // Toolbar
  toolbarTooltip: string;
  
  // Preview Modal
  previewTitle: string;
  replace: string;
  insert: string;
  copy: string;
  cancel: string;
  generating: string;
  
  // Messages
  noSelection: string;
  apiKeyRequired: string;
  modelRequired: string;
  error: string;
  success: string;

  // Built-in Commands & Groups
  command_bold: string;
  command_italic: string;
  command_highlight: string;
  command_ai_translate: string;
  command_ai_summarize: string;
  command_ai_explain: string;
  
  group_format: string;
  group_ai: string;
  group_link: string;
  group_shortcut: string;
  group_ungrouped_name: string;
  
  // Built-in Templates
  template_translate: string;
  template_summarize: string;
  template_explain: string;
  template_improve_writing: string;
  template_fix_grammar: string;
  template_expand: string;
  template_simplify: string;
}

const zh: I18nStrings = {
  // Plugin
  pluginName: '智能划词工具栏',
  pluginDescription: '选中文本自动弹出工具栏，支持自定义命令和AI功能',
  
  // Settings
  settingsTitle: '智能划词工具栏设置',
  generalSettings: '通用设置',
  language: '语言',
  languageDesc: '插件界面语言（需要重启）',
  auto: '自动',
  zh: '中文',
  en: '英文',
  toolbarSettings: '工具栏设置',
  aiSettings: 'AI 设置',
  promptTemplates: '提示词模板',
  
  // Toolbar Settings
  toolbarDelay: '工具栏延迟',
  toolbarDelayDesc: '选中文本后工具栏弹出的延迟时间（毫秒）',
  toolbarVerticalOffset: '工具栏垂直偏移',
  toolbarVerticalOffsetDesc: '距离文本的垂直距离（像素）',
  toolbarHorizontalOffset: '工具栏水平偏移',
  toolbarHorizontalOffsetDesc: '水平偏移距离（像素）',
  addCommand: '添加命令',
  addAICommand: '添加 AI 命令',
  addUrlCommand: '添加链接/快捷指令',
  addShortcutCommand: '添加键盘快捷键',
  removeCommand: '移除命令',
  commandGroup: '命令分组',
  newGroup: '新建分组',
  ungrouped: '未分组',
  enterCommandId: '输入命令 ID (例如: editor:toggle-bold):',
  commandNotFound: '未找到命令',
  enterTooltip: '输入提示文本:',
  enterIconName: '输入图标名称 (lucide):',
  enterUrl: '输入链接或 URL Scheme:',
  enterShortcut: '输入快捷键 (例如: Cmd+Shift+S):',
  enterName: '输入名称:',
  editCommand: '编辑命令',
  editAICommand: '编辑 AI 命令',
  editUrlCommand: '编辑链接命令',
  editShortcutCommand: '编辑快捷键',
  delete: '删除',
  deleteCommand: '删除命令',
  deleteCommandDesc: '确定要删除此命令吗？此操作无法撤销。',
  save: '保存',
  selectTemplateId: '选择模板 ID:',
  templateNotFound: '未找到模板',
  enterGroupName: '输入分组名称:',
  selectCommand: '选择命令',
  selectIcon: '选择图标',
  searchCommands: '搜索命令...',
  searchIcons: '搜索图标...',
  defaultIcon: '默认图标',
  
  // AI Settings
  apiProvider: 'API 提供商',
  apiProviderDesc: '选择你想要使用的 AI 提供商',
  apiUrl: 'API 地址',
  apiUrlDesc: 'API 的基础地址',
  apiKey: 'API 密钥',
  apiKeyDesc: '安全的 API 密钥',
  fetchModels: '获取模型',
  fetchModelsDesc: '从提供商获取可用模型',
  fetchingModels: '正在获取模型...',
  selectModel: '选择模型',
  selectModelDesc: '选择 AI 任务的默认模型',
  temperature: '温度',
  temperatureDesc: '创造力水平 (0.0 - 1.0)',
  maxTokens: '最大 Token 数',
  maxTokensDesc: '响应的最大长度',
  testConnection: '测试连接',
  connectionSuccess: '连接成功',
  connectionFailed: '连接失败',
  
  // Prompt Templates
  templateName: '模板名称',
  templatePrompt: '提示词内容',
  templateCategory: '模板分类',
  addNewTemplate: '添加新模板',
  addTemplate: '添加模板',
  editTemplate: '编辑模板',
  deleteTemplate: '删除模板',
  defaultTemplates: '默认模板',
  customTemplates: '自定义模板',
  cantEditBuiltin: '内置模板无法直接修改（等待实现复制功能）',
  
  // Toolbar
  toolbarTooltip: '智能工具栏',
  
  // Preview Modal
  previewTitle: 'AI 响应预览',
  replace: '替换',
  insert: '插入',
  copy: '复制',
  cancel: '取消',
  generating: '正在生成...',
  
  // Messages
  noSelection: '请先选中文本',
  apiKeyRequired: '请先配置 API 密钥',
  modelRequired: '请先选择模型',
  error: '错误',
  success: '成功',

  // Built-in Commands & Groups
  command_bold: '加粗',
  command_italic: '斜体',
  command_highlight: '高亮',
  command_ai_translate: '翻译',
  command_ai_summarize: '总结',
  command_ai_explain: '解释',
  
  group_format: '格式',
  group_ai: 'AI',
  group_link: '链接',
  group_shortcut: '快捷键',
  group_ungrouped_name: '未分组',
  
  // Built-in Templates
  template_translate: '翻译',
  template_summarize: '总结',
  template_explain: '解释',
  template_improve_writing: '改进写作',
  template_fix_grammar: '修正语法',
  template_expand: '扩展内容',
  template_simplify: '简化',
};

const en: I18nStrings = {
  // Plugin
  pluginName: 'SmartPick',
  pluginDescription: 'Smart text selection toolbar with custom commands and AI features',
  
  // Settings
  settingsTitle: 'SmartPick settings',
  generalSettings: 'General settings',
  language: 'Language',
  languageDesc: 'Plugin interface language (requires restart)',
  auto: 'Auto',
  zh: 'Chinese',
  en: 'English',
  toolbarSettings: 'Toolbar settings',
  aiSettings: 'AI settings',
  promptTemplates: 'Prompt templates',
  
  // Toolbar Settings
  toolbarDelay: 'Toolbar delay',
  toolbarDelayDesc: 'Delay before toolbar appears after selection (ms)',
  toolbarVerticalOffset: 'Toolbar vertical offset',
  toolbarVerticalOffsetDesc: 'Vertical distance from text (pixels)',
  toolbarHorizontalOffset: 'Toolbar horizontal offset',
  toolbarHorizontalOffsetDesc: 'Horizontal shift (pixels)',
  addCommand: 'Add command',
  addAICommand: 'Add AI command',
  addUrlCommand: 'Add link/shortcut',
  addShortcutCommand: 'Add keyboard shortcut',
  removeCommand: 'Remove command',
  commandGroup: 'Command group',
  newGroup: 'New group',
  ungrouped: 'Ungrouped',
  enterCommandId: 'Enter command ID (e.g., editor:toggle-bold):',
  commandNotFound: 'Command not found',
  enterTooltip: 'Enter tooltip:',
  enterIconName: 'Enter icon name (lucide):',
  enterUrl: 'Enter link or URL scheme:',
  enterShortcut: 'Enter shortcut (e.g., Cmd+Shift+S):',
  enterName: 'Enter name:',
  editCommand: 'Edit command',
  editAICommand: 'Edit AI command',
  editUrlCommand: 'Edit link command',
  editShortcutCommand: 'Edit shortcut',
  delete: 'Delete',
  deleteCommand: 'Delete command',
  deleteCommandDesc: 'Are you sure you want to delete this command? This action cannot be undone.',
  save: 'Save',
  selectTemplateId: 'Select template ID:',
  templateNotFound: 'Template not found',
  enterGroupName: 'Enter group name:',
  selectCommand: 'Select command',
  selectIcon: 'Select icon',
  searchCommands: 'Search commands...',
  searchIcons: 'Search icons...',
  defaultIcon: 'Default icon',
  
  // AI Settings
  apiProvider: 'API provider',
  apiProviderDesc: 'Select the AI provider you want to use',
  apiUrl: 'API URL',
  apiUrlDesc: 'Base URL for the API',
  apiKey: 'API key',
  apiKeyDesc: 'Secret API key (stored securely)',
  fetchModels: 'Fetch models',
  fetchModelsDesc: 'Retrieve available models from the provider',
  fetchingModels: 'Fetching models...',
  selectModel: 'Select model',
  selectModelDesc: 'Select the default model for AI tasks',
  temperature: 'Temperature',
  temperatureDesc: 'Creativity level (0.0 - 1.0)',
  maxTokens: 'Max tokens',
  maxTokensDesc: 'Maximum length of response',
  testConnection: 'Test connection',
  connectionSuccess: 'Connection successful',
  connectionFailed: 'Connection failed',
  
  // Prompt Templates
  templateName: 'Template name',
  templatePrompt: 'Prompt content',
  templateCategory: 'Category',
  addNewTemplate: 'Add new template',
  addTemplate: 'Add template',
  editTemplate: 'Edit template',
  deleteTemplate: 'Delete template',
  defaultTemplates: 'Default templates',
  customTemplates: 'Custom templates',
  cantEditBuiltin: 'Built-in templates cannot be modified directly (implementation pending copy feature)',
  
  // Toolbar
  toolbarTooltip: 'Smart toolbar',
  
  // Preview Modal
  previewTitle: 'AI response preview',
  replace: 'Replace',
  insert: 'Insert',
  copy: 'Copy',
  cancel: 'Cancel',
  generating: 'Generating...',
  
  // Messages
  noSelection: 'Please select text first',
  apiKeyRequired: 'Please configure API key first',
  modelRequired: 'Please select a model first',
  error: 'Error',
  success: 'Success',

  // Built-in Commands & Groups
  command_bold: 'Bold',
  command_italic: 'Italic',
  command_highlight: 'Highlight',
  command_ai_translate: 'Translate',
  command_ai_summarize: 'Summarize',
  command_ai_explain: 'Explain',
  
  group_format: 'Format',
  group_ai: 'AI',
  group_link: 'Links',
  group_shortcut: 'Shortcuts',
  group_ungrouped_name: 'Ungrouped',
  
  // Built-in Templates
  template_translate: 'Translate',
  template_summarize: 'Summarize',
  template_explain: 'Explain',
  template_improve_writing: 'Improve writing',
  template_fix_grammar: 'Fix grammar',
  template_expand: 'Expand',
  template_simplify: 'Simplify',
};

const translations: Record<Language, I18nStrings> = { zh, en };

let currentLanguage: Language = 'zh';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function detectLanguage(): Language {
  // Try to detect from Obsidian's locale
  const locale = window.localStorage.getItem('language') || navigator.language;
  return locale.startsWith('zh') ? 'zh' : 'en';
}

export function t(key: keyof I18nStrings): string {
  return translations[currentLanguage][key] || translations['en'][key] || key;
}

export function initI18n(): void {
  setLanguage(detectLanguage());
}
