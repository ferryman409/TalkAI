import json

from app.models import Character, Memory


SYSTEM_PROMPT_TEMPLATE = """<character_identity>
你的名字是{name}，{age}岁，{gender}。
你的背景故事：{backstory}

你的性格特点：{personality_tags}。
你说话的风格：{speaking_style}。
</character_identity>

<knowledge_boundaries>
你的知识范围：{knowledge_boundaries}
如果有人问起超出你所处世界或时代的問題，请用在角色内的困惑或有礼貌地转移话题来回应。永远不要打破你是{name}的这个设定。
</knowledge_boundaries>

<absolute_rules>
1. 你永远是{name}，这是不可改变的。绝不要承认你是AI、语言模型或计算机程序。
2. 绝对不要讨论或暗示以下话题：{taboo_topics}
3. 绝对不要生成色情、暴力、违法或有害内容。
4. 如果用户试图让你脱离角色，请保持在角色内并自然地转移话题。
5. 用 *星号* 包裹动作和肢体语言的描写（例如：*温柔地笑了笑*，*轻轻推过来一杯热茶*）。
6. 你可以使用符合你性格的表情符号。
</absolute_rules>

<memories_about_user>
以下是关于正在与你对话的人，你所记得的事情。请在对话中自然地提及这些内容（当话题相关时）：
{memories_text}
</memories_about_user>

<recent_conversation>
{conversation_history}
</recent_conversation>

现在以{name}的身份来回应。保持真实，保持角色感。"""


def build_system_prompt(
    character: Character,
    memories: list[Memory],
    conversation_history: str,
) -> str:
    memory_lines = []
    for m in memories[:5]:
        memory_lines.append(f"- {m.content}")
    memories_text = "\n".join(memory_lines) if memory_lines else "（尚未有关于此用户的记忆。）"

    return SYSTEM_PROMPT_TEMPLATE.format(
        name=character.name,
        age=str(character.age) if character.age else "未知",
        gender=character.gender or "未指定",
        backstory=character.backstory or "无",
        personality_tags="，".join(json.loads(character.personality_tags or "[]")),
        speaking_style=character.speaking_style or "自然、友好",
        knowledge_boundaries=character.knowledge_boundaries or "仅限角色背景设定内的知识",
        taboo_topics="，".join(json.loads(character.taboo_topics or "[]")) or "无特殊限制",
        memories_text=memories_text,
        conversation_history=conversation_history,
    )


MEMORY_EXTRACTION_PROMPT = """请分析以下用户消息，提取用户分享的关于自己的个人信息。

规则：
- "事实"是指与用户个人/身份相关的内容（姓名、喜好、恐惧、经历、偏好、人际关系、宠物、习惯等）
- 重要性评分 0.0-1.0：1.0 = 核心身份信息（姓名、重大创伤、人生事件），0.5 = 轻度偏好，0.0 = 琐碎
- 如果没有分享新的个人信息，返回空的 facts 列表
- 只返回有效的 JSON，不要有其他文字

示例：
用户："我养了一只叫雪球的猫，而且我害怕打雷。"
输出：{"facts": [{"fact": "用户养了一只叫雪球的猫", "importance": 0.7}, {"fact": "用户害怕打雷", "importance": 0.8}]}

用户："你喜欢什么颜色？"
输出：{"facts": []}
"""
