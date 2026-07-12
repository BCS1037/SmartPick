// SmartPick i18n - Internationalization support
// Follows Obsidian language settings for Chinese and English

import { getLanguage as getObsidianLanguage, Platform } from 'obsidian';

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
  toolbarVerticalOffset: string;
  toolbarVerticalOffsetDesc: string;
  toolbarHorizontalOffset: string;
  toolbarHorizontalOffsetDesc: string;
  addCommand: string;
  add: string;
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
  enableCommand: string;
  disableCommand: string;
  modal_chooseCommandType: string;
  choice_builtinCommand: string;
  choice_builtinCommandDesc: string;
  choice_aiCommand: string;
  choice_aiCommandDesc: string;
  choice_urlCommand: string;
  choice_urlCommandDesc: string;
  choice_shortcutCommand: string;
  choice_shortcutCommandDesc: string;
  commandName: string;
  commandNameDesc: string;
  prompt: string;
  promptDesc: string;
  promptTranslatePlaceholder: string;
  outputAction: string;
  outputActionDesc: string;
  outputReplaceSelection: string;
  outputInsertBelowSelection: string;
  outputCopyToClipboard: string;
  commandIcon: string;
  commandIconDesc: string;
  deleteAICommand: string;
  deleteAICommandDesc: string;
  notice_aiCommandRequired: string;
  notice_builtinCommandReadonly: string;
  
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
  connecting: string;
  
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
  command_ai_improve_writing: string;
  command_ai_fix_grammar: string;
  command_ai_expand: string;
  command_ai_simplify: string;
  
  group_format: string;
  group_ai: string;
  group_link: string;
  group_shortcut: string;
  group_ungrouped_name: string;
  
  // Double-click trigger
  enableDoubleClickTrigger: string;
  enableDoubleClickTriggerDesc: string;

  // Modifier key trigger
  enableModifierKeyTrigger: string;
  enableModifierKeyTriggerDesc: string;
  modifierKeySetting: string;
  modifierKeySettingDesc: string;
  
  // Built-in Templates
  template_translate: string;
  template_summarize: string;
  template_explain: string;
  template_improve_writing: string;
  template_fix_grammar: string;
  template_expand: string;
  template_simplify: string;

  // New Built-in Tools
  group_builtin: string;
  command_superscript: string;
  command_subscript: string;
  command_table: string;
  command_callout: string;
  command_clear_formatting: string;
  command_copy: string;
  command_cut: string;
  command_paste: string;
  command_inline_code: string;
  command_code_block: string;
  command_paste_url_into_selection: string;
  command_copy_note: string;
  command_copy_note_file: string;
  command_quote: string;
  command_footnote: string;
  command_toggle_todo: string;
  openSmartPickSettings: string;
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
  toolbarVerticalOffset: '工具栏垂直偏移',
  toolbarVerticalOffsetDesc: '桌面端工具栏与选区顶部锚点之间的垂直距离（像素）',
  toolbarHorizontalOffset: '工具栏水平偏移',
  toolbarHorizontalOffsetDesc: '水平偏移距离（像素）',
  addCommand: '添加命令',
  add: '添加',
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
  enableCommand: '启用',
  disableCommand: '禁用',
  modal_chooseCommandType: '选择命令类型',
  choice_builtinCommand: 'Obsidian 命令',
  choice_builtinCommandDesc: '调用 Obsidian 或插件已注册命令',
  choice_aiCommand: 'AI 命令',
  choice_aiCommandDesc: '用自定义提示词处理选中文本',
  choice_urlCommand: '网页链接',
  choice_urlCommandDesc: '把选中文本填入搜索或网页 URL',
  choice_shortcutCommand: '键盘快捷键',
  choice_shortcutCommandDesc: '触发 macOS 系统级快捷键',
  commandName: '命令名称',
  commandNameDesc: '显示在工具栏 tooltip 和设置中的名称',
  prompt: '提示词',
  promptDesc: '执行 AI 请求的 Prompt 内容，使用 {{selection}} 作为选中文本占位符',
  promptTranslatePlaceholder: '请将以下内容翻译成中文：\n\n{{selection}}',
  outputAction: '输出处理',
  outputActionDesc: 'AI 返回结果的处理方式',
  outputReplaceSelection: '替换选中文本',
  outputInsertBelowSelection: '插入到选区后',
  outputCopyToClipboard: '复制到剪贴板',
  commandIcon: '命令图标',
  commandIconDesc: 'Lucide 图标名称',
  deleteAICommand: '删除 AI 命令',
  deleteAICommandDesc: '确认要删除这个自定义 AI 命令吗？此操作无法撤销。',
  notice_aiCommandRequired: '命令名称和提示词不能为空',
  notice_builtinCommandReadonly: '内置普通命令只能启用、禁用或排序',
  
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
  connecting: '正在连接服务...',
  
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
  command_ai_improve_writing: '改进写作',
  command_ai_fix_grammar: '修正语法',
  command_ai_expand: '扩展内容',
  command_ai_simplify: '简化',
  
  group_format: '格式',
  group_ai: 'AI',
  group_link: '链接',
  group_shortcut: '快捷键',
  group_ungrouped_name: '未分组',
  
  // Double-click trigger
  enableDoubleClickTrigger: '双击显示工具栏',
  enableDoubleClickTriggerDesc: '在编辑区域双击鼠标时显示工具栏（无需选中文本）',

  // Modifier key trigger
  enableModifierKeyTrigger: '按修饰键弹出',
  enableModifierKeyTriggerDesc: '选中文本后不立即弹出工具栏，而是按一下指定的修饰键再弹出（免打扰模式）',
  modifierKeySetting: '自定义修饰键',
  modifierKeySettingDesc: '选择触发弹出工具栏的修饰键',
  
  // Built-in Templates
  template_translate: '翻译',
  template_summarize: '总结',
  template_explain: '解释',
  template_improve_writing: '改进写作',
  template_fix_grammar: '修正语法',
  template_expand: '扩展内容',
  template_simplify: '简化',

  // New Built-in Tools
  group_builtin: '内置工具集',
  command_superscript: '上标',
  command_subscript: '下标',
  command_table: '插入表格',
  command_callout: '插入 Callout',
  command_clear_formatting: '清除格式',
  command_copy: '复制',
  command_cut: '剪切',
  command_paste: '粘贴',
  command_inline_code: '行内代码',
  command_code_block: '代码块',
  command_paste_url_into_selection: '粘贴链接到选区',
  command_copy_note: '拷贝当前笔记内容',
  command_copy_note_file: '拷贝当前笔记文件 (作为附件)',
  command_quote: '引用',
  command_footnote: '脚注',
  command_toggle_todo: '切换待办',
  openSmartPickSettings: '打开 SmartPick 设置',
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
  toolbarVerticalOffset: 'Toolbar vertical offset',
  toolbarVerticalOffsetDesc: 'Desktop vertical distance from the selection-top anchor (pixels)',
  toolbarHorizontalOffset: 'Toolbar horizontal offset',
  toolbarHorizontalOffsetDesc: 'Horizontal shift (pixels)',
  addCommand: 'Add command',
  add: 'Add',
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
  enableCommand: 'Enable',
  disableCommand: 'Disable',
  modal_chooseCommandType: 'Choose command type',
  choice_builtinCommand: 'Obsidian command',
  choice_builtinCommandDesc: 'Run a command registered by Obsidian or a plugin',
  choice_aiCommand: 'AI command',
  choice_aiCommandDesc: 'Process selected text with a custom AI prompt',
  choice_urlCommand: 'Web link',
  choice_urlCommandDesc: 'Insert selected text into a search or web URL',
  choice_shortcutCommand: 'Keyboard shortcut',
  choice_shortcutCommandDesc: 'Trigger a macOS system shortcut',
  commandName: 'Command name',
  commandNameDesc: 'Name shown in toolbar tooltip and settings',
  prompt: 'Prompt',
  promptDesc: 'AI prompt content. Use {{selection}} as the selected text placeholder.',
  promptTranslatePlaceholder: 'Please translate the following text into Chinese:\n\n{{selection}}',
  outputAction: 'Output action',
  outputActionDesc: 'How to handle AI output',
  outputReplaceSelection: 'Replace selection',
  outputInsertBelowSelection: 'Insert after selection',
  outputCopyToClipboard: 'Copy to clipboard',
  commandIcon: 'Command icon',
  commandIconDesc: 'Lucide icon name',
  deleteAICommand: 'Delete AI command',
  deleteAICommandDesc: 'Are you sure you want to delete this custom AI command? This action cannot be undone.',
  notice_aiCommandRequired: 'Command name and prompt are required',
  notice_builtinCommandReadonly: 'Built-in non-AI commands can only be enabled, disabled, or reordered',
  
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
  connecting: 'Connecting to service...',
  
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
  command_ai_improve_writing: 'Improve writing',
  command_ai_fix_grammar: 'Fix grammar',
  command_ai_expand: 'Expand',
  command_ai_simplify: 'Simplify',
  
  group_format: 'Format',
  group_ai: 'AI',
  group_link: 'Links',
  group_shortcut: 'Shortcuts',
  group_ungrouped_name: 'Ungrouped',
  
  // Double-click trigger
  enableDoubleClickTrigger: 'Double-click to show toolbar',
  enableDoubleClickTriggerDesc: 'Show toolbar when double-clicking in editor area (no text selection required)',

  // Modifier key trigger
  enableModifierKeyTrigger: 'Trigger with modifier key',
  enableModifierKeyTriggerDesc: 'Do not show the toolbar immediately after text selection, but only after pressing the specified modifier key (quiet mode)',
  modifierKeySetting: 'Modifier key',
  modifierKeySettingDesc: 'Choose the modifier key to trigger the toolbar',
  
  // Built-in Templates
  template_translate: 'Translate',
  template_summarize: 'Summarize',
  template_explain: 'Explain',
  template_improve_writing: 'Improve writing',
  template_fix_grammar: 'Fix grammar',
  template_expand: 'Expand',
  template_simplify: 'Simplify',

  // New Built-in Tools
  group_builtin: 'Built-in Tools',
  command_superscript: 'Superscript',
  command_subscript: 'Subscript',
  command_table: 'Insert Table',
  command_callout: 'Insert Callout',
  command_clear_formatting: 'Clear Formatting',
  command_copy: 'Copy',
  command_cut: 'Cut',
  command_paste: 'Paste',
  command_inline_code: 'Inline Code',
  command_code_block: 'Code Block',
  command_paste_url_into_selection: 'Paste URL into Selection',
  command_copy_note: 'Copy Current Note Content',
  command_copy_note_file: 'Copy Current Note File (as Attachment)',
  command_quote: 'Quote',
  command_footnote: 'Footnote',
  command_toggle_todo: 'Toggle todo',
  openSmartPickSettings: 'Open SmartPick settings',
};

const translations: Record<Language, I18nStrings> = { zh, en };

export function getLanguage(): Language {
  return detectLanguage();
}

export function detectLanguage(): Language {
  // Try to detect from Obsidian's locale
  const locale = getObsidianLanguage() || navigator.language;
  return locale.startsWith('zh') ? 'zh' : 'en';
}

export function t(key: keyof I18nStrings): string {
  const language = getLanguage();
  return translations[language][key] || translations['en'][key] || key;
}

export function localize(zhText: string, enText: string): string {
  return getLanguage() === 'zh' ? zhText : enText;
}

const builtinToolbarItemKeys: Record<string, keyof I18nStrings> = {
  highlight: 'command_highlight',
  superscript: 'command_superscript',
  subscript: 'command_subscript',
  quote: 'command_quote',
  footnote: 'command_footnote',
  callout: 'command_callout',
  copy: 'command_copy',
  paste: 'command_paste',
  cut: 'command_cut',
  'inline-code': 'command_inline_code',
  'code-block': 'command_code_block',
  table: 'command_table',
  'clear-formatting': 'command_clear_formatting',
  'paste-url-into-selection': 'command_paste_url_into_selection',
  'copy-note': 'command_copy_note',
  'copy-note-file': 'command_copy_note_file',
  'ai-translate': 'command_ai_translate',
  'ai-summarize': 'command_ai_summarize',
  'ai-explain': 'command_ai_explain',
  'ai-improve-writing': 'command_ai_improve_writing',
  'ai-fix-grammar': 'command_ai_fix_grammar',
  'ai-expand': 'command_ai_expand',
  'ai-simplify': 'command_ai_simplify',
  'shortcut-todo': 'command_toggle_todo',
};

export function getBuiltinToolbarItemLabel(id: string, fallback: string): string {
  if (id === 'copy-note-file' && Platform.isMobile) {
    return localize('分享当前笔记文件', 'Share Current Note File');
  }

  const key = builtinToolbarItemKeys[id];
  return key ? t(key) : fallback;
}
