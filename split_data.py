import splitfolders

# 自动划分训练集和验证集
splitfolders.ratio(
    input="Images",    # 原始数据路径
    output="dog_data",     # 输出路径
    seed=42,               # 随机种子
    ratio=(0.8, 0.2),      # 训练集:验证集 = 8:2
    group_prefix=None      # 不按前缀分组
)