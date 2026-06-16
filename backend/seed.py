"""Seed the database with preset characters."""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import init_db, async_session
from app.models import Character, User


DEFAULT_USER_ID = "default_user_001"


async def seed():
    await init_db()

    async with async_session() as db:
        # Ensure default user exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
        user = result.scalar_one_or_none()
        if not user:
            user = User(id=DEFAULT_USER_ID, username="default", display_name="默认用户")
            db.add(user)
            await db.commit()

        # Check if presets already exist
        result = await db.execute(
            select(Character).where(Character.is_preset == 1)
        )
        existing = result.scalars().all()
        if existing:
            print(f"Preset characters already exist ({len(existing)} found). Skipping seed.")
            return

        seed_dir = os.path.join(os.path.dirname(__file__), "seed_data")
        for filename in os.listdir(seed_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(seed_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)

                character = Character(
                    creator_id=DEFAULT_USER_ID,
                    name=data["name"],
                    age=data.get("age"),
                    gender=data.get("gender"),
                    personality_tags=json.dumps(data.get("personality_tags", []), ensure_ascii=False),
                    backstory=data.get("backstory", ""),
                    speaking_style=data.get("speaking_style", ""),
                    taboo_topics=json.dumps(data.get("taboo_topics", []), ensure_ascii=False),
                    knowledge_boundaries=data.get("knowledge_boundaries", ""),
                    is_public=1 if data.get("is_public") else 0,
                    is_preset=1 if data.get("is_preset") else 0,
                    avatar_url=data.get("avatar_url"),
                )
                db.add(character)
                print(f"Created preset character: {character.name}")

        await db.commit()
        print("Seed completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
