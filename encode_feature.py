import pandas as pd
import json

# 讀入你的 JSON 資料
with open('features.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# 買賣轉為數值
df['buy_or_sell'] = df['buy_or_sell'].map({'買': 1, '賣': 0})

# 原始 reason one-hot encode
df = pd.get_dummies(df, columns=['reason'])

# 保留需要的欄位
features = [
    'buy_or_sell', 'price', 'open', 'high', 'low', 'close',
    'volume', 'k', 'd', 'j', 'ma5', 'ma10', 'ma20', 'rsi'
] + [col for col in df.columns if col.startswith('reason_')]

X = df[features]
y = df['success']  # 若有需要

# 輸出為 CSV 特徵檔
X.to_csv('features.csv', index=False)
y.to_csv('labels.csv', index=False)