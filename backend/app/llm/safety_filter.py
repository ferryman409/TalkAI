import re

DEFAULT_BLOCKED_KEYWORDS = [
    "色情", "暴力", "杀人", "自杀", "毒品", "赌博",
    "porn", "kill yourself", "suicide", "terroris",
]

DEFLECTION_TEMPLATES = [
    "（微微蹙眉，转移了话题）我们聊点别的吧。",
    "（轻轻摇头）这个话题我不太想继续呢……说点开心的事？",
    "（眨了眨眼，假装没听清）嗯？你刚才说什么来着？",
]


def check_pre_request(content: str, taboo_topics: list[str]) -> str | None:
    """Returns deflection message if content violates safety rules, None if safe."""
    blocked = set(DEFAULT_BLOCKED_KEYWORDS)
    for topic in taboo_topics:
        blocked.add(topic.lower())

    lower = content.lower()
    for keyword in blocked:
        if keyword.lower() in lower:
            return DEFLECTION_TEMPLATES[hash(keyword) % len(DEFLECTION_TEMPLATES)]
    return None


def check_post_response(content: str) -> bool:
    """Returns True if the response passes safety check."""
    for keyword in DEFAULT_BLOCKED_KEYWORDS:
        if keyword.lower() in content.lower():
            return False
    return True
