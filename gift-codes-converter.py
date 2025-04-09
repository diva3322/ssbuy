
import pandas as pd
import json
import time

# 載入 Excel
df = pd.read_excel("giftcodes.xlsx")

start = time.time()
result = {}

for _, row in df.iterrows():
    game_name = str(row["遊戲名稱"]).strip()
    if not game_name or game_name == "nan":
        continue

    banner = f"giftcodesbanner/{game_name}-banner.jpg"
    description = str(row["介紹"]).strip() if pd.notna(row["介紹"]) else ""

    howto = [
        str(row[col]).strip()
        for col in df.columns if col.startswith("兌換方式") and pd.notna(row[col])
    ]

    codes = []
    for i in range(1, 7):
        code_key = f"禮包碼{i}"
        reward_key = f"內容物{i}"
        if pd.notna(row.get(code_key)) and pd.notna(row.get(reward_key)):
            codes.append({
                "code": str(row[code_key]).strip(),
                "reward": str(row[reward_key]).strip()
            })

    result[game_name] = {
        "banner": banner,
        "description": description,
        "howTo": howto,
        "codes": codes
    }

with open("gift-codes-data.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

elapsed = round(time.time() - start, 2)
print(f"所有遊戲更新完成 耗時 {elapsed} 秒")
