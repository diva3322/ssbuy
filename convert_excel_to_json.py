import pandas as pd
import json

# 讀取 Excel 檔案
file_path = "games.xlsx"  # 你的 Excel 檔案名稱
df = pd.read_excel(file_path)

# 初始化 JSON 結構
games_data = {}

# 遍歷每一列（每款遊戲）
for _, row in df.iterrows():
    game_name = row["遊戲名稱"]  # Excel 裡的遊戲名稱列

    # 建立遊戲資料結構
    game_info = {
        "logo": row["Logo"],
        "social": {
            "Facebook": row["Facebook"],
            "Instagram": row["Instagram"],
            "官方網站": row["官方網站"]
        },
        "products": []
    }

    # 遍歷商品欄位（最多 15 個）
    for i in range(1, 16):
        product_name_col = f"商品{i}名稱"
        product_price_col = f"商品{i}價格"

        # 確保商品名稱和價格存在才加入
        if pd.notna(row[product_name_col]) and pd.notna(row[product_price_col]):
            game_info["products"].append({
                "name": row[product_name_col],
                "price": row[product_price_col]
            })

    # 儲存該遊戲資訊到字典
    games_data[game_name] = game_info

# 轉換為 JSON 字串
json_output = json.dumps(games_data, ensure_ascii=False, indent=4)

# 儲存為 JSON 檔案
json_file_path = "games.json"
with open(json_file_path, "w", encoding="utf-8") as json_file:
    json_file.write(json_output)

print(f"轉換完成！JSON 檔案已儲存至 {json_file_path}")
