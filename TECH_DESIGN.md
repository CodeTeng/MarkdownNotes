# Markdown 笔记应用 技术设计文档
## 1. 文档概述
### 1.1 设计目的
基于已确认的 PRD 需求，明确 Markdown 笔记应用的技术实现方案，包括技术栈选型、项目结构设计、核心功能实现逻辑、数据流转等，为开发落地提供标准化指导。
### 1.2 核心设计原则
- **轻量化**：基于浏览器本地存储，无后端依赖，聚焦前端核心体验；
- **高性能**：保证实时预览低延迟、导出功能高效；
- **可维护**：基于 Vue3 + TypeScript 实现类型安全，代码结构清晰；
- **兼容性**：适配主流 PC 端浏览器，满足 PRD 中兼容性要求。

## 2. 技术栈选型
| 技术分类 | 选型 | 选型说明 |
|----------|------|----------|
| 核心框架 | Vue3 + TypeScript | 提供组件化开发能力，TypeScript 保障类型安全，符合现代前端开发规范 |
| 构建工具 | Vite | 极速的热更新和构建速度，适配 Vue3 生态，提升开发效率 |
| 样式方案 | Tailwind CSS | 原子化 CSS 框架，快速实现响应式布局，适配三栏布局及交互样式 |
| Markdown 解析 | marked | 轻量、高性能的 Markdown 解析库，支持自定义渲染规则 |
| 语法高亮 | highlight.js | 支持多语言代码块高亮，适配 Markdown 编辑器/预览区需求 |
| PDF 导出 | jsPDF + html2canvas | 将预览区 DOM 转为 Canvas 后导出 PDF，保证格式还原度 |
| 文件导出 | file-saver | 处理 Markdown 文件导出的 Blob 流，兼容主流浏览器 |
| 本地存储 | localStorage | 原生 API，满足 PRD 中本地化存储需求，配合 TypeScript 封装类型 |
| 工具库 | lodash-es | 提供防抖、深拷贝等工具函数，优化搜索、保存等交互性能 |
| 类型定义 | @types/* | 补充第三方库的 TypeScript 类型声明，保证类型完整性 |

## 3. 项目结构设计
遵循 Vue3 + Vite 最佳实践，采用**功能模块化** + **组件化** 拆分，结构如下：
```
markdown-note/
├── public/                  # 静态资源（无编译处理）
│   └── favicon.ico          # 应用图标
├── src/
│   ├── assets/              # 静态资源（需编译）
│   │   ├── styles/          # 全局样式
│   │   │   └── global.css   # Tailwind 全局配置、自定义样式
│   │   └── icons/           # 图标资源（如删除、导出按钮图标）
│   ├── components/          # 通用/业务组件
│   │   ├── common/          # 通用组件
│   │   │   ├── ConfirmModal.vue  # 删除确认弹窗
│   │   │   ├── Toast.vue         # 操作提示组件
│   │   │   └── SearchInput.vue   # 搜索框组件
│   │   └── business/        # 业务组件
│   │       ├── NoteList.vue     # 左侧笔记列表组件
│   │       ├── MdEditor.vue     # 中间 Markdown 编辑器组件
│   │       ├── MdPreview.vue    # 右侧预览组件
│   │       ├── ExportButton.vue # 导出功能按钮组件
│   │       └── NoteItem.vue     # 笔记列表项组件
│   ├── composables/         # 组合式函数（复用逻辑）
│   │   ├── useNoteStore.ts  # 笔记数据管理（localStorage 操作）
│   │   ├── useMdParser.ts   # Markdown 解析/高亮逻辑
│   │   ├── useExport.ts     # PDF/Markdown 导出逻辑
│   │   └── useSearch.ts     # 笔记搜索逻辑
│   ├── types/               # 类型定义
│   │   └── index.ts         # 笔记类型、组件 Props 等类型声明
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # localStorage 封装（增删改查）
│   │   ├── format.ts        # 时间格式化、文件名处理等
│   │   └── constant.ts      # 常量定义（如默认分栏比例、存储 KEY 等）
│   ├── App.vue              # 根组件（三栏布局容器）
│   ├── main.ts              # 应用入口（创建 Vue 实例、引入全局样式）
│   └── vite-env.d.ts        # Vite 类型声明
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── package.json             # 依赖及脚本配置
```

## 4. 关键技术细节
### 4.1 实时预览性能优化
- 编辑器输入采用**防抖处理**（debounce），避免高频触发解析，防抖延迟设为 100ms，符合 PRD 中预览延迟要求；
- Markdown 解析结果缓存，仅当内容变化时重新解析，减少重复计算。

### 4.2 本地存储容错处理
- 封装 localStorage 操作时，增加 try/catch 捕获存储异常（如容量不足）；
- 笔记 ID 生成采用「时间戳 + 随机数」，避免重复；
- 加载笔记时校验数据格式，若格式异常则过滤，保证应用稳定性。

### 4.3 导出功能兼容性
- PDF 导出时，处理不同浏览器的 Canvas 渲染差异，提升分辨率（scale: 2）；
- Markdown 导出时，处理中文文件名编码问题，保证文件名正常显示。