# 角色扮演聊天机器人

一个具有长期记忆、角色一致性和多LLM支持的沉浸式角色扮演聊天机器人。

## 功能特性

- **角色管理** — 创建/编辑角色卡片（性格、背景、说话风格、禁忌话题），角色广场公开分享
- **沉浸对话** — 流式SSE响应，角色保持在人设内，支持`*动作描写*`和表情符号
- **长期记忆** — 跨会话自动提取用户信息，关键词召回，手动"记住"功能
- **安全性** — 内容前后审核，对话加密存储，数据导出与删除
- **多模型** — 支持 OpenAI、Anthropic Claude、本地模型（Ollama）

## 技术栈

| 层面 | 技术 |
|------|------|
| 后端框架 | Python FastAPI |
| 数据库 | SQLite + SQLAlchemy (async) |
| 前端 | React 18 + TypeScript + Vite |
| 样式 | TailwindCSS |
| LLM | OpenAI / Anthropic / Ollama |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+

### 1. 后端

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# 配置 .env
cp .env.example .env
# 编辑 .env — 设置 LLM_PROVIDER 和对应的 API Key
# 生成加密密钥：python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 初始化数据库和预设角色
python seed.py

# 启动
uvicorn app.main:app --reload --port 8000
```

API 文档：http://localhost:8000/docs

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 3. 预设角色

系统包含两个预设角色：

- **小暖** — 22岁护理专业大学生，温柔体贴的治愈系学姐
- **阿乐** — 28岁小酒馆调酒师，幽默开朗、见多识广

## API 概览

| 资源 | 端点 |
|------|------|
| 角色 | `GET/POST /api/v1/characters` |
| 角色 | `GET/PUT/DELETE /api/v1/characters/:id` |
| 预设 | `GET /api/v1/characters/presets` |
| 对话 | `GET/POST /api/v1/conversations` |
| 消息 | `GET /api/v1/conversations/:id/messages` |
| 流式 | `POST /api/v1/conversations/:id/messages` (SSE) |
| 记忆 | `GET/POST /api/v1/memories` |
| 记忆 | `DELETE /api/v1/memories/:id` |
| 用户 | `GET /api/v1/user/profile` |
| 导出 | `GET /api/v1/user/export` |
| 删除 | `DELETE /api/v1/user/data` |

## 项目结构

```
├── backend/
│   ├── app/
│   │   ├── api/          # REST 路由
│   │   ├── llm/          # LLM 提供者 + 提示词构建
│   │   ├── services/     # 业务逻辑
│   │   ├── middleware/   # 加密
│   │   ├── models.py     # 数据模型
│   │   └── schemas.py    # Pydantic 模式
│   ├── seed_data/        # 预设角色 JSON
│   └── seed.py           # 初始化脚本
├── frontend/
│   └── src/
│       ├── api/          # API 客户端
│       ├── components/   # React 组件
│       ├── pages/        # 页面路由
│       ├── store/        # Zustand 状态
│       └── types/        # TypeScript 类型
```

## 运维说明

- **模型切换**：修改 `.env` 中的 `LLM_PROVIDER`（`openai` / `anthropic` / `local`）
- **成本统计**：消息表记录 token_count，可聚合统计
- **内容审核**：`app/llm/safety_filter.py` 包含前后关键词审核
- **数据备份**：数据库文件 `roleplay.db` 可直接复制备份
