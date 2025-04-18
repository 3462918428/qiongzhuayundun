import torch
import torchvision
from torchvision import transforms, datasets
import torch.nn as nn
import torch.optim as optim
import json
from torch.cuda.amp import autocast, GradScaler  # 导入混合精度训练所需模块

# 检查CUDA并定义设备
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
print(f"当前设备: {device}")

# 1. 数据预处理 - 增强版
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),  # 随机裁剪
    transforms.RandomHorizontalFlip(),  # 随机水平翻转
    transforms.RandomRotation(15),  # 随机旋转
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),  # 颜色抖动
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# 验证集使用标准预处理
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# 2. 加载数据
train_data = datasets.ImageFolder("dog_data/train", transform=train_transform)

# 保存标签到JSON文件
with open("class_labels.json", "w", encoding="utf-8") as f:
    json.dump(train_data.classes, f, ensure_ascii=False)

train_loader = torch.utils.data.DataLoader(train_data, batch_size=32, shuffle=True)

# 3. 创建模型（使用ConvNeXt Tiny预训练模型）
model = torchvision.models.convnext_tiny(weights='DEFAULT')

# 冻结所有层
for param in model.parameters():
    param.requires_grad = False

# 修改最后一层 - ConvNeXt的分类器结构与ResNet不同
num_classes = len(train_data.classes)
model.classifier[2] = nn.Linear(768, num_classes)  # ConvNeXt Tiny的特征维度是768

# 将模型移动到设备上
model = model.to(device)
print(f"模型在设备上: {next(model.parameters()).is_cuda}")

# 4. 训练设置
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier[2].parameters(), lr=0.001)

# 创建梯度缩放器用于混合精度训练
scaler = GradScaler()

# 5. 训练（使用混合精度训练）
images_fed = 0  # 初始化计数器
num_epochs = 1  # 设定训练的epoch数量
for epoch in range(num_epochs):
    model.train()  # 设置模型为训练模式
    running_loss = 0.0
    correct_predictions = 0
    total_predictions = 0

    # 遍历训练数据
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)  # 将数据移动到设备上
        
        # 清零梯度
        optimizer.zero_grad()
        
        # 使用混合精度训练
        with autocast():
            # 前向传播
            outputs = model(images)
            loss = criterion(outputs, labels)
        
        # 反向传播和优化（使用梯度缩放器）
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        
        # 计算损失
        running_loss += loss.item() * images.size(0)
        
        # 计算准确率
        with torch.no_grad():
            _, preds = torch.max(outputs, 1)
            correct_predictions += torch.sum(preds == labels.data).item()
            total_predictions += labels.size(0)
        
        images_fed += images.size(0)  # 累加当前batch的图片数量
        
        # 每10个批次打印一次进度
        if (images_fed // images.size(0)) % 10 == 0:
            print(f"Batch进度: {images_fed} 张图片已处理")

    # 计算该epoch的平均损失和准确率
    epoch_loss = running_loss / len(train_loader.dataset)
    epoch_acc = correct_predictions / total_predictions

    print(f"Epoch {epoch + 1} 完成！当前已投喂图片总数：{images_fed}")
    print(f"Epoch {epoch + 1} 的平均损失: {epoch_loss:.4f}, 准确率: {epoch_acc:.4f}")

# 保存模型
torch.save(model.state_dict(), "model/newdog_model.pth")
print("模型已保存！")
