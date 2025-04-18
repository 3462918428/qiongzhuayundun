// 事件跟踪集合，记录已绑定事件的元素
const boundEventElements = new Set();

/**
 * 安全地添加事件监听器，防止重复绑定
 * @param {HTMLElement} element - 要添加事件的DOM元素
 * @param {string} eventType - 事件类型
 * @param {Function} callback - 回调函数
 * @param {boolean|Object} options - 事件选项
 */
function safeAddEventListener(element, eventType, callback, options) {
    if (!element) return;
    
    // 移除可能存在的相同类型事件监听器
    element.removeEventListener(eventType, callback, options);
    
    // 添加新的事件监听器
    element.addEventListener(eventType, callback, options);
    
    console.log(`已安全添加${eventType}事件到`, element);
}

// 重置某个元素的所有事件绑定记录
function resetElementEventBinding(element) {
    if (!element) return;
    
    const elementId = element.id || '';
    if (!elementId) return;
    
    // 移除以该元素ID开头的所有记录
    for (const key of boundEventElements) {
        if (key.startsWith(elementId + '-')) {
            boundEventElements.delete(key);
        }
    }
}

// 添加初始化标志
let hasInitialized = false;
let hasCreatedLayout = false;

// 用于控制文件选择窗口弹出的变量
let lastFilePromptTime = 0;
const FILE_PROMPT_COOLDOWN = 1000; // 1秒内不重复弹出

// 犬种英文名到中文名的映射表
const breedNameTranslations = {
    // 常见犬种
    "golden retriever": "金毛寻回犬",
    "labrador retriever": "拉布拉多寻回犬",
    "german shepherd": "德国牧羊犬",
    "french bulldog": "法国斗牛犬",
    "bulldog": "斗牛犬",
    "poodle": "贵宾犬",
    "beagle": "比格犬",
    "rottweiler": "罗威纳犬",
    "yorkshire terrier": "约克夏梗",
    "boxer": "拳师犬",
    "dachshund": "腊肠犬",
    "siberian husky": "西伯利亚哈士奇",
    "great dane": "大丹犬",
    "doberman": "杜宾犬",
    "australian shepherd": "澳大利亚牧羊犬",
    "miniature schnauzer": "迷你雪纳瑞",
    "cavalier king charles spaniel": "查理士王小猎犬",
    "shih tzu": "西施犬",
    "boston terrier": "波士顿梗",
    "pomeranian": "博美犬",
    "havanese": "哈瓦那犬",
    "shetland sheepdog": "设得兰牧羊犬",
    "pembroke welsh corgi": "威尔士柯基犬",
    "brittany": "布列塔尼犬",
    "english springer spaniel": "英国跳猎犬",
    "bernese mountain dog": "伯恩山犬",
    "cocker spaniel": "可卡犬",
    "border collie": "边境牧羊犬",
    "vizsla": "维兹拉犬",
    "basset hound": "巴吉度猎犬",
    "mastiff": "獒犬",
    "chihuahua": "吉娃娃",
    "collie": "柯利牧羊犬",
    "maltese": "马尔济斯犬",
    "weimaraner": "魏玛猎犬",
    "newfoundland": "纽芬兰犬",
    "bichon frise": "比雄犬",
    "rhodesian ridgeback": "罗得西亚脊背犬",
    "west highland white terrier": "西高地白梗",
    "shiba inu": "柴犬",
    "papillon": "蝴蝶犬",
    "bull terrier": "牛头梗",
    "saint bernard": "圣伯纳犬",
    "akita": "秋田犬",
    "alaskan malamute": "阿拉斯加雪橇犬",
    "bloodhound": "寻血猎犬",
    "pug": "巴哥犬",
    "chow chow": "松狮犬",
    "samoyed": "萨摩耶犬",
    "chinese shar pei": "沙皮犬",
    "american staffordshire terrier": "美国斯塔福郡梗",
    "dalmatian": "大麦町犬（斑点狗）",
    "afghan hound": "阿富汗猎犬",
    "standard schnauzer": "标准雪纳瑞",
    "giant schnauzer": "巨型雪纳瑞",
    "whippet": "惠比特犬",
    "italian greyhound": "意大利灵缇",
    "english cocker spaniel": "英国可卡犬",
    "airedale terrier": "刚毛猎狐梗",
    "cairn terrier": "凯恩梗",
    "soft coated wheaten terrier": "爱尔兰软毛梗",
    "irish setter": "爱尔兰雪达犬",
    "gordon setter": "戈登雪达犬",
    "australian cattle dog": "澳大利亚牧牛犬",
    "portuguese water dog": "葡萄牙水犬",
    "irish wolfhound": "爱尔兰猎狼犬",
    "saluki": "萨路基猎犬",
    "border terrier": "边境梗"
};

// 品种识别功能脚本
document.addEventListener('DOMContentLoaded', () => {
    initBreedDetection();
    
    // 创建新的统一布局
    createUnifiedLayout();
    
    // 立即添加按钮强制显示，优先级最高
    forceShowButton();
    
    // 定时检查按钮是否可见
    setInterval(forceShowButton, 500);
    
    // 为固定按钮添加事件处理
    setupFixedButton();
});

/**
 * 设置固定按钮的提交行为
 */
function setupFixedButton() {
    const fixedBtn = document.getElementById('fixedBreedBtn');
    const breedForm = document.getElementById('breedForm');
    
    if (fixedBtn && breedForm) {
        // 添加悬停效果
        fixedBtn.addEventListener('mouseenter', function() {
            // 按钮上的第二个span是我们的渐变悬停层
            const hoverLayer = this.querySelector('span:last-child');
            if (hoverLayer) {
                hoverLayer.style.opacity = '1';
            }
            
            // 轻微放大按钮
            this.style.transform = 'translateY(-5px) scale(1.03)';
            this.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.8)';
            
            // 让图标有动画效果
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        fixedBtn.addEventListener('mouseleave', function() {
            // 移除悬停效果
            const hoverLayer = this.querySelector('span:last-child');
            if (hoverLayer) {
                hoverLayer.style.opacity = '0';
            }
            
            // 恢复按钮大小
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.3)';
            
            // 恢复图标
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
        
        // 添加点击时的脉冲效果
        fixedBtn.addEventListener('click', function(e) {
            // 创建脉冲元素
            const pulse = document.createElement('span');
            pulse.style.cssText = `
                position: absolute;
                top: ${e.offsetY}px;
                left: ${e.offsetX}px;
                width: 10px;
                height: 10px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                transform: scale(0);
                animation: pulse 0.6s ease-out;
                pointer-events: none;
                z-index: 3;
            `;
            
            // 添加脉冲动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(0); opacity: 1; }
                    80% { transform: scale(12); opacity: 0.7; }
                    100% { transform: scale(20); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            // 添加到按钮中
            this.appendChild(pulse);
            
            // 动画完成后移除元素
            setTimeout(() => {
                pulse.remove();
                style.remove();
            }, 600);
            
            // 添加视觉反馈
            this.style.transform = 'scale(0.97)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
            
            // 显示加载状态
            const originalBtnText = this.innerHTML;
            this.innerHTML = `<span style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-spinner fa-spin" style="margin-right: 10px; font-size: 20px;"></i>
                识别中...
            </span>`;
            this.disabled = true;
            
            // 实际功能
            e.preventDefault();
            console.log('固定按钮被点击，触发表单提交');
            
            // 检查是否有文件选择
            const fileInput = document.getElementById('breedFileUpload');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                // 创建FormData并直接用固定按钮提交
                const formData = new FormData(breedForm);
                
                // 获取图片预览元素
                const imagePreview = document.getElementById('imagePreview');
                
                // 直接发送AJAX请求
                fetch('/predict', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`识别请求失败: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // 恢复按钮状态
                    this.innerHTML = originalBtnText;
                    this.disabled = false;
                    
                    // 显示结果
                    window.displayResult(data, imagePreview);
                    console.log('识别结果已显示');
                })
                .catch(error => {
                    // 处理错误
                    console.error('识别错误:', error);
                    this.innerHTML = originalBtnText;
                    this.disabled = false;
                    
                    // 显示错误消息
                    alert(`识别失败: ${error.message}`);
                });
            } else {
                // 恢复按钮状态
                this.innerHTML = originalBtnText;
                this.disabled = false;
                
                alert('请先选择一张宠物图片');
                // 自动触发文件选择
                fileInput.click();
            }
        });
        
        console.log('固定按钮事件处理已设置');
    } else {
        console.error('找不到固定按钮或表单元素');
    }
}

/**
 * 强制显示提交按钮，确保无论如何都能显示
 */
function forceShowButton() {
    // 强制显示普通按钮
    const submitBtn = document.getElementById('breedSubmitBtn');
    if (submitBtn) {
        submitBtn.style.cssText = `
            display: block !important; 
            visibility: visible !important; 
            opacity: 1 !important;
            position: relative !important; 
            z-index: 1000 !important; 
            width: 100% !important; 
            padding: 16px 0 !important;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; 
            color: white !important; 
            font-size: 18px !important; 
            font-weight: bold !important;
            border: none !important; 
            border-radius: 10px !important; 
            cursor: pointer !important; 
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5) !important;
        `;
    }
    
    // 强制显示固定按钮
    const fixedBtn = document.getElementById('fixedBreedBtn');
    if (fixedBtn) {
        fixedBtn.style.cssText = `
            display: inline-block !important; 
            visibility: visible !important; 
            opacity: 1 !important;
            background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%) !important; 
            color: white !important; 
            font-size: 18px !important; 
            font-weight: bold !important; 
            padding: 16px 50px !important;
            border: none !important; 
            border-radius: 50px !important; 
            cursor: pointer !important; 
            letter-spacing: 1px !important;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.3) !important;
            transition: all 0.3s ease !important; 
            text-transform: uppercase !important; 
            position: relative !important;
            overflow: hidden !important;
        `;
        
        // 确保内部元素也正确显示
        const iconSpan = fixedBtn.querySelector('span:first-child');
        if (iconSpan) {
            iconSpan.style.cssText = `
                position: relative !important;
                z-index: 2 !important; 
                display: flex !important; 
                align-items: center !important; 
                justify-content: center !important;
            `;
        }
        
        const icon = fixedBtn.querySelector('i');
        if (icon) {
            icon.style.cssText = `
                margin-right: 10px !important; 
                font-size: 20px !important;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
            `;
        }
        
        const hoverLayer = fixedBtn.querySelector('span:last-child');
        if (!hoverLayer) {
            // 如果悬停层不存在，创建它
            const newHoverLayer = document.createElement('span');
            newHoverLayer.style.cssText = `
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                right: 0 !important; 
                bottom: 0 !important;
                background: linear-gradient(135deg, #8B5CF6 0%, #4338CA 100%) !important;
                opacity: 0 !important; 
                transition: opacity 0.3s ease !important; 
                z-index: 1 !important; 
                border-radius: 50px !important;
            `;
            fixedBtn.appendChild(newHoverLayer);
        }
    }
}

/**
 * 初始化品种识别功能
 * 1. 添加图片预览功能
 * 2. 实现异步表单提交
 * 3. 在当前页面显示结果
 */
function initBreedDetection() {
    // 防止重复初始化
    if (hasInitialized) {
        console.log('品种识别功能已初始化，跳过');
        return;
    }
    
    console.log('初始化品种识别功能...');
    
    // 标记为已初始化
    hasInitialized = true;
    
    // 获取必要的DOM元素
    const breedForm = document.getElementById('breedForm');
    const fileUpload = document.getElementById('breedFileUpload');
    const imagePreview = document.getElementById('imagePreview');
    const resultContainer = document.querySelector('.result-container');
    const submitBtn = document.getElementById('breedSubmitBtn'); // 使用新ID
    const mainBreedBtn = document.querySelector('.breed-detection-btn, button[type="submit"], #mainBreedBtn, button:contains("开始品种分析")');
    
    console.log('初始化识别功能，表单元素：', breedForm ? '已找到' : '未找到');
    console.log('初始化识别功能，上传元素：', fileUpload ? '已找到' : '未找到');
    console.log('初始化识别功能，提交按钮：', submitBtn ? '已找到' : '未找到');
    console.log('初始化识别功能，主按钮：', mainBreedBtn ? '已找到' : '未找到');
    
    // 查找页面上所有按钮并记录
    const allButtons = document.querySelectorAll('button');
    console.log(`页面上找到 ${allButtons.length} 个按钮`);
    allButtons.forEach((btn, index) => {
        console.log(`按钮 ${index+1}:`, btn.id || '无ID', btn.textContent.trim());
    });
    
    // 如果找不到必要元素，直接退出
    if (!fileUpload) {
        console.error('未找到文件上传元素，尝试创建');
        // 尝试创建一个隐藏的文件上传元素
        const newFileInput = document.createElement('input');
        newFileInput.type = 'file';
        newFileInput.id = 'breedFileUpload';
        newFileInput.name = 'file';
        newFileInput.accept = 'image/*';
        newFileInput.style.display = 'none';
        document.body.appendChild(newFileInput);
        console.log('已创建新的文件上传元素');
    }
    
    // 如果找不到表单，尝试找页面上的任何表单或创建新表单
    if (!breedForm) {
        console.log('未找到特定ID的表单，尝试查找页面上的任何表单');
        const anyForm = document.querySelector('form');
        if (anyForm) {
            console.log('找到页面表单，ID:', anyForm.id);
            breedForm = anyForm;
    } else {
            console.log('页面上没有找到表单，尝试创建新表单');
            const newForm = document.createElement('form');
            newForm.id = 'breedForm';
            newForm.enctype = 'multipart/form-data';
            newForm.method = 'post';
            newForm.action = '/predict';
            // 将新表单添加到页面适当位置
            const container = document.querySelector('.upload-area') || document.body;
            container.appendChild(newForm);
            breedForm = newForm;
            console.log('已创建新表单并添加到页面');
        }
    }
    
    // 强制显示提交按钮
    forceShowButton();
    
    // 使用统一的上传处理函数
    setupUnifiedUploadArea();
    
    // 设置表单提交处理
    setupFormSubmission(breedForm, imagePreview);
    
    // 查找并处理页面上的"开始品种分析"按钮，不依赖于特定ID
    const analyzeButtons = document.querySelectorAll('button');
    analyzeButtons.forEach(btn => {
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText.includes('分析') || btnText.includes('识别') || btnText.includes('品种')) {
            console.log('找到分析按钮:', btn.textContent.trim());
            
            // 给按钮添加ID以便跟踪
            if (!btn.id) {
                btn.id = 'analyze-btn-' + Math.random().toString(36).substr(2, 9);
            }
            
            // 使用安全的事件绑定方法
            safeAddEventListener(btn, 'click', function(e) {
                e.preventDefault();
                console.log('分析按钮被点击');
                
                // 检查是否有文件上传
                const fileInput = document.getElementById('breedFileUpload');
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    console.log('有文件上传，准备提交表单');
                    
                    // 创建FormData
                    const formData = new FormData();
                    formData.append('file', fileInput.files[0]);
                    formData.append('detection_type', 'breed');
                    
                    // 显示加载状态
                    const originalBtnText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i><span>识别中...</span>';
                    this.disabled = true;
                    
                    // 发送请求
                    fetch('/predict', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`识别请求失败: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('识别成功，接收到数据:', data);
                        
                        // 恢复按钮状态
                        this.innerHTML = originalBtnText;
                        this.disabled = false;
                        
                        // 显示结果
                        try {
                            window.displayResult(data, null);
                            console.log('结果显示成功');
                        } catch (error) {
                            console.error('显示结果时出错:', error);
                            alert('显示结果失败: ' + error.message);
                        }
                    })
                    .catch(error => {
                        console.error('识别错误:', error);
                        this.innerHTML = originalBtnText;
                        this.disabled = false;
                        alert(`识别失败: ${error.message}`);
                    });
                } else {
                    console.log('没有选择文件，触发文件选择');
                    // 没有文件，触发文件选择
                    if (fileInput) {
                        safePromptFileSelection(fileInput);
                    }
                }
            });
        }
    });
    
    // 查找主页按钮和识别按钮
    const mainButton = document.querySelector('.breed-detection-btn, button[type="submit"], button:contains("开始品种分析")');
    if (mainButton) {
        console.log('找到主分析按钮:', mainButton.textContent.trim());
        
        // 给主按钮添加ID以便跟踪
        if (!mainButton.id) {
            mainButton.id = 'main-analyze-btn';
        }
        
        // 使用安全的事件绑定方法
        safeAddEventListener(mainButton, 'click', function(e) {
            e.preventDefault();
            console.log('主分析按钮被点击');
            
            // 判断是否已有选择的文件
            const fileInput = document.getElementById('breedFileUpload');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                console.log('有文件上传，准备提交表单');
                
                // 创建FormData
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('detection_type', 'breed');
                
                // 显示加载状态
                const originalBtnText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i><span>识别中...</span>';
                this.disabled = true;
                
                // 发送请求
                fetch('/predict', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`识别请求失败: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('识别成功，接收到数据:', data);
                    
                    // 恢复按钮状态
                    this.innerHTML = originalBtnText;
                    this.disabled = false;
                    
                    // 显示结果
                    try {
                        window.displayResult(data, null);
                        console.log('结果显示成功');
                    } catch (error) {
                        console.error('显示结果时出错:', error);
                        alert('显示结果失败: ' + error.message);
                    }
                })
                .catch(error => {
                    console.error('识别错误:', error);
                    this.innerHTML = originalBtnText;
                    this.disabled = false;
                    alert(`识别失败: ${error.message}`);
                });
            } else {
                console.log('没有选择文件，触发文件选择');
                // 没有文件，触发文件选择
                if (fileInput) {
                    safePromptFileSelection(fileInput);
                } else {
                    alert('请先上传宠物图片');
                }
            }
        });
    }
}

/**
 * 设置表单提交逻辑
 * 
 * @param {HTMLFormElement} breedForm - 品种识别表单
 * @param {HTMLImageElement} imagePreview - 图片预览元素
 */
function setupFormSubmission(breedForm, imagePreview) {
    if (!breedForm) {
        console.error('未找到品种识别表单');
        return;
    }
    
    console.log('设置表单提交逻辑');
    
    // 获取必要的DOM元素
    const fileInput = breedForm.querySelector('input[type="file"]');
    const breedSubmitBtn = breedForm.querySelector('.breed-submit-btn, #breedSubmitBtn, button[type="submit"]');
    
    if (!fileInput) {
        console.error('未找到文件输入元素');
            return;
        }
        
    // 表单提交处理全局函数
    window.triggerRecognition = function() {
        // 检查是否已上传图片
        if (!window.hasUploadedImage && (!fileInput.files || fileInput.files.length === 0)) {
            console.log('未选择文件，触发文件选择');
            fileInput.click();
            return;
        }
        
        console.log('开始品种识别');
        
        // 更新按钮状态
        if (breedSubmitBtn) {
            breedSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
            breedSubmitBtn.disabled = true;
            breedSubmitBtn.style.opacity = '0.7';
        }
        
        // 准备表单数据
        const formData = new FormData();
        
        // 如果已有上传的图片，使用之前的图片
        if (window.hasUploadedImage && fileInput.files.length === 0 && window.lastUploadedImage) {
            console.log('使用已上传的图片进行识别');
            
            // 从base64转换回Blob
            fetch(window.lastUploadedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "image.jpg", { type: "image/jpeg" });
                    formData.append('file', file);
                    
                    // 发送识别请求
                    sendRecognitionRequest(formData);
                })
                .catch(error => {
                    console.error('处理已上传图片时出错', error);
                    if (breedSubmitBtn) {
                        breedSubmitBtn.innerHTML = '<i class="fas fa-search"></i> 开始品种分析';
                        breedSubmitBtn.disabled = false;
                        breedSubmitBtn.style.opacity = '1';
                    }
                    showMessage('处理图片出错，请重新上传', 'error');
                });
        } else if (fileInput.files.length > 0) {
            console.log('使用新上传的图片进行识别');
            formData.append('file', fileInput.files[0]);
            sendRecognitionRequest(formData);
        }
    };
    
    function sendRecognitionRequest(formData) {
        // 发送AJAX请求
        $.ajax({
            url: '/predict',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                console.log('识别成功，获取数据：', data);
                
                // 更新按钮状态
                if (breedSubmitBtn) {
                    breedSubmitBtn.innerHTML = '<i class="fas fa-check"></i> 识别完成';
                    breedSubmitBtn.disabled = false;
                    breedSubmitBtn.style.opacity = '1';
                    
                    setTimeout(() => {
                        breedSubmitBtn.innerHTML = '<i class="fas fa-search"></i> 重新识别';
                    }, 3000);
                }
                
                try {
                    // 显示识别结果
                    if (typeof displayResult === 'function') {
                        console.log('调用displayResult显示结果');
                        displayResult(data, imagePreview || window.lastUploadedImage);
                    } else if (typeof window.displayResult === 'function') {
                        console.log('调用window.displayResult显示结果');
                        window.displayResult(data, imagePreview || window.lastUploadedImage);
                } else {
                        console.error('找不到displayResult函数');
                        showMessage('无法显示结果，请刷新页面后重试', 'error');
                    }
                } catch (err) {
                    console.error('显示结果时出错：', err);
                    showMessage('显示结果时出错：' + err.message, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('识别请求出错：', error);
                
                // 更新按钮状态
                if (breedSubmitBtn) {
                    breedSubmitBtn.innerHTML = '<i class="fas fa-search"></i> 重新识别';
                    breedSubmitBtn.disabled = false;
                    breedSubmitBtn.style.opacity = '1';
                }
                
                // 显示错误信息
                let errorMsg = '识别请求出错';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                } else if (xhr.responseText) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.error) errorMsg = response.error;
                    } catch (e) {
                        errorMsg = xhr.responseText.substring(0, 100);
                    }
                }
                
                showMessage(errorMsg, 'error');
            }
        });
    }
    
    // 绑定事件处理 - 使用安全的事件绑定方式
    if (breedForm) {
        safeAddEventListener(breedForm, 'submit', function(e) {
            e.preventDefault();
            window.triggerRecognition();
        });
    }
    
    if (breedSubmitBtn) {
        safeAddEventListener(breedSubmitBtn, 'click', function(e) {
            e.preventDefault();
            window.triggerRecognition();
        });
    }
    
    if (fileInput) {
        safeAddEventListener(fileInput, 'change', function(e) {
            if (fileInput.files.length > 0) {
                console.log('文件已选择，处理文件');
                handleFileSelect(fileInput.files[0]);
            }
        });
    }
}

/**
 * 设置拖放上传区域
 */
function setupDragDropUpload() {
    const dropArea = document.getElementById('uploadDropArea');
    const fileInput = document.getElementById('breedFileUpload');
    
    if (!dropArea || !fileInput) {
        console.warn('未找到拖放上传区域或文件输入元素');
        return;
    }
    
    console.log('设置拖放上传区域');
    
    // 防止默认拖放行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        safeAddEventListener(dropArea, eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 高亮显示拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        safeAddEventListener(dropArea, eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        safeAddEventListener(dropArea, eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
        dropArea.style.borderColor = 'rgba(138, 92, 246, 0.8)';
        dropArea.style.backgroundColor = 'rgba(138, 92, 246, 0.05)';
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
        dropArea.style.borderColor = 'rgba(138, 92, 246, 0.5)';
        dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
    }
    
    // 处理拖放文件
    safeAddEventListener(dropArea, 'drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            // 触发change事件，使用已有的处理逻辑
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
    
    // 点击上传区域触发文件选择，但避免重复点击事件
    safeAddEventListener(dropArea, 'click', function(e) {
        // 避免重复点击
        if (e.target !== this) return;
        
        // 避免点击按钮时触发
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    });
}

/**
 * 显示上传成功提示
 */
function showUploadSuccess() {
    // 创建并显示toast通知
    const toast = document.createElement('div');
    toast.className = 'upload-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(16, 185, 129, 0.9)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 18px;"></i>
        <span>图片上传成功，请点击"开始品种分析"按钮</span>
    `;
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // 自动移除toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
    
    // 获取"开始品种分析"按钮并使其闪烁
    const breedSubmitBtn = document.getElementById('breedSubmitBtn');
    if (breedSubmitBtn) {
        // 移除之前的闪烁类
        breedSubmitBtn.classList.remove('blink-button');
        // 触发重排
        void breedSubmitBtn.offsetWidth;
        // 添加闪烁类
        breedSubmitBtn.classList.add('blink-button');
    }
}

// 添加到CSS
function addCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 100% { box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4); }
            50% { box-shadow: 0 5px 25px rgba(16, 185, 129, 0.8); }
        }
        .blink-button {
            animation: blink 1s ease-in-out 3;
        }
    `;
    document.head.appendChild(style);
}

// 在DOM加载时添加CSS
document.addEventListener('DOMContentLoaded', addCSS);

/**
 * 直接在页面加载时替换现有内容
 */
(function() {
    // 确保DOM已加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBreedDetection);
    } else {
        initBreedDetection();
    }
})();

// 修改createUnifiedLayout函数，增加页面宽度并优化布局
function createUnifiedLayout() {
    // 防止重复创建布局
    if (hasCreatedLayout) {
        console.log('统一布局已创建，跳过');
        return;
    }
    
    console.log('创建更宽的布局...');
    
    // 标记为已创建布局
    hasCreatedLayout = true;
    
    // 页面初始清理
    // 查找右侧预览窗口并删除
    const previewSection = document.querySelector('.preview-section');
    if (previewSection) {
        console.log('找到并移除预览区域');
        previewSection.remove();
    }

    // 查找预览结果区域，修改其布局
    const previewResultArea = document.querySelector('.preview-result-area');
    if (previewResultArea) {
        // 清除预览区域内容
        const previewElements = previewResultArea.querySelectorAll('.preview-section');
        previewElements.forEach(el => el.remove());
        
        // 修改预览结果区域样式，使其只包含结果容器
        previewResultArea.style.minWidth = '100%';
    }
    
    // 修改内容网格区域布局
    const contentGrid = document.querySelector('.content-grid');
    if (contentGrid) {
        contentGrid.style.display = 'block';
        contentGrid.style.maxWidth = '1200px';
        contentGrid.style.margin = '0 auto';
    }
    
    // 找到上传区域并调整宽度
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.style.maxWidth = '1000px';
        uploadArea.style.margin = '0 auto';
    }
    
    // 修复结果容器样式
    const resultContainer = document.querySelector('.result-container');
                if (resultContainer) {
        resultContainer.style.maxWidth = '1000px';
        resultContainer.style.margin = '30px auto';
    }
    
    // 查找所有预览相关的容器并移除
    const previewContainers = document.querySelectorAll('[id*="preview"], [class*="preview"]');
    previewContainers.forEach(container => {
        if (container.id !== 'imagePreview') {
            console.log('移除预览容器:', container);
            container.remove();
        }
    });
    
    // 隐藏imagePreview元素
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        // 创建一个不可见的容器保存它，以便后续功能不报错
        const hiddenContainer = document.createElement('div');
        hiddenContainer.style.display = 'none';
        hiddenContainer.id = 'hiddenPreviewContainer';
        document.body.appendChild(hiddenContainer);
        hiddenContainer.appendChild(imagePreview);
    }
    
    // 修改主要布局为上传区域在上，结果区域在下
    document.addEventListener('DOMContentLoaded', () => {
        const mainContainer = document.querySelector('#detectionPage, .page-content');
        if (mainContainer) {
            const uploadSection = mainContainer.querySelector('.upload-area');
            const resultSection = mainContainer.querySelector('.result-container');
            
            if (uploadSection && resultSection) {
                // 使结果容器保持在上传区域下方
                uploadSection.parentNode.insertBefore(resultSection, uploadSection.nextSibling);
            }
        }
    });
    
    // 接着添加文件上传的事件监听
    setupUnifiedUploadArea();
    
    // 调整结果显示函数
    adjustResultDisplay();
}

/**
 * 调整结果显示函数，适应新的水平布局
 */
function adjustResultDisplay() {
    // 重写displayResult函数
    window.displayResult = function(data, imagePreview) {
        console.log('尝试显示识别结果:', data);
        // 添加详细日志，用于调试
        console.log('接收到的字段:', Object.keys(data));
        console.log('品种信息:', data.result || data.breed);
        
        // 查找或创建结果容器
        let resultContainer = document.querySelector('.result-container');
        
        // 如果找不到结果容器，尝试创建一个
        if (!resultContainer) {
            console.log('未找到结果容器，尝试创建');
            resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            resultContainer.style.cssText = `
                width: 100%;
                padding: 20px;
                border-radius: 15px;
                margin-top: 30px;
                background: rgba(20, 20, 40, 0.5);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(138, 92, 246, 0.3);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            `;
            
            // 尝试找到可能的父容器
            const possibleParents = [
                document.querySelector('.breed-detection-container'),
                document.querySelector('.preview-result-area'),
                document.querySelector('.preview-container'),
                document.querySelector('#breedForm')?.parentNode,
                document.getElementById('breedForm')?.parentNode
            ];
            
            let parentFound = false;
            for (const parent of possibleParents) {
                if (parent) {
                    console.log('找到可用的父容器:', parent);
                    parent.appendChild(resultContainer);
                    parentFound = true;
                    break;
                }
            }
            
            // 如果找不到合适的父容器，附加到表单后面
            if (!parentFound) {
                console.log('未找到合适的父容器，附加到表单后面');
                const breedForm = document.getElementById('breedForm');
                if (breedForm) {
                    breedForm.parentNode.insertBefore(resultContainer, breedForm.nextSibling);
                } else {
                    console.error('无法附加结果容器：找不到表单或其他合适的父元素');
                    alert('显示结果失败：无法找到合适的容器');
                    return; // 终止函数
                }
            }
        }
        
        console.log('结果容器已找到或创建:', resultContainer);
        
        // 确保容器可见
        resultContainer.style.display = 'block';
        
        // 准备图片来源
        let imgSrc = '';
        
        // 从API响应获取图片路径（如果有）
        if (data.image_path) {
            // 检查路径是否需要添加前缀
            if (data.image_path.startsWith('http') || data.image_path.startsWith('/')) {
                // 已经是完整URL或以/开头的绝对路径
                imgSrc = data.image_path;
            } else if (data.image_path.includes('/')) {
                // 相对路径，但已包含某些目录结构
                imgSrc = '/' + data.image_path;
            } else {
                // 仅文件名，添加上传目录路径
                imgSrc = '/static/uploads/' + data.image_path;
            }
            console.log('处理后的图片路径:', imgSrc);
        } 
        // 从传入的imagePreview获取（如果有）
        else if (imagePreview && imagePreview.src) {
            imgSrc = imagePreview.src;
            console.log('使用imagePreview中的图片:', imgSrc);
        } 
        // 从全局保存的图片获取（如果有）
        else if (window.lastUploadedImage) {
            imgSrc = window.lastUploadedImage;
            console.log('使用全局保存的图片:', '(Base64图片)');
        }
        // 如果没有图片，显示占位符
        else {
            imgSrc = '/static/img/placeholder-image.jpg';
            console.warn('未找到图片源，使用占位符');
        }
        
        // 检查图片路径是否可访问
        const testImg = new Image();
        testImg.onload = function() {
            console.log('图片路径有效，图片已成功加载');
        };
        testImg.onerror = function() {
            console.error('图片路径无效或图片无法加载，尝试替代路径');
            // 尝试替代路径
            if (data.image_path) {
                if (imgSrc.startsWith('/static/uploads/')) {
                    // 尝试不同的目录结构
                    imgSrc = '/static/' + data.image_path;
                    console.log('尝试替代路径:', imgSrc);
                } else if (window.lastUploadedImage) {
                    // 回退到上传的图片预览
                    imgSrc = window.lastUploadedImage;
                    console.log('回退到上传的图片预览');
                }
                updateResultImageSrc(imgSrc);
            }
        };
        testImg.src = imgSrc;
        
        // 更新结果中的图片src
        function updateResultImageSrc(newSrc) {
            const resultImage = resultContainer.querySelector('.result-image-section img');
            if (resultImage) {
                resultImage.src = newSrc;
                console.log('已更新结果图片源:', newSrc);
            }
        }
        
        // 准备时间戳
        const timestamp = new Date().toLocaleString();
        
        // 获取主要结果数据
        const rawBreedName = data.result || data.breed || '未知品种';
        console.log('原始品种名称:', rawBreedName);
        
        // 处理品种名称 - 去掉n开头的数字和连字符，并转为易读格式
        const cleanBreedName = rawBreedName.replace(/^n\d+-/, '').replace(/_/g, ' ');
        console.log('清理后的品种名称:', cleanBreedName);
        
        const breedNameEn = cleanBreedName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        console.log('格式化后的英文品种名称:', breedNameEn);
        
        // 查找中文翻译
        const breedNameLower = cleanBreedName.toLowerCase();
        const breedNameCn = breedNameTranslations[breedNameLower] || '未知品种';
        console.log('中文品种名称:', breedNameCn);
        
        // 组合显示名称（中英文）
        const displayBreedName = breedNameCn + (breedNameCn !== '未知品种' ? `（${breedNameEn}）` : '');
        console.log('显示名称:', displayBreedName);
        
        const percentage = data.percentage ? (data.percentage * 100).toFixed(2) + '%' : '95%';
        const processingTime = data.processing_time || '0.5秒';
        
        // 整理扩展信息
        const systemInfo = data.system_info || {
            model_version: 'ResNet50 v1.5',
            device: 'GPU',
            resolution: '224x224'
        };
        
        // 构建HTML结构
        const resultHTML = `
            <div class="result-wrapper" style="
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: space-between;
            ">
                <!-- 图片部分 -->
                <div class="result-image-section" style="
                    flex: 1;
                    min-width: 300px;
                    max-width: 100%;
                ">
                    <img src="${imgSrc}" alt="${displayBreedName}" style="
                        width: 100%;
                        height: auto;
                        border-radius: 15px;
                        object-fit: cover;
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    ">
                    <div class="image-path-debug" style="
                        font-size: 12px;
                        color: rgba(255,255,255,0.5);
                        padding: 5px 0;
                        text-align: center;
                    ">图片路径: ${imgSrc}</div>
                </div>
            
                <!-- 信息部分 -->
                <div class="result-info-section" style="
                    flex: 1;
                    min-width: 300px;
                ">
                    <!-- 品种名称卡片 -->
                    <div class="breed-card" style="
                        background: linear-gradient(135deg, rgba(67, 56, 202, 0.4) 0%, rgba(79, 70, 229, 0.4) 100%);
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        border: 1px solid rgba(138, 92, 246, 0.5);
                    ">
                        <h2 style="
                            font-size: 24px;
                            margin: 0 0 10px 0;
                            color: white;
                            font-weight: 600;
                        ">
                            <i class="fas fa-paw" style="margin-right: 8px;"></i>
                            ${displayBreedName}
                        </h2>
                        <div class="percentage-bar" style="
                            height: 8px;
                            width: 100%;
                            background: rgba(30, 30, 60, 0.5);
                            border-radius: 10px;
                            margin-top: 10px;
                            overflow: hidden;
                        ">
                            <div style="
                                height: 100%;
                                width: ${percentage};
                                background: linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%);
                                border-radius: 10px;
                            "></div>
                        </div>
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-top: 5px;
                            font-size: 14px;
                            color: rgba(255, 255, 255, 0.8);
                        ">
                            <span>匹配度</span>
                            <span>${percentage}</span>
                        </div>
                    </div>
                    
                    <!-- 图像信息卡片 -->
                    <div class="image-info-card" style="
                        background: rgba(30, 30, 60, 0.4);
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        border: 1px solid rgba(100, 116, 139, 0.3);
                    ">
                        <h3 style="
                            font-size: 18px;
                            margin: 0 0 15px 0;
                            color: rgba(255, 255, 255, 0.9);
                            font-weight: 500;
                        ">
                            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                            图像信息
                        </h3>
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            color: rgba(255, 255, 255, 0.8);
                            font-size: 14px;
                        ">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-image" style="color: #60A5FA;"></i>
                                <span>图像ID: ${data.image_id || '自动生成'}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-clock" style="color: #F97316;"></i>
                                <span>处理时间: ${processingTime}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI模型信息卡 -->
                    <div class="model-info-card" style="
                        background: rgba(30, 30, 60, 0.4);
                        border-radius: 12px;
                        padding: 20px;
                        border: 1px solid rgba(100, 116, 139, 0.3);
                    ">
                        <h3 style="
                            font-size: 18px;
                            margin: 0 0 15px 0;
                            color: rgba(255, 255, 255, 0.9);
                            font-weight: 500;
                        ">
                            <i class="fas fa-robot" style="margin-right: 8px;"></i>
                            AI模型信息
                        </h3>
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 10px;
                            color: rgba(255, 255, 255, 0.8);
                            font-size: 14px;
                        ">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-code-branch" style="color: #8B5CF6;"></i>
                                <span>模型版本: ${systemInfo.model_version}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-microchip" style="color: #10B981;"></i>
                                <span>运行设备: ${systemInfo.device}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-expand" style="color: #F59E0B;"></i>
                                <span>输入分辨率: ${systemInfo.resolution}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div style="
                        margin-top: 20px;
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                    ">
                        <button id="reuploadBtn" style="
                            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
                            border: none;
                            border-radius: 10px;
                            padding: 12px 20px;
                            color: white;
                            font-weight: 500;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
                            transition: all 0.3s ease;
                        ">
                            <i class="fas fa-upload"></i>
                            重新上传图片
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 设置容器内容
        resultContainer.innerHTML = resultHTML;
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 给重新上传按钮添加事件监听
        const reuploadBtn = document.getElementById('reuploadBtn');
        if (reuploadBtn) {
            // 先为按钮添加ID，如果没有的话
            if (!reuploadBtn.id) {
                reuploadBtn.id = 'reuploadBtn';
            }
            
            // 使用安全事件绑定函数绑定点击事件
            safeAddEventListener(reuploadBtn, 'click', function() {
                // 触发文件选择对话框
                const fileInput = document.getElementById('breedFileUpload') || document.getElementById('dog_file');
                if (fileInput) {
                    // 清除当前文件的选择，以确保change事件会触发
                    fileInput.value = '';
                    
                    // 设置一个标志表示这是用户主动点击"重新上传"按钮
                    window.isReuploadButtonClicked = true;
                    console.log('设置重新上传标志');
                    
                    // 重置上传图片标志
                    window.hasUploadedImage = false;
                    
                    // 添加一次性事件监听，在文件选择后重置标志
                    const resetFlag = function() {
                        window.isReuploadButtonClicked = false;
                        console.log('重置重新上传标志');
                        fileInput.removeEventListener('change', resetFlag);
                    };
                    
                    fileInput.addEventListener('change', resetFlag, { once: true });
                    
                    // 更新界面提示
                    const resultContainer = document.querySelector('.result-container');
                    if (resultContainer) {
                        resultContainer.innerHTML = `
                            <div style="
                                text-align: center;
                                padding: 40px;
                                color: rgba(255, 255, 255, 0.7);
                                font-size: 16px;
                            ">
                                <i class="fas fa-upload" style="font-size: 40px; margin-bottom: 15px; color: #6366F1;"></i>
                                <p>请选择新的图片上传...</p>
                            </div>
                        `;
                    }
                    
                    // 延迟执行点击操作，确保界面更新后再弹出文件选择框
                    setTimeout(() => {
                        // 重新上传图片时，强制重置冷却时间
                        lastFilePromptTime = 0;
                        safePromptFileSelection(fileInput);
                    }, 100);
                }
            });
        }
        
        console.log('识别结果已显示');
        
        // 恢复固定按钮的状态
        const fixedButton = document.querySelector('.fixed-button');
        if (fixedButton) {
            fixedButton.style.transform = 'translateY(0)';
            fixedButton.style.opacity = '1';
        }
    };
}

/**
 * 设置统一上传区域
 */
function setupUnifiedUploadArea() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('dog_file');
    const previewContainer = document.querySelector('.preview-container');
    const previewImage = document.querySelector('.preview-image');
    const changeImageBtn = document.querySelector('.change-image-btn');
    const recognizeButton = document.querySelector('button[type="submit"]');
    
    if (!uploadArea || !fileInput) {
        console.error('上传区域或文件输入元素不存在!');
            return;
        }
        
    console.log('设置上传区域: ', uploadArea);
    console.log('文件输入: ', fileInput);
    
    /**
     * 处理文件选择逻辑
     * @param {File} file 选择的文件
     */
    const handleFileSelect = (file) => {
        // 检查是否为图片文件
        if (!file.type.match('image.*')) {
            alert('请选择图片文件!');
            return;
        }
        
        // 显示文件名和预览
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewContainer && previewImage) {
                // 显示预览容器
                previewContainer.style.display = 'block';
                // 设置预览图片
                previewImage.src = e.target.result;
                // 隐藏上传区提示
                if (uploadArea.querySelector('.upload-instructions')) {
                    uploadArea.querySelector('.upload-instructions').style.display = 'none';
                }
                
                // 显示更改图片按钮
                if (changeImageBtn) {
                    changeImageBtn.style.display = 'block';
                }
                
                // 添加脉冲效果到识别按钮
                if (recognizeButton) {
                    recognizeButton.classList.add('pulse-button');
                    // 5秒后移除脉冲效果
                    setTimeout(() => {
                        recognizeButton.classList.remove('pulse-button');
                    }, 5000);
                }
                
                console.log('文件已加载并显示预览');
            }
        };
        reader.readAsDataURL(file);
        
        // 显示上传成功提示
        showUploadSuccess(file.name);
    };
    
    // 设置点击上传区域选择文件
    const uploadAreaClickHandler = (e) => {
        // 避免点击按钮时触发
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    };
    safeAddEventListener(uploadArea, 'click', uploadAreaClickHandler);
    
    // 设置拖放功能
    const dragOverHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragover');
    };
    safeAddEventListener(uploadArea, 'dragover', dragOverHandler);
    
    const dragLeaveHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
    };
    safeAddEventListener(uploadArea, 'dragleave', dragLeaveHandler);
    
    const dropHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
            // 更新fileInput的值以保持一致性
            // 注意：由于安全限制，不能直接设置fileInput.files
            // 但fileInput.files[0]会在表单提交时被使用
        }
    };
    safeAddEventListener(uploadArea, 'drop', dropHandler);
    
    // 处理文件选择
    const fileChangeHandler = (e) => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    };
    safeAddEventListener(fileInput, 'change', fileChangeHandler);
    
    // 更改图片按钮功能
    if (changeImageBtn) {
        const changeImageHandler = () => {
            fileInput.click();
        };
        safeAddEventListener(changeImageBtn, 'click', changeImageHandler);
    }
    
    console.log('统一上传区域设置完成');
}

// 确保在DOM加载完成后运行此函数
document.addEventListener('DOMContentLoaded', setupUnifiedUploadArea);

// 强制确保文件上传处理正确设置
setTimeout(() => {
    setupUnifiedUploadArea();
}, 500);

// 确保最后的执行流程中不会创建额外的按钮
setTimeout(() => {
    console.log('最终布局更新');
    
    // 确保布局正确创建
    createUnifiedLayout();
    
    // 确保表单提交设置
    setupFormSubmission();
    
    // 确保按钮可见
    forceShowButton();
}, 200);

/**
 * 通用的直接触发识别功能的函数 - 可在控制台手动调用
 * @param {File|null} file - 可选的文件对象，如果不提供则尝试从页面获取
 * @return {boolean} - 是否成功开始识别过程
 */
window.triggerRecognition = function(file) {
    console.log('直接触发识别流程');
    
    // 确定文件 - 如果没有传入文件，则尝试从页面上获取
    let fileToUpload = file;
    
    if (!fileToUpload) {
        // 尝试从页面上找到文件输入元素
        const fileInput = document.getElementById('breedFileUpload');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            fileToUpload = fileInput.files[0];
            console.log('从文件输入获取上传文件:', fileToUpload.name);
        } else {
            console.error('未找到上传文件，请先选择一个文件或传入文件对象');
            alert('请先选择一张宠物照片');
            
            // 只有当没有文件时才弹出文件选择框
            if (fileInput) {
                safePromptFileSelection(fileInput);
            }
            return false;
        }
    }
    
    // 找到或创建表单数据
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('detection_type', 'breed');
    
    // 找到提交按钮并显示加载状态
    const submitBtn = document.getElementById('breedSubmitBtn');
    let originalBtnText = '开始品种分析';
    if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i><span>识别中...</span>';
        submitBtn.disabled = true;
    }
        
    console.log('发送识别请求...');
        
        // 发送AJAX请求
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`识别请求失败: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
        console.log('识别成功，接收到数据:', data);
        
            // 恢复按钮状态
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
            
            // 显示结果
        try {
            // 确保window.displayResult函数存在
            if (typeof window.displayResult !== 'function') {
                console.error('displayResult函数不存在，尝试重新创建');
                adjustResultDisplay();
            }
            
            window.displayResult(data, null);
            console.log('结果显示成功');
            return true;
        } catch (error) {
            console.error('显示结果时出错:', error);
            alert('显示结果失败: ' + error.message);
            return false;
        }
        })
        .catch(error => {
            console.error('识别错误:', error);
        
        // 恢复按钮状态
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
            
            alert(`识别失败: ${error.message}`);
        return false;
    });
    
    return true;
};

// 为页面上的所有提交按钮添加直接调用函数的事件处理
// 只运行一次，防止重复绑定
let hasSetupGlobalEvents = false;

function setupGlobalButtonEvents() {
    if (hasSetupGlobalEvents) {
        console.log('全局按钮事件已设置，跳过');
        return;
    }
    
    console.log('添加通用提交事件处理');
    
    // 记录已处理过的按钮，防止重复添加事件
    const processedButtons = new Set();
    
    // 查找所有可能的提交按钮
    const allButtons = document.querySelectorAll('button, input[type="submit"]');
    allButtons.forEach(btn => {
        // 跳过已处理过的按钮
        if (processedButtons.has(btn)) {
            return;
        }
        
        if (btn.textContent && (
            btn.textContent.includes('品种分析') || 
            btn.textContent.includes('识别') || 
            btn.textContent.includes('分析')
        )) {
            console.log('找到提交按钮:', btn.textContent.trim());
            
            // 标记为已处理
            processedButtons.add(btn);
            
            // 添加统一的按钮ID，方便后续处理
            if (!btn.id) {
                btn.id = 'auto-btn-' + Math.random().toString(36).substr(2, 9);
            }
            
            // 使用安全的事件绑定方法
            safeAddEventListener(btn, 'click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('提交按钮被点击:', this.textContent);
                
                // 检查文件是否已上传
                const fileInput = document.getElementById('breedFileUpload');
                if (fileInput && fileInput.files && fileInput.files.length > 0) {
                    // 有文件，直接触发识别
                    window.triggerRecognition();
                } else {
                    // 没有文件，触发文件选择
                    if (fileInput) {
                        fileInput.click();
                    }
                }
            });
        }
    });
    
    // 添加全局事件处理 - 当用户按Alt+S时触发识别
    safeAddEventListener(document, 'keydown', function(e) {
        // Alt+S (识别快捷键)
        if (e.altKey && e.key === 's') {
            console.log('Alt+S被按下，尝试开始识别');
            window.triggerRecognition();
        }
    });
    
    hasSetupGlobalEvents = true;
}

// 适当延迟执行，确保DOM已经加载完毕
setTimeout(setupGlobalButtonEvents, 500);

// 在DOM内容加载完成后也执行一次
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupGlobalButtonEvents, 200);
});

/**
 * 安全地触发文件选择窗口
 * @param {HTMLInputElement} fileInput - 文件输入元素
 * @return {boolean} - 是否成功弹出选择窗口
 */
function safePromptFileSelection(fileInput) {
    if (!fileInput) {
        console.error('文件输入元素不存在，无法触发文件选择');
        return false;
    }
    
    const currentTime = Date.now();
    
    // 如果上次弹窗时间太近，则跳过
    if (currentTime - lastFilePromptTime < FILE_PROMPT_COOLDOWN) {
        console.warn('文件选择冷却中，阻止重复弹出:', 
            currentTime - lastFilePromptTime, 'ms');
        return false;
    }
    
    // 防止重复触发，先将文件输入值清空
    if (window.hasUploadedImage) {
        console.log('已上传图片，不触发文件选择窗口');
        return false;
    }
    
    // 记录这次弹窗时间
    lastFilePromptTime = currentTime;
    console.log('触发文件选择窗口:', new Date().toLocaleString());
    
    // 触发点击
    try {
        fileInput.click();
        return true;
    } catch (error) {
        console.error('触发文件选择失败:', error);
        return false;
    }
}

// 处理文件选择
function handleFileSelect(file) {
    if (!file) {
        console.error('未传入文件对象');
        return;
    }
    
    console.log('处理所选文件:', file.name);
    
    // 全局变量存储上传的图片，便于后续识别
    window.lastUploadedImage = null;
    window.hasUploadedImage = false;
    
    // 验证文件类型
    if (!file.type.match('image.*')) {
        console.error('不支持的文件类型:', file.type);
        showMessage('请选择图片文件 (jpg, png, etc.)', 'error');
        return;
    }
    
    // 读取并预览图片
    const reader = new FileReader();
    reader.onload = function (e) {
        console.log('图片读取完成，显示预览');
        
        // 保存到全局变量
        window.lastUploadedImage = e.target.result;
        window.hasUploadedImage = true;
        
        // 寻找图片预览容器
        const previewContainers = [
            document.querySelector('.image-preview'),
            document.getElementById('imagePreview'),
            document.querySelector('.preview-container')
        ];
        
        let previewContainer = null;
        for (const container of previewContainers) {
            if (container) {
                previewContainer = container;
                break;
            }
        }
        
        // 如果找到预览容器
        if (previewContainer) {
            // 清空现有内容并添加预览图片
            previewContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            previewContainer.appendChild(img);
            
            // 显示预览区域
            previewContainer.style.display = 'block';
            
            // 如果存在识别按钮，突出显示它
            const recognizeBtn = document.querySelector('.breed-submit-btn, #breedSubmitBtn, button[type="submit"]');
            if (recognizeBtn) {
                recognizeBtn.innerHTML = '<i class="fas fa-search"></i> 开始品种分析';
                recognizeBtn.disabled = false;
                recognizeBtn.style.opacity = '1';
                recognizeBtn.classList.add('pulse-effect');
                
                // 添加脉动效果的CSS
                if (!document.getElementById('pulse-effect-style')) {
                    const style = document.createElement('style');
                    style.id = 'pulse-effect-style';
                    style.textContent = `
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7); }
                            70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
                        }
                        .pulse-effect {
                            animation: pulse 2s infinite;
                            transform: scale(1);
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // 5秒后移除脉动效果
    setTimeout(() => {
                    recognizeBtn.classList.remove('pulse-effect');
                }, 5000);
            }
            
            // 显示上传成功消息
            showUploadSuccess(file.name);
        } else {
            console.error('找不到预览容器');
            // 即使没有预览容器，仍然标记为成功上传
            showUploadSuccess(file.name);
        }
    };
    
    reader.onerror = function(e) {
        console.error('文件读取错误:', e);
        showMessage('读取文件出错', 'error');
    };
    
    reader.readAsDataURL(file);
}

    