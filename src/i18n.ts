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
  removeCommand: string;
  commandGroup: string;
  newGroup: string;
  ungrouped: string;
  enterCommandId: string;
  commandNotFound: string;
  enterTooltip: string;
  enterIconName: string;
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
  removeCommand: '移除命令',
  commandGroup: '命令分组',
  newGroup: '新建分组',
  ungrouped: '未分组',
  enterCommandId: '输入命令 ID (例如: editor:toggle-bold):',
  commandNotFound: '未找到命令',
  enterTooltip: '输入提示文本:',
  enterIconName: '输入图标名称 (lucide):',
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
};

const en: I18nStrings = {
  // Plugin
  pluginName: 'SmartPick',
  pluginDescription: 'Smart text selection toolbar with custom commands and AI features',
  
  // Settings
  settingsTitle: 'SmartPick Settings',
  generalSettings: 'General Settings',
  language: 'Language',
  languageDesc: 'Plugin interface language (requires restart)',
  auto: 'Auto',
  zh: 'Chinese',
  en: 'English',
  toolbarSettings: 'Toolbar Settings',
  aiSettings: 'AI Settings',
  promptTemplates: 'Prompt Templates',
  
  // Toolbar Settings
  toolbarDelay: 'Toolbar Delay',
  toolbarDelayDesc: 'Delay before toolbar appears after selection (ms)',
  toolbarVerticalOffset: 'Toolbar Vertical Offset',
  toolbarVerticalOffsetDesc: 'Vertical distance from text (pixels)',
  toolbarHorizontalOffset: 'Toolbar Horizontal Offset',
  toolbarHorizontalOffsetDesc: 'Horizontal shift (pixels)',
  addCommand: 'Add Command',
  addAICommand: 'Add AI Command',
  removeCommand: 'Remove Command',
  commandGroup: 'Command Group',
  newGroup: 'New Group',
  ungrouped: 'Ungrouped',
  enterCommandId: 'Enter command ID (e.g., editor:toggle-bold):',
  commandNotFound: 'Command not found',
  enterTooltip: 'Enter tooltip:',
  enterIconName: 'Enter icon name (lucide):',
  selectTemplateId: 'Select template ID:',
  templateNotFound: 'Template not found',
  enterGroupName: 'Enter group name:',
  selectCommand: 'Select Command',
  selectIcon: 'Select Icon',
  searchCommands: 'Search commands...',
  searchIcons: 'Search icons...',
  defaultIcon: 'Default Icon',
  
  // AI Settings
  apiProvider: 'API Provider',
  apiProviderDesc: 'Select the AI provider you want to use',
  apiUrl: 'API URL',
  apiUrlDesc: 'Base URL for the API',
  apiKey: 'API Key',
  apiKeyDesc: 'Secret API Key (stored securely)',
  fetchModels: 'Fetch Models',
  fetchModelsDesc: 'Retrieve available models from the provider',
  fetchingModels: 'Fetching models...',
  selectModel: 'Select Model',
  selectModelDesc: 'Select the default model for AI tasks',
  temperature: 'Temperature',
  temperatureDesc: 'Creativity level (0.0 - 1.0)',
  maxTokens: 'Max Tokens',
  maxTokensDesc: 'Maximum length of response',
  testConnection: 'Test Connection',
  connectionSuccess: 'Connection successful',
  connectionFailed: 'Connection failed',
  
  // Prompt Templates
  templateName: 'Template Name',
  templatePrompt: 'Prompt Content',
  templateCategory: 'Category',
  addNewTemplate: 'Add New Template',
  addTemplate: 'Add Template',
  editTemplate: 'Edit Template',
  deleteTemplate: 'Delete Template',
  defaultTemplates: 'Default Templates',
  customTemplates: 'Custom Templates',
  cantEditBuiltin: 'Built-in templates cannot be modified directly (implementation pending copy feature)',
  
  // Toolbar
  toolbarTooltip: 'Smart Toolbar',
  
  // Preview Modal
  previewTitle: 'AI Response Preview',
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
