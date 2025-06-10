import pandas as pd
from sklearn.model_selection import LeaveOneOut
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# 讀取資料
df = pd.read_csv("features.csv")

feature_columns = [
    'buy_or_sell_num', 'reason_num', 'price', 'open', 'high', 'low', 'close',
    'volume', 'k', 'd', 'j', 'ma5', 'ma10', 'ma20', 'rsi'
]

X = df[feature_columns]
y = df['success']

loo = LeaveOneOut()
y_true = []
y_pred = []

for train_index, test_index in loo.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]

    # 訓練模型
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    y_true.append(y_test.values[0])
    y_pred.append(pred[0])

# 計算整體準確率
acc = accuracy_score(y_true, y_pred)
print(f"Leave-One-Out 準確率: {acc:.3f}")

# 印出特徵重要性（係數絕對值越大越重要）
feature_importance = pd.Series(abs(model.coef_[0]), index=feature_columns)
print("特徵重要性（絕對值排序）:")
print(feature_importance.sort_values(ascending=False))

# 加入預測結果與正確與否到原始資料
df['y_true'] = y_true
df['y_pred'] = y_pred
df['correct'] = df['y_true'] == df['y_pred']

# 印出每一筆預測結果
print(df[['y_true', 'y_pred', 'correct'] + feature_columns])