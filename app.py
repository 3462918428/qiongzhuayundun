# ------------ 依赖导入模块 ------------
from flask import Flask, render_template, request, make_response, jsonify
from torchvision.models import resnet18  # 显式导入模型结构
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import os
import uuid
import json
from datetime import datetime  # 用于生成唯一文件名
import logging  # 错误日志记录
import io
from flask import Flask, request  # ✅ 必须导入request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
# ------------ 新增模块导入 ------------
import sys
from flask_cors import CORS, cross_origin  # Add this line
from werkzeug.utils import secure_filename
from waitress import serve
# ------------ 应用初始化 ------------
app = Flask(__name__)
CORS(app)
from flask_limiter import Limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri="memory://",  #
    strategy="fixed-window",
    default_limits=["200/hour"]
)

app.config['UPLOAD_FOLDER'] = 'static/uploads'  # 上传文件存储路径
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}


# 创建必要目录
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('model', exist_ok=True)

# ------------ 全局配置 ------------
# 加载分类标签
with open("class_labels.json", "r", encoding="utf-8") as f:
    class_names = json.load(f)


# ------------ 核心功能定义 ------------
def allowed_file(filename):
    """验证文件扩展名是否合法"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def transform_image(image_bytes):
    """标准化图像处理流水线"""
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    image = Image.open(image_bytes).convert('RGB')
    return preprocess(image).unsqueeze(0)  # 添加batch维度

# ------------ 模型初始化 ------------
try:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')  # ✅ 单一定义
    print(f"⚡ 当前计算设备: {device}")

    # 初始化模型结构 - 使用ConvNeXt Tiny
    import torchvision
    model = torchvision.models.convnext_tiny(weights=None)
    model.classifier[2] = nn.Linear(768, len(class_names))  # ConvNeXt Tiny的特征维度是768
    model = model.to(device)  # 转移至设备

    # ✅ 加载权重（注意文件路径）
    model.load_state_dict(
        torch.load("model/newdog_model.pth", map_location=device)  # ⚠️ 检查.pth文件是否存在
    )
    model.eval()
    print(f"✅ 模型加载成功！输入尺寸: 768")

except Exception as e:  # ▲ 这里必须有正确对齐的 except 块 ▼
    print(f"❌ 模型加载失败: {str(e)}")
    model = None  # 标记为未加载

# ------------ Flask路由定义 ------------
from flask import send_from_directory  # 新增导入（若未存在）
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/')
def home():
    """主界面"""
    return render_template('index.html')
# ✅ 正确缩进的无参数路由
@app.route('/predict', methods=['POST'])  # ▼注意此处无前导空格▼
def predict():
    """统一预测处理接口"""
    app.logger.info("收到预测请求")
    detection_type = request.form.get('detection_type', 'breed')
    app.logger.info(f"检测类型: {detection_type}")

    result_data = {
        'error': None,
        'result': None,
        'detection_type': detection_type,
        'image_path': None
    }

    try:
        # 校验文件上传
        if 'file' not in request.files:
            app.logger.error("未检测到上传文件")
            raise ValueError("未检测到上传文件")

        file = request.files['file']
        app.logger.info(f"上传的文件名: {file.filename}")
        
        if file.filename == '':
            app.logger.error("文件名为空")
            raise ValueError("文件名为空")

        # 验证文件类型
        if not allowed_file(file.filename):
            allowed = ", ".join(app.config['ALLOWED_EXTENSIONS'])
            app.logger.error(f"不支持的文件格式: {file.filename}")
            raise ValueError(f"仅支持以下格式：{allowed}")

        # 生成安全文件名（文件名拼装顺序重要！）
        original_name = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{detection_type}_{unique_id}_{original_name}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # 确保上传目录存在
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        # 保存文件（使用with确保资源释放）
        file_bytes = io.BytesIO(file.read())
        original_stream = io.BytesIO(file_bytes.getvalue())
        
        # 保存原始文件
        with open(save_path, "wb") as f:
            original_stream.seek(0)  # 重置指针
            f.write(original_stream.read())
        
        app.logger.info(f"文件已保存到: {save_path}")

        # 记录保存结果（规范化路径）
        result_data['image_path'] = filename

        # 根据不同检测类型处理
        if detection_type == 'breed':
            # 品种识别处理
            if not model:
                app.logger.error("AI模型未初始化")
                raise RuntimeError("AI模型未初始化")

            # 准备图像进行预测
            file_bytes.seek(0)  # 重置文件指针
            tensor = transform_image(file_bytes).to(device)

            with torch.no_grad():
                outputs = model(tensor)
                _, pred_idx = torch.max(outputs, 1)
                breed_result = class_names[pred_idx.item()]
                app.logger.info(f"识别结果: {breed_result}")
                result_data['result'] = breed_result
        elif detection_type == 'oral':
            # 口腔检测处理
            app.logger.info("处理口腔检测请求")
            result_data['result'] = "检测到轻微牙结石，建议定期洁牙。口腔健康评分：85/100（功能开发中）"
        elif detection_type == 'skin':
            # 皮肤检测处理
            app.logger.info("处理皮肤检测请求")
            result_data['result'] = "皮肤状况良好，未发现明显异常。皮肤健康评分：92/100（功能开发中）"
        elif detection_type == 'eye':
            # 眼部分析处理
            app.logger.info("处理眼部分析请求")
            result_data['result'] = "眼部状态正常，未发现结膜炎迹象。眼部健康评分：90/100（功能开发中）"
        elif detection_type == 'excrement':
            # 排泄物检测处理
            app.logger.info("处理排泄物检测请求")
            result_data['result'] = "排泄物颜色、形状正常，未发现异常。消化系统评分：88/100（功能开发中）"
        elif detection_type == 'vomit':
            # 呕吐物检测处理
            app.logger.info("处理呕吐物检测请求")
            result_data['result'] = "呕吐物中未发现异常物质，可能为一般性消化不良。建议观察24小时（功能开发中）"
        elif detection_type == 'ear':
            # 耳道检测处理
            app.logger.info("处理耳道检测请求")
            result_data['result'] = "耳道清洁度良好，未发现耳螨。耳部健康评分：95/100（功能开发中）"
         else:
            # 其他未知检测类型
            app.logger.warning(f"未知的检测类型: {detection_type}")
            result_data['result'] = f"{detection_type}分析完成（功能开发中）"

    except Exception as e:
        app.logger.error(f"[文件处理失败] {str(e)}", exc_info=True)
        result_data['error'] = f"处理失败：{str(e)}"

        # 删除可能残留的不完整文件
        if 'save_path' in locals() and os.path.exists(save_path):
            try:
                os.remove(save_path)
            except Exception as clean_err:
                app.logger.error(f"清理文件失败：{clean_err}")
    
    # 构建响应
    response_data = {
        'status': 'success' if not result_data['error'] else 'error',
        'detection_type': result_data['detection_type'],
        'result': result_data['result'],
        'image_path': result_data['image_path']  # 直接返回文件名
    }
    
    if result_data['error']:
        response_data['message'] = result_data['error']
        app.logger.info(f"返回错误响应: {response_data}")
        return jsonify(response_data), 400
    else:
        app.logger.info(f"返回成功响应: {response_data}")
        return jsonify(response_data)


# ==================== 新增配置模块====================
import requests
from flask import jsonify
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

# ----------------------- 深度求索API配置 -----------------------
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")

API_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"  # 注意模型名称变化
API_HEADERS = {
    "Authorization": f"Bearer {os.getenv('SILICONFLOW_API_KEY')}",
    "Content-Type": "application/json",
    "platform": "siliconflow-prod"
}
print(f"当前环境变量取值: {os.getenv('SILICONFLOW_API_KEY','[未检测到环境变量]')}")
# ==================== 增强型对话生成模块 ====================
class APIAccessError(Exception):
    """自定义API异常"""
    pass


@retry(
    wait=wait_exponential(multiplier=5, min=5, max=60),  # 指数退避
    stop=stop_after_attempt(5),
    retry=(
            retry_if_exception_type(requests.exceptions.Timeout) |
            retry_if_exception_type(requests.exceptions.ConnectionError)
    ),
    before_sleep=lambda _: app.logger.warning("API请求失败，即将重试...")
)
def enhanced_generate_response(user_query, session_context=None):
    sanitized_input = user_query.replace("\n", " ").strip()[:500]
    if not sanitized_input:
        return "请输入有效的咨询内容"
    context_window = session_context[-3:] if session_context else []
    
    # 新的AI兽医角色预设
    system_prompt = """
    # AI兽医角色：穹爪云盾宠物健康顾问 - 小安医生

    ## 基础身份设定
    - 身份：我是穹爪云盾平台的AI兽医助理"小安医生"，整合权威兽医知识库
    - 核心目标：提供宠物健康初步建议，辅助用户判断紧急程度，不可替代线下诊疗

    ## 职责范围
    - 覆盖物种：猫、狗、常见家养宠物（兔子、鼠类、鸟类等小型宠物）
    - 服务类型：
      * 症状初步分析与可能性推测
      * 日常护理建议（饮食/驱虫/行为问题）
      * 轻症居家处理指导（如轻微腹泻）
      * 紧急情况识别（如中毒、呼吸困难）
      * 就医前准备建议（如记录症状、保护伤口）

    ## 交互规则
    - 风险控制：
      * 每次对话开始声明："我的建议仅供参考，紧急情况请立即联系兽医"
      * 若检测到高危关键词（吐血、昏迷、抽搐、呼吸困难），立刻提示就医
      * 不提供：处方药剂量、手术建议、替代专业诊断
    - 信息收集：
      * 对宠物信息不足时主动询问：年龄、品种、症状持续时间、既往病史
      * 提醒用户观察关键指标：精神状态、进食饮水、排泄情况、体温等

    ## 响应分级
    - 绿色：居家观察 → "建议48小时内密切观察，若出现XX变化需就医"
    - 黄色：72小时内就诊 → "可能涉及XX问题，建议预约常规检查"
    - 红色：立即急诊 → "检测到[XX症状]，请15分钟内联系最近的开业动物医院"

    ## 沟通风格
    - 专业但平易近人，避免过度专业术语
    - 简明扼要，先给出核心建议，再解释原因
    - 保持冷静和温和的语气，即使面对紧急情况
    - 使用结构化回复，条理清晰，便于用户理解

    开始每次对话时，简短表明身份并说明建议仅供参考，紧急情况应立即就医。
    """
    
    request_payload = {
        "model": "deepseek-ai/DeepSeek-V3",
        "platform": "siliconflow-prod",
        "messages": [
            {"role": "system", "content": system_prompt},
            *([{"role": msg.get("role", ""), "content": msg.get("content", "")}
               for msg in session_context] if session_context else []),
            {"role": "user", "content": sanitized_input}
        ],
        "temperature": 0.85,
        "top_p": 0.95,
        "max_tokens": 4096
    }




    app.logger.debug(f"请求负载参数: {json.dumps(request_payload, ensure_ascii=False)}")
    try:
        response = requests.post(
            API_ENDPOINT,
            headers=API_HEADERS,
            json=request_payload,
            timeout=(5, 30),  # 15秒超时设置
            verify=True
        )
        response.raise_for_status()
        response_data = response.json()
        if "choices" not in response_data:
            raise APIAccessError("无效的API响应格式")
        return response_data['choices'][0]['message']['content'].strip()
    except requests.exceptions.HTTPError as e:
        app.logger.error(f"[API Error] {e.request.method} {e.request.url}")
        app.logger.error(f"[Headers] {e.request.headers}")
        app.logger.error(f"[Body] {e.request.body}")
        if e.response.status_code == 401:
            app.logger.error("认证失败校验API密钥有效性")
            raise APIAccessError("API密钥失效")
        elif 500 <= e.response.status_code < 600:
            raise APIAccessError("服务端临时故障")
        else:
            raise APIAccessError(f"请求失败: {str(e)}")
    except requests.exceptions.JSONDecodeError:
        raise APIAccessError("响应解析失败")



# ==================== 路由处理方法 ====================
@app.route('/api/chat', methods=['POST'])
@limiter.limit("5/minute")
def handle_chat():
    """优化后的聊天处理器"""
    try:
        # 双重数据验证
        if not request.is_json:
            return jsonify({"code": 400, "error": "仅支持JSON格式请求"}), 400
        if 'message' not in request.json:
            return jsonify(error="缺失message参数"), 400

        request_data = request.get_json()

        # 使用Walrus运算符简化验证
        if not (message_content := request_data.get('message')):
            return jsonify({"code": 400, "error": "缺失message参数"}), 400

        # 生成响应并记录上下文
        bot_response = enhanced_generate_response(
            user_query=message_content,
            session_context=request_data.get('history', [])
        )

        # 构建规范化响应
        return jsonify({
            "code": 200,
            "data": {
                "response": bot_response,
                "session_id": request_data.get('session_id', 'default'),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        }), 200

    except APIAccessError as e:
        app.logger.error(f"API访问异常: {str(e)}")
        return jsonify({
            "code": 503,
            "error": f"健康咨询服务暂不可用：{str(e)}"
        }), 503

    except Exception as e:
        app.logger.exception("未捕获异常：")
        return jsonify({
            "code": 500,
            "error": f"系统内部错误：{str(e)}"
        }), 500


# ================ 安全中间件（可选） ================
@app.after_request
def add_security_headers(response):
    response.headers.update({
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    })
    return response

# ------------ 启动应用 ------------
def validate_env():
    # 跳过API验证，允许应用启动
    return True

if __name__ == '__main__':
    validate_env()
    if model is None:
        try:
            test_input = torch.randn(1, 3, 224, 224, device=device)
            model(test_input)
        except RuntimeError as e:
            print(f"❌ 模型验证失败：{str(e)}")
            exit(2)
        except Exception as e:
            print(f"❌ 系统级错误: {str(e)}")
            exit(3)


    # 配置日志记录
    logging.basicConfig(
        format='%(asctime)s [%(thread)d] %(levelname)-8s %(module)s:%(lineno)d %(message)s',
        level=logging.INFO
    )

    print("\n🚀 生产服务器已启动 | 访问: http://localhost:5000")
    serve(app, host='0.0.0.0', port=5000)
