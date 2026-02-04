# SmartPick 开发任务清单

## 已完成功能

- [x] **基础框架搭建**
  - [x] 插件骨架代码
  - [x] 设置界面基础结构
  - [x] 国际化 (i18n) 支持框架

- [x] **核心功能: 工具栏**
  - [x] 文本选中检测与工具栏定位
  - [x] 工具栏 UI 样式
  - [x] 点击执行命令逻辑

- [x] **核心功能: AI 支持**
  - [x] AI Provider 架构 (OpenAI, Anthropic, Ollama)
  - [x] Prompt 模板管理
  - [x] AI 响应预览与处理 (替换/插入/复制)

- [x] **自定义命令**
  - [x] 支持添加 Obsidian 内部命令
  - [x] 支持添加 URL/URI Scheme 命令
  - [x] Add new groups 'link' and 'shortcut' to defaults <!-- id: 10 -->
- [x] Add built-in URL commands (Google, Baidu, ChatGPT, etc.) <!-- id: 11 -->
- [x] Add built-in Shortcut commands (Toggle Todo, Find) <!-- id: 12 -->
- [x] Update i18n strings for new built-ins <!-- id: 13 -->
  - [x] **v0.2.0**: 支持添加键盘快捷键 (Shortcut)
    - [x] 数据模型更新
    - [x] 执行逻辑 (macOS osascript)
    - [x] 自动捕获键盘输入 (Auto-capture)

## Bug Fixes
- [x] Fix toolbar shortcut click event not firing (v0.2.1)

## 待办事项 (ToDo)

- [ ] **跨平台支持**
  - [ ] 快捷键功能支持 Windows (可能需要 native 模块或外部 helper)
  
- [ ] **UI 优化**
  - [ ] 更加现代化的图标选择器
  - [ ] 拖拽排序体验优化

- [ ] **AI 功能增强**
  - [ ] 支持更多模型参数微调
  - [ ] 流式输出 (Streaming) 优化

## 已知问题

- 快捷键功能目前仅限 macOS。
