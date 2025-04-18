// ================== 增强版前端交互 ==================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavTabs();
    initForms();
    initChat();
    initSymptomGuide();
    initAnimations();
    initAccessibility();
    initScrollEffects();
    initGlassEffects();
    displayPets(); // 初始化宠物档案显示
    
    // 确保品种识别按钮可见
    forceShowBreedButton();
    
    // 确保宠物照片上传按钮可见
    forceShowUploadButton();
    
    // 定期检查品种识别按钮和上传按钮
    setInterval(forceShowBreedButton, 1000);
    setInterval(forceShowUploadButton, 1000);
    
    // 初始化宠物档案功能
    initPetProfiles();
    
    // 初始化所有检测模块
    initDetectionModules();
    
    // 绑定宠物模态框事件，确保打开和关闭正常工作
    const addPetBtn = document.getElementById('addPetBtn');
    if (addPetBtn) {
        addPetBtn.addEventListener('click', openPetModal);
    }
    
    const petProfileForm = document.getElementById('petProfileForm');
    if (petProfileForm) {
        petProfileForm.addEventListener('submit', savePetProfile);
    }
    
    // 初始化关于我们页面的联系按钮
    initAboutPageContactButton();
});

// 强制显示宠物照片上传按钮
function forceShowUploadButton() {
    const uploadBtn = document.getElementById('uploadAvatarBtn');
    if (uploadBtn) {
        uploadBtn.style.cssText = `
            display: inline-block !important; 
            visibility: visible !important; 
            opacity: 1 !important;
            position: relative !important; 
            z-index: 1000 !important; 
            padding: 8px 16px !important;
            background: linear-gradient(135deg, #6a3093, #a044ff) !important; 
            color: white !important; 
            font-size: 14px !important; 
            font-weight: bold !important;
            border: none !important; 
            border-radius: 6px !important; 
            cursor: pointer !important; 
            margin-left: 10px !important;
            box-shadow: 0 4px 10px rgba(106, 48, 147, 0.3) !important;
        `;
        console.log('app.js: 宠物照片上传按钮强制显示');
    }
}

// 强制显示品种识别按钮
function forceShowBreedButton() {
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
            margin: 10px auto !important;
        `;
        console.log('app.js: 品种识别按钮强制显示');
    }
}

// 初始化标签切换功能
function initNavTabs() {
    // 处理主导航标签切换
    document.querySelectorAll('.main-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有导航按钮激活状态
            document.querySelectorAll('.main-nav .nav-item.active').forEach(item =>
                item.classList.remove('active'));

            // 添加当前按钮激活状态
            this.classList.add('active');

            // 隐藏所有页面
            document.querySelectorAll('.page-content').forEach(page =>
                page.classList.remove('active'));

            // 显示对应页面
            const targetId = this.dataset.page;
            document.getElementById(targetId).classList.add('active');
            
            // 如果是切换到识别页面，确保默认显示品种识别模块
            if (targetId === 'detectionPage') {
                // 激活品种识别标签
                document.querySelectorAll('.nav-tabs .nav-item').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.tab === 'breed') {
                        tab.classList.add('active');
                    }
                });
                
                // 激活品种识别模块
                document.querySelectorAll('.detection-module').forEach(module => {
                    module.classList.remove('active');
                });
                const breedModule = document.getElementById('breedModule');
                if (breedModule) {
                    breedModule.classList.add('active');
                    // 确保提交按钮可见
                    setTimeout(forceShowBreedButton, 100);
                }
            }
        });
    });

    // 处理识别功能标签切换
    document.querySelectorAll('.nav-tabs .nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有标签按钮激活状态
            document.querySelectorAll('.nav-tabs .nav-item.active').forEach(item =>
                item.classList.remove('active'));

            // 添加当前按钮激活状态
            this.classList.add('active');

            // 隐藏所有检测模块
            document.querySelectorAll('.detection-module').forEach(module =>
                module.classList.remove('active'));

            // 显示对应检测模块
            const tabType = this.dataset.tab;
            document.getElementById(tabType + 'Module').classList.add('active');

            // 更新隐藏字段的值
            const detectionTypesInputs = document.querySelectorAll('input[name="detection_type"]');
            detectionTypesInputs.forEach(input => {
                input.value = tabType;
            });
            
            // 如果是品种识别标签，强制显示按钮
            if (tabType === 'breed') {
                setTimeout(forceShowBreedButton, 100);
            }
        });
    });
}

// 初始化动画效果
function initAnimations() {
    // 使用requestAnimationFrame优化动画性能
    const animateElements = document.querySelectorAll('.feature-card, .source-card, .result-card');
    
    // 使用Intersection Observer实现滚动显示动画，添加节流
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '50px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                });
            }
        });
    }, observerOptions);
    
    // 使用DocumentFragment批量处理DOM操作
    const fragment = document.createDocumentFragment();
    animateElements.forEach(el => {
        el.classList.add('animate-in');
        fragment.appendChild(el.cloneNode(true));
        observer.observe(el);
    });
    
    // 优化粒子背景效果
    const particleCanvas = document.querySelector('.particle-canvas');
    if (particleCanvas) {
        requestIdleCallback(() => {
            initParticleBackground(particleCanvas);
        });
    }
    
    // 优化标题动画
    requestAnimationFrame(animateTitle);
}

// 标题动画效果
function animateTitle() {
    const title = document.querySelector('.app-title');
    if (title) {
        setTimeout(() => {
            title.style.marginLeft = '0';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // 为标题添加渐变文本效果
    const highlights = document.querySelectorAll('.highlight');
    highlights.forEach(highlight => {
        highlight.classList.add('gradient-text');
    });
}

// 粒子背景效果增强版
function initParticleBackground(canvas) {
    if (!canvas || !canvas.getContext) {
        console.warn('Canvas不支持或未找到');
        return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;
    let lastTime = 0;
    const FPS = 240;
    const frameDelay = 1000 / FPS;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    
    const particles = [];
    const particleCount = 50; // 优化粒子数量

    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 0.5, // 更多样化的粒子大小
            color: `rgba(${Math.random() > 0.5 ? '91, 143, 249' : '58, 175, 169'}, ${Math.random() * 0.3})`,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3 // 随机透明度
        });
    }
    
    // 优化的动画循环
    function animate(currentTime) {
        animationFrameId = requestAnimationFrame(animate);
        
        // 控制帧率
        const elapsed = currentTime - lastTime;
        if (elapsed < frameDelay) return;
        lastTime = currentTime - (elapsed % frameDelay);
        
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // 边界检查
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            // 绘制粒子
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            ctx.closePath();
        });
    }
    
    animate(0);
    
    // 窗口大小改变时重置画布
    window.addEventListener('resize', resizeCanvas);
    
    // 清理函数
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resizeCanvas);
    };
}

// 初始化宠物档案功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化宠物档案功能');
    
    // 直接绑定文件上传事件
    const petAvatar = document.getElementById('petAvatar');
    if (petAvatar) {
        console.log('找到文件上传输入框，添加change事件');
        petAvatar.addEventListener('change', function(e) {
            console.log('文件选择已改变，调用预览函数');
            previewPetAvatar(this);
        });
    } else {
        console.error('未找到宠物照片上传输入框');
    }
    
    // 绑定模态框关闭按钮事件
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closePetModal);
    }
    
    // 添加ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePetModal();
        }
    });
    
    // 初始化宠物档案管理功能
    initPetProfiles();
});

// 本地存储键
const PET_PROFILES_KEY = 'petProfiles';

// 初始化宠物档案功能
function initPetProfiles() {
    displayPetProfiles();
    
    // 绑定添加按钮事件
    const addPetBtn = document.getElementById('addPetBtn');
    if (addPetBtn) {
        addPetBtn.addEventListener('click', openPetModal);
    }
    
    // 绑定表单提交事件
    const petForm = document.getElementById('petForm');
    if (petForm) {
        petForm.addEventListener('submit', savePetProfile);
    }
}

// 打开宠物档案模态框
function openPetModal() {
    console.log("打开宠物档案模态框");
    const modal = document.getElementById('petFormModal');
    if (modal) {
        resetPetForm();
        document.getElementById('petFormTitle').textContent = '添加宠物档案';
        modal.style.display = 'block';
        
        // 添加body类防止滚动
        document.body.classList.add('modal-open');
    } else {
        console.error("找不到模态框元素");
    }
}

// 关闭宠物档案模态框
function closePetModal() {
    const modal = document.getElementById('petFormModal');
    if (modal) {
        modal.style.display = 'none';
        
        // 移除body类，恢复滚动
        document.body.classList.remove('modal-open');
    }
}

// 重置宠物表单
function resetPetForm() {
    const form = document.getElementById('petForm');
    if (form) {
        form.reset();
        document.getElementById('petId').value = '';
        
        // 重置头像预览
        const avatarPreview = document.getElementById('petAvatarPreview');
        if (avatarPreview) {
            // 移除可能存在的图片
            const existingImg = avatarPreview.querySelector('img');
            if (existingImg) {
                existingImg.remove();
            }
            // 显示默认图标
            const icon = document.createElement('i');
            icon.className = 'fas fa-paw';
            avatarPreview.innerHTML = '';
            avatarPreview.appendChild(icon);
        }
        
        // 重置动态添加的记录
        resetDynamicRecords('vaccineRecords');
        resetDynamicRecords('dewormRecords');
        resetDynamicRecords('medicalRecords');
    }
}

// 完全重新实现的宠物照片处理功能
function previewPetAvatar(input) {
    console.log('预览宠物照片函数被调用');
    
    // 获取宠物照片预览容器和状态显示
    const preview = document.getElementById('petAvatarPreview');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (!preview) {
        console.error('未找到预览容器');
        return;
    }
    
    // 移除可能存在的所有备用上传按钮
    document.querySelectorAll('.upload-avatar-btn').forEach(btn => {
        if (btn.textContent === '使用备用上传方式') {
            btn.remove();
        }
    });
    
    // 显示加载状态
    if (uploadStatus) {
        uploadStatus.textContent = "正在处理照片...";
        uploadStatus.style.color = "#a044ff";
    }
    
    preview.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fas fa-spinner fa-spin" style="font-size:30px; color:#a044ff;"></i></div>';
    
    // 如果文件已选择
    if (input.files && input.files[0]) {
        const file = input.files[0];
        console.log('已选择文件:', file.name, '大小:', (file.size / 1024).toFixed(2) + 'KB', '类型:', file.type);
        
        // 使用FileReader读取文件内容
        const reader = new FileReader();
        
        // 读取完成后的回调
        reader.onload = function(e) {
            try {
                console.log('文件读取成功，长度:', e.target.result.length);
                
                // 直接显示图片预览
                preview.innerHTML = '';
                
                // 创建图片元素
                const img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.alt = '宠物照片';
                
                // 使用FileReader的结果作为图片源
                img.src = e.target.result;
                preview.appendChild(img);
                
                // 添加图片加载事件
                img.onload = function() {
                    console.log('图片加载成功');
                    if (uploadStatus) {
                        uploadStatus.textContent = "照片已上传成功";
                        uploadStatus.style.color = "#10B981";
                    }
                };
                
                // 添加图片加载失败事件
                img.onerror = function(err) {
                    console.error('图片加载失败', err);
                    preview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
                    if (uploadStatus) {
                        uploadStatus.textContent = "图片格式可能不支持，请尝试其他图片";
                        uploadStatus.style.color = "#EF4444";
                    }
                };
            } catch (error) {
                console.error('处理图片预览时出错:', error);
                preview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
                if (uploadStatus) {
                    uploadStatus.textContent = "处理图片出错，请重试";
                    uploadStatus.style.color = "#EF4444";
                }
            }
        };
        
        // 读取错误处理
        reader.onerror = function(e) {
            console.error('读取文件时出错:', e);
            preview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
            if (uploadStatus) {
                uploadStatus.textContent = "读取文件失败，请重试";
                uploadStatus.style.color = "#EF4444";
            }
        };
        
        // 以DataURL形式读取文件
        try {
            reader.readAsDataURL(file);
        } catch (e) {
            console.error('读取文件异常:', e);
            preview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
            if (uploadStatus) {
                uploadStatus.textContent = "读取文件异常，请重试";
                uploadStatus.style.color = "#EF4444";
            }
        }
    } else {
        console.log('未选择文件');
        preview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
        if (uploadStatus) {
            uploadStatus.textContent = "请选择一张宠物照片";
            uploadStatus.style.color = "#EF4444";
        }
    }
}

// 简化的保存宠物档案函数
function savePetProfile(event) {
    event.preventDefault();
    console.log('正在保存宠物档案...');
    
    // 获取表单数据
    const petId = document.getElementById('petId').value;
    const petName = document.getElementById('petName').value;
    const petType = document.getElementById('petType').value;
    const petGender = document.getElementById('petGender').value;
    const petNeutered = document.getElementById('petNeutered').value;
    const petBirthday = document.getElementById('petBirthday').value;
    const petAge = document.getElementById('petAge').value;
    const petWeight = document.getElementById('petWeight').value;
    const petNotes = document.getElementById('petNotes').value;
    
    // 表单验证
    if (!petName || !petType) {
        showToast('请填写必填字段');
        return;
    }
    
    // 获取头像数据
    const avatarPreview = document.getElementById('petAvatarPreview');
    let avatarData = '';
    
    if (avatarPreview) {
        const img = avatarPreview.querySelector('img');
        if (img) {
            console.log('找到图片元素，准备保存图片数据');
            try {
                avatarData = img.src;
                console.log('获取到图片数据，长度:', avatarData.length);
            } catch (e) {
                console.error('获取图片数据时出错:', e);
                avatarData = '';
            }
        } else {
            console.log('未找到图片元素，不保存图片数据');
        }
    }
    
    // 收集其他数据
    const foodAllergy = document.getElementById('foodAllergy')?.value || '';
    const medicineAllergy = document.getElementById('medicineAllergy')?.value || '';
    const environmentAllergy = document.getElementById('environmentAllergy')?.value || '';
    const vaccineRecords = collectDynamicRecords('vaccineRecords', 'vaccine') || [];
    const dewormRecords = collectDynamicRecords('dewormRecords', 'deworm') || [];
    const medicalRecords = collectDynamicRecords('medicalRecords', 'medical') || [];
    
    // 获取现有宠物档案
    let petProfiles = [];
    try {
        petProfiles = JSON.parse(localStorage.getItem(PET_PROFILES_KEY) || '[]');
    } catch (e) {
        console.error('解析本地存储数据失败:', e);
        petProfiles = [];
    }
    
    // 创建宠物对象
    const pet = {
        id: petId || Date.now().toString(),
        name: petName,
        type: petType,
        avatar: avatarData,
        birthday: petBirthday || '',
        age: petAge || '',
        gender: petGender || '',
        neutered: petNeutered || '',
        weight: petWeight || '',
        notes: petNotes || '',
        allergies: {
            food: foodAllergy,
            medicine: medicineAllergy,
            environment: environmentAllergy
        },
        vaccines: vaccineRecords,
        deworms: dewormRecords,
        medicalHistory: medicalRecords,
        createTime: petId ? undefined : new Date().toISOString(),
        updateTime: new Date().toISOString()
    };
    
    // 单独保存一个无头像版本的宠物对象，确保基本数据能保存
    const petWithoutAvatar = {...pet};
    delete petWithoutAvatar.avatar;
    
    // 更新或添加宠物档案
    if (petId) {
        // 更新现有宠物档案
        const index = petProfiles.findIndex(p => p.id === petId);
        if (index !== -1) {
            // 保留创建时间
            pet.createTime = petProfiles[index].createTime;
            
            // 如果没有上传新头像，保留原有头像
            if (!avatarData && petProfiles[index].avatar) {
                pet.avatar = petProfiles[index].avatar;
            }
            
            petProfiles[index] = pet;
        }
    } else {
        // 添加新宠物档案
        petProfiles.push(pet);
    }
    
    try {
        // 先尝试保存完整数据（包括头像）
        console.log('尝试保存完整宠物档案数据，包括头像');
        localStorage.setItem(PET_PROFILES_KEY, JSON.stringify(petProfiles));
        
        // 关闭模态框
        closePetModal();
        
        // 显示提示
        showToast(petId ? '宠物档案已更新' : '宠物档案已创建');
        
        // 更新UI
        displayPetProfiles();
    } catch (e) {
        console.error('保存完整宠物档案失败，尝试保存无头像版本:', e);
        
        try {
            // 从所有档案中移除头像数据
            petProfiles.forEach(p => {
                delete p.avatar;
            });
            
            // 重新尝试保存
            localStorage.setItem(PET_PROFILES_KEY, JSON.stringify(petProfiles));
            
            // 关闭模态框
            closePetModal();
            
            // 显示提示
            showToast('宠物档案已保存（无头像）');
            
            // 更新UI
            displayPetProfiles();
        } catch (e2) {
            console.error('保存无头像版本也失败:', e2);
            showToast('保存档案失败，请重试');
        }
    }
}

// 显示宠物档案列表函数
function displayPetProfiles() {
    const petProfileList = document.getElementById('petProfileList');
    if (!petProfileList) return;
    
    // 获取宠物档案数据
    let petProfiles = [];
    try {
        petProfiles = JSON.parse(localStorage.getItem(PET_PROFILES_KEY) || '[]');
        console.log('获取到宠物档案数据:', petProfiles.length, '条记录');
    } catch (e) {
        console.error('解析宠物档案数据失败:', e);
        petProfiles = [];
    }
    
    // 清空列表
    petProfileList.innerHTML = '';
    
    // 显示空列表提示或宠物档案
    if (!petProfiles.length) {
        petProfileList.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-paw"></i>
                <p>您还没有添加宠物档案</p>
                <p>点击上方"新建宠物档案"按钮开始创建</p>
            </div>
        `;
        return;
    }
    
    // 为每个宠物创建档案卡片
    petProfiles.forEach(pet => {
        try {
            // 创建宠物卡片元素
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.dataset.petId = pet.id;
            
            // 宠物类型图标
            let typeIcon = 'fa-paw';
            if (pet.type === 'dog') typeIcon = 'fa-dog';
            else if (pet.type === 'cat') typeIcon = 'fa-cat';
            
            // 性别图标
            let genderIcon = '';
            let genderClass = '';
            if (pet.gender === '公') {
                genderIcon = 'fa-mars';
                genderClass = 'male';
            } else if (pet.gender === '母') {
                genderIcon = 'fa-venus';
                genderClass = 'female';
            }
            
            // 宠物头像HTML
            let avatarHtml = '';
            
            // 简化版的头像处理 - 只显示默认图标
            avatarHtml = `<div class="pet-card-avatar" style="background:linear-gradient(135deg, #6a3093, #a044ff);"><i class="fas ${typeIcon}" style="font-size:30px; color:white;"></i></div>`;
            
            // 如果有有效的头像数据，尝试显示
            if (pet.avatar && pet.avatar.startsWith('data:image')) {
                // 在卡片加载后再添加图片，避免立即加载导致的问题
                setTimeout(() => {
                    try {
                        const avatarContainer = petCard.querySelector('.pet-card-avatar');
                        if (avatarContainer) {
                            const img = document.createElement('img');
                            img.src = pet.avatar;
                            img.alt = pet.name;
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = 'inherit';
                            
                            img.onload = function() {
                                avatarContainer.innerHTML = '';
                                avatarContainer.appendChild(img);
                            };
                            
                            img.onerror = function() {
                                console.error(`宠物${pet.name}的头像加载失败`);
                            };
                        }
                    } catch (e) {
                        console.error('加载宠物头像失败:', e);
                    }
                }, 100);
            }
            
            // 宠物年龄显示
            let ageDisplay = pet.age ? `${pet.age}岁` : '未知';
            
            // 构建卡片HTML
            petCard.innerHTML = `
                <div class="pet-card-header">
                    ${avatarHtml}
                    <div class="pet-info">
                        <h3 class="pet-name">${pet.name} ${genderIcon ? `<i class="fas ${genderIcon} ${genderClass}"></i>` : ''}</h3>
                        <p class="pet-type">${getTypeName(pet.type)}</p>
                    </div>
                </div>
                <div class="pet-actions">
                    <button class="edit-pet-btn" onclick="editPet('${pet.id}')"><i class="fas fa-edit"></i> 编辑</button>
                    <button class="delete-pet-btn" onclick="deletePet('${pet.id}')"><i class="fas fa-trash"></i> 删除</button>
                </div>
                <div class="pet-card-body">
                    <div class="pet-detail-grid">
                        <div class="pet-detail">
                            <span class="detail-label">年龄：</span>
                            <span class="detail-value">${ageDisplay}</span>
                        </div>
                        <div class="pet-detail">
                            <span class="detail-label">性别：</span>
                            <span class="detail-value">${pet.gender || '未知'}</span>
                        </div>
                        <div class="pet-detail">
                            <span class="detail-label">体重：</span>
                            <span class="detail-value">${pet.weight ? `${pet.weight}kg` : '未知'}</span>
                        </div>
                        <div class="pet-detail">
                            <span class="detail-label">绝育：</span>
                            <span class="detail-value">${pet.neutered || '未知'}</span>
                        </div>
                    </div>
                </div>
                <div class="pet-card-footer">
                    ${pet.notes ? `
                        <div class="pet-notes">
                            <span class="notes-label">备注：</span>
                            <p class="notes-content">${pet.notes}</p>
                        </div>
                    ` : ''}
                    
                    <!-- 疫苗接种记录 -->
                    ${pet.vaccines && pet.vaccines.length > 0 ? `
                        <div class="pet-records">
                            <h4 class="records-title">疫苗接种记录</h4>
                            <div class="records-list">
                                ${pet.vaccines.map(vaccine => `
                                    <div class="record-item">
                                        <div class="record-type">${vaccine.type || '未知疫苗'}</div>
                                        <div class="record-date">接种日期: ${vaccine.date || '未记录'}</div>
                                        ${vaccine.nextDate ? `<div class="record-next">下次接种: ${vaccine.nextDate}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 驱虫记录 -->
                    ${pet.deworms && pet.deworms.length > 0 ? `
                        <div class="pet-records">
                            <h4 class="records-title">驱虫记录</h4>
                            <div class="records-list">
                                ${pet.deworms.map(deworm => `
                                    <div class="record-item">
                                        <div class="record-type">${deworm.type || '未知类型'} ${deworm.medicine ? `- ${deworm.medicine}` : ''}</div>
                                        <div class="record-date">使用日期: ${deworm.date || '未记录'}</div>
                                        ${deworm.cycle ? `<div class="record-cycle">周期: ${deworm.cycle}天</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 既往病史 -->
                    ${pet.medicalHistory && pet.medicalHistory.length > 0 ? `
                        <div class="pet-records">
                            <h4 class="records-title">既往病史</h4>
                            <div class="records-list">
                                ${pet.medicalHistory.map(record => `
                                    <div class="record-item">
                                        <div class="record-type">${record.disease || '未知疾病'}</div>
                                        <div class="record-date">确诊日期: ${record.date || '未记录'}</div>
                                        ${record.result ? `<div class="record-result">治疗结果: ${record.result}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
            </div>
        `;
            
            // 添加到列表
            petProfileList.appendChild(petCard);
        } catch (e) {
            console.error('创建宠物卡片出错:', e);
        }
    });
}

// 获取宠物类型名称
function getTypeName(type) {
    switch(type) {
        case 'dog': return '狗';
        case 'cat': return '猫';
        case 'other': return '其他宠物';
        default: return type;
    }
}

// 编辑宠物档案 - 修复头像预览问题
function editPet(petId) {
    // 获取宠物档案
    const petProfiles = JSON.parse(localStorage.getItem(PET_PROFILES_KEY) || '[]');
    const pet = petProfiles.find(p => p.id === petId);
    
    if (pet) {
        // 填充基本信息
        document.getElementById('petId').value = pet.id;
        document.getElementById('petName').value = pet.name;
        document.getElementById('petType').value = pet.type;
        document.getElementById('petBirthday').value = pet.birthday || '';
        document.getElementById('petAge').value = pet.age || '';
        document.getElementById('petGender').value = pet.gender || '';
        document.getElementById('petNeutered').value = pet.neutered || '';
        document.getElementById('petWeight').value = pet.weight || '';
        document.getElementById('petNotes').value = pet.notes || '';
        
        // 填充头像 - 增强错误处理
        const avatarPreview = document.getElementById('petAvatarPreview');
        if (avatarPreview && pet.avatar && pet.avatar.startsWith('data:image')) {
            console.log('填充宠物头像');
            
            // 清空预览容器
            avatarPreview.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fas fa-spinner fa-spin" style="font-size:30px; color:#a044ff;"></i></div>';
            
            // 创建图片元素并测试加载
            const img = new Image();
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.alt = pet.name;
            
            // 图片加载成功回调
            img.onload = function() {
                console.log('编辑模式：头像加载成功');
                avatarPreview.innerHTML = '';
                avatarPreview.appendChild(img);
            };
            
            // 图片加载失败回调
            img.onerror = function() {
                console.error('编辑模式：头像加载失败');
                avatarPreview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
                
                // 清除无效的头像数据
                const uploadStatus = document.getElementById('uploadStatus');
                if (uploadStatus) {
                    uploadStatus.textContent = "原头像无法显示，请重新上传";
                    uploadStatus.style.color = "#f97316";
                }
            };
            
            // 设置图片源
            img.src = pet.avatar;
        } else if (avatarPreview) {
            // 默认图标
            avatarPreview.innerHTML = '<i class="fas fa-paw" style="font-size:40px; color:#a044ff;"></i>';
        }
        
        // 填充过敏原信息
        if (pet.allergies) {
            document.getElementById('foodAllergy').value = pet.allergies.food || '';
            document.getElementById('medicineAllergy').value = pet.allergies.medicine || '';
            document.getElementById('environmentAllergy').value = pet.allergies.environment || '';
        }
        
        // 填充疫苗记录
        fillDynamicRecords('vaccineRecords', pet.vaccines, 'vaccine');
        
        // 填充驱虫记录
        fillDynamicRecords('dewormRecords', pet.deworms, 'deworm');
        
        // 填充病史记录
        fillDynamicRecords('medicalRecords', pet.medicalHistory, 'medical');
        
        // 更新标题
        document.getElementById('petFormTitle').textContent = '编辑宠物档案';
        
        // 打开模态框
        openPetModal();
    }
}

// 删除宠物档案
function deletePet(petId) {
    if (confirm('确定要删除这个宠物档案吗？此操作不可恢复。')) {
        // 获取宠物档案
        let petProfiles = JSON.parse(localStorage.getItem(PET_PROFILES_KEY) || '[]');
        
        // 过滤掉要删除的宠物
        petProfiles = petProfiles.filter(pet => pet.id !== petId);
        
        // 保存到本地存储
        localStorage.setItem(PET_PROFILES_KEY, JSON.stringify(petProfiles));
        
        // 更新UI
        displayPetProfiles();
        
        // 显示提示
        showToast('宠物档案已删除');
    }
}

// 添加疫苗记录
function addVaccineRecord() {
    const container = document.getElementById('vaccineRecords');
    if (container) {
        const newRecord = document.createElement('div');
        newRecord.className = 'vaccine-record';
        newRecord.innerHTML = `
            <div class="form-row">
                <div class="form-group third">
                    <label>疫苗类型</label>
                    <input type="text" name="vaccineType[]" placeholder="疫苗类型">
                </div>
                <div class="form-group third">
                    <label>接种日期</label>
                    <input type="date" name="vaccineDate[]">
                </div>
                <div class="form-group third">
                    <label>下次提醒日期</label>
                    <input type="date" name="vaccineNextDate[]">
                </div>
            </div>
            <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(newRecord);
    }
}

// 添加驱虫记录
function addDewormRecord() {
    const container = document.getElementById('dewormRecords');
    if (container) {
        const newRecord = document.createElement('div');
        newRecord.className = 'deworm-record';
        newRecord.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>驱虫类型</label>
                    <select name="dewormType[]">
                        <option value="">请选择</option>
                        <option value="内驱">内驱</option>
                        <option value="外驱">外驱</option>
                        <option value="内外驱">内外驱</option>
                    </select>
                </div>
                <div class="form-group half">
                    <label>药物名称</label>
                    <input type="text" name="dewormMedicine[]" placeholder="药物名称">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label>使用日期</label>
                    <input type="date" name="dewormDate[]">
                </div>
                <div class="form-group half">
                    <label>下次周期(天)</label>
                    <input type="number" name="dewormCycle[]" min="0" placeholder="周期天数">
                </div>
            </div>
            <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(newRecord);
    }
}

// 添加病史记录
function addMedicalRecord() {
    const container = document.getElementById('medicalRecords');
    if (container) {
        const newRecord = document.createElement('div');
        newRecord.className = 'medical-record';
        newRecord.innerHTML = `
            <div class="form-row">
                <div class="form-group half">
                    <label>疾病名称</label>
                    <input type="text" name="diseaseName[]" placeholder="疾病名称">
                </div>
                <div class="form-group half">
                    <label>确诊日期</label>
                    <input type="date" name="diagnosisDate[]">
                </div>
            </div>
            <div class="form-group">
                <label>治疗结果</label>
                <textarea name="treatmentResult[]" rows="2" placeholder="治疗结果描述"></textarea>
            </div>
            <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(newRecord);
    }
}

// 移除记录
function removeRecord(button) {
    const record = button.parentElement;
    record.parentElement.removeChild(record);
}

// 重置动态记录
function resetDynamicRecords(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // 保留第一个记录，清空其内容
        const firstRecord = container.firstElementChild;
        if (firstRecord) {
            const inputs = firstRecord.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.value = '');
            
            // 移除其他记录
            while (container.children.length > 1) {
                container.removeChild(container.lastElementChild);
            }
        }
    }
}

// 收集动态记录数据
function collectDynamicRecords(containerId, type) {
    const records = [];
    const container = document.getElementById(containerId);
    if (!container) return records;
    
    // 根据记录类型收集数据
    if (type === 'vaccine') {
        const types = container.querySelectorAll('input[name="vaccineType[]"]');
        const dates = container.querySelectorAll('input[name="vaccineDate[]"]');
        const nextDates = container.querySelectorAll('input[name="vaccineNextDate[]"]');
        
        for (let i = 0; i < types.length; i++) {
            if (types[i].value) {
                records.push({
                    type: types[i].value,
                    date: dates[i].value,
                    nextDate: nextDates[i].value
                });
            }
        }
    } else if (type === 'deworm') {
        const types = container.querySelectorAll('select[name="dewormType[]"]');
        const medicines = container.querySelectorAll('input[name="dewormMedicine[]"]');
        const dates = container.querySelectorAll('input[name="dewormDate[]"]');
        const cycles = container.querySelectorAll('input[name="dewormCycle[]"]');
        
        for (let i = 0; i < types.length; i++) {
            if (types[i].value || medicines[i].value) {
                records.push({
                    type: types[i].value,
                    medicine: medicines[i].value,
                    date: dates[i].value,
                    cycle: cycles[i].value
                });
            }
        }
    } else if (type === 'medical') {
        const names = container.querySelectorAll('input[name="diseaseName[]"]');
        const dates = container.querySelectorAll('input[name="diagnosisDate[]"]');
        const results = container.querySelectorAll('textarea[name="treatmentResult[]"]');
        
        for (let i = 0; i < names.length; i++) {
            if (names[i].value) {
                records.push({
                    name: names[i].value,
                    date: dates[i].value,
                    result: results[i].value
                });
            }
        }
    }
    
    return records;
}

// 填充动态记录
function fillDynamicRecords(containerId, records, type) {
    const container = document.getElementById(containerId);
    if (!container || !records || !records.length) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 根据记录类型填充数据
    if (type === 'vaccine') {
        records.forEach(record => {
            const elem = document.createElement('div');
            elem.className = 'vaccine-record';
            elem.innerHTML = `
                <div class="form-row">
                    <div class="form-group third">
                        <label>疫苗类型</label>
                        <input type="text" name="vaccineType[]" value="${record.type || ''}" placeholder="疫苗类型">
                    </div>
                    <div class="form-group third">
                        <label>接种日期</label>
                        <input type="date" name="vaccineDate[]" value="${record.date || ''}">
                    </div>
                    <div class="form-group third">
                        <label>下次提醒日期</label>
                        <input type="date" name="vaccineNextDate[]" value="${record.nextDate || ''}">
                    </div>
                </div>
                <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(elem);
        });
    } else if (type === 'deworm') {
        records.forEach(record => {
            const elem = document.createElement('div');
            elem.className = 'deworm-record';
            elem.innerHTML = `
                <div class="form-row">
                    <div class="form-group half">
                        <label>驱虫类型</label>
                        <select name="dewormType[]">
                            <option value="" ${!record.type ? 'selected' : ''}>请选择</option>
                            <option value="内驱" ${record.type === '内驱' ? 'selected' : ''}>内驱</option>
                            <option value="外驱" ${record.type === '外驱' ? 'selected' : ''}>外驱</option>
                            <option value="内外驱" ${record.type === '内外驱' ? 'selected' : ''}>内外驱</option>
                        </select>
                    </div>
                    <div class="form-group half">
                        <label>药物名称</label>
                        <input type="text" name="dewormMedicine[]" value="${record.medicine || ''}" placeholder="药物名称">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group half">
                        <label>使用日期</label>
                        <input type="date" name="dewormDate[]" value="${record.date || ''}">
                    </div>
                    <div class="form-group half">
                        <label>下次周期(天)</label>
                        <input type="number" name="dewormCycle[]" min="0" value="${record.cycle || ''}" placeholder="周期天数">
                    </div>
                </div>
                <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(elem);
        });
    } else if (type === 'medical') {
        records.forEach(record => {
            const elem = document.createElement('div');
            elem.className = 'medical-record';
            elem.innerHTML = `
                <div class="form-row">
                    <div class="form-group half">
                        <label>疾病名称</label>
                        <input type="text" name="diseaseName[]" value="${record.name || ''}" placeholder="疾病名称">
                    </div>
                    <div class="form-group half">
                        <label>确诊日期</label>
                        <input type="date" name="diagnosisDate[]" value="${record.date || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>治疗结果</label>
                    <textarea name="treatmentResult[]" rows="2" placeholder="治疗结果描述">${record.result || ''}</textarea>
                </div>
                <button type="button" class="remove-record-btn" onclick="removeRecord(this)"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(elem);
        });
    }
    
    // 如果没有记录，添加一个空记录
    if (container.children.length === 0) {
        if (type === 'vaccine') addVaccineRecord();
        else if (type === 'deworm') addDewormRecord();
        else if (type === 'medical') addMedicalRecord();
    }
}

// 显示提示消息
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'toast show';
        
        // 3秒后隐藏提示
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
}

// 初始化聊天功能
function initChat() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chat-history');
    const chatLoader = document.getElementById('chatLoader');
    
    if (!userInput || !sendButton) {
        console.error('聊天界面元素未找到');
        return;
    }
    
    console.log('初始化聊天功能');
    
    // 处理发送按钮点击事件
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    
    // 处理输入框回车事件
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 发送消息的函数
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 清空输入框
        userInput.value = '';
        
        // 添加用户消息到聊天历史
        addMessage('user', message);
        
        // 显示加载动画
        chatLoader.style.display = 'flex';
        
        // 模拟发送到服务器
        setTimeout(() => {
            // 模拟AI回复
            const responses = [
                "根据您描述的情况，这可能是轻微的呼吸道感染。建议保持环境通风，多让宠物饮水，观察2-3天。如果症状加重，应立即就医。",
                "您好，听起来可能是消化问题导致的症状。请注意宠物的饮食，暂时给予清淡易消化的食物，避免油腻。如果呕吐继续，建议咨询兽医。",
                "这些症状可能与季节性过敏有关。建议减少外出时间，保持室内清洁，使用温水清洗宠物的爪子和腹部。如果皮肤出现红肿或搔抓加剧，请就医检查。",
                "您好，这可能是由于饮食变化或摄入不适当食物导致的。建议24小时内少量多餐，确保饮水充足，观察大便情况。如果腹泻持续超过两天，应就医检查。"
            ];
            
            // 随机选择一个回复
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // 隐藏加载动画
            chatLoader.style.display = 'none';
            
            // 添加AI回复到聊天历史
            addMessage('ai', randomResponse);
            
            // 滚动到底部
            scrollToBottom();
        }, 1500);
    }
    
    // 添加消息到聊天历史
    function addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;
        
        if (type === 'ai') {
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = '🐾';
            messageDiv.appendChild(avatar);
        }
        
        messageDiv.appendChild(bubble);
        chatHistory.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// 初始化常见症状指引
function initSymptomGuide() {
    const guideButtons = document.querySelectorAll('.guide-btn');
    const userInput = document.getElementById('user-input');
    
    if (!guideButtons.length || !userInput) return;
    
    guideButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const symptom = btn.dataset.symptom;
            let template = '';
            
            switch(symptom) {
                case 'vomit':
                    template = '我的宠物今天呕吐了两次，没有食欲，精神状态也不太好，这是怎么回事？';
                    break;
                case 'diarrhea':
                    template = '我家猫咪最近腹泻，大便有点稀，但精神状态还行，应该如何处理？';
                    break;
                case 'skin':
                    template = '我的狗狗最近总是抓挠身体，皮肤有点发红，是不是有皮肤病？';
                    break;
                default:
                    template = '';
            }
            
            userInput.value = template;
            userInput.focus();
        });
    });
}

// 初始化所有检测模块
function initDetectionModules() {
    // 定义所有检测类型
    const detectionTypes = ['breed', 'oral', 'skin', 'eye', 'excrement', 'vomit', 'ear'];
    
    // 为每个检测类型初始化上传功能
    detectionTypes.forEach(type => {
        // 品种识别模块由breed-detection-new.js处理，跳过品种识别模块的初始化
        if (type === 'breed') {
            console.log('品种识别模块由breed-detection-new.js处理');
            return;
        }
        
        const moduleId = `${type}Module`;
        const formId = `${type}Form`;
        const fileUploadId = `${type}FileUpload`;
        const submitBtnId = `${type}SubmitBtn`;
        
        const form = document.getElementById(formId);
        const fileUpload = document.getElementById(fileUploadId);
        const submitBtn = document.getElementById(submitBtnId);
        const uploadArea = document.querySelector(`#${moduleId} .uploadDropArea`);
        const module = document.getElementById(moduleId);
        
        if (module) {
            console.log(`初始化${type}检测模块...`);
            
            // 确保模块内容可见
            const ensureModuleVisible = () => {
                // 确保提交按钮可见
                if (submitBtn) {
                    submitBtn.style.cssText = `
                        display: block !important; 
                        visibility: visible !important; 
                        opacity: 1 !important;
                        position: relative !important; 
                        z-index: 1000 !important; 
                        width: 100% !important; 
                        padding: 16px 0 !important;
                        background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%) !important; 
                        color: white !important; 
                        font-size: 18px !important; 
                        font-weight: bold !important;
                        border: none !important; 
                        border-radius: 10px !important; 
                        cursor: pointer !important; 
                        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
                        margin: 10px auto !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 10px !important;
                    `;
                }
                
                // 确保功能开发中提示可见
                const devNotice = module.querySelector('p[style*="功能开发中"]');
                if (devNotice) {
                    devNotice.style.cssText = `
                        color: rgba(255, 255, 255, 0.7) !important;
                        text-align: center !important;
                        font-size: 16px !important;
                        margin: 15px 0 0 !important;
                        position: relative !important;
                        z-index: 1 !important;
                        font-weight: bold !important;
                        display: block !important;
                    `;
                }
            };
            
            // 立即执行一次确保可见
            ensureModuleVisible();
            
            // 每次切换到该模块时确保内容可见
            document.querySelectorAll('.nav-tabs .nav-item').forEach(tab => {
                if (tab.dataset.tab === type) {
                    tab.addEventListener('click', () => {
                        setTimeout(ensureModuleVisible, 100);
                    });
                }
            });
            
            // 如果有上传区域，初始化上传功能
            if (form && fileUpload && submitBtn && uploadArea) {
                // 点击上传区域触发文件选择
                uploadArea.addEventListener('click', () => {
                    fileUpload.click();
                });
                
                // 拖拽上传功能
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#8B5CF6';
                    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                });
                
                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.style.borderColor = 'rgba(138, 92, 246, 0.5)';
                    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = 'rgba(138, 92, 246, 0.5)';
                    uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    
                    if (e.dataTransfer.files.length) {
                        fileUpload.files = e.dataTransfer.files;
                        // 显示文件名
                        let fileName = e.dataTransfer.files[0].name;
                        const fileNameDisplay = document.createElement('p');
                        fileNameDisplay.textContent = `已选择: ${fileName}`;
                        fileNameDisplay.style.color = '#10B981';
                        fileNameDisplay.style.marginTop = '10px';
                        
                        // 删除之前的文件名显示
                        const prevFileNames = uploadArea.querySelectorAll('p:not(:first-child)');
                        prevFileNames.forEach(el => el.remove());
                        
                        uploadArea.appendChild(fileNameDisplay);
                    }
                });
                
                // 文件选择变化
                fileUpload.addEventListener('change', () => {
                    if (fileUpload.files.length) {
                        // 显示文件名
                        let fileName = fileUpload.files[0].name;
                        const fileNameDisplay = document.createElement('p');
                        fileNameDisplay.textContent = `已选择: ${fileName}`;
                        fileNameDisplay.style.color = '#10B981';
                        fileNameDisplay.style.marginTop = '10px';
                        
                        // 删除之前的文件名显示
                        const prevFileNames = uploadArea.querySelectorAll('p:not(:first-child)');
                        prevFileNames.forEach(el => el.remove());
                        
                        uploadArea.appendChild(fileNameDisplay);
                    }
                });
                
                // 提交按钮点击事件
                submitBtn.addEventListener('click', () => {
                    // 如果没有选择文件
                    if (!fileUpload.files.length) {
                        alert('请先选择图片文件');
                        return;
                    }
                    
                    // 创建FormData并提交到后端
                    const formData = new FormData();
                    formData.append('file', fileUpload.files[0]);
                    formData.append('detection_type', type);
                    
                    // 显示加载状态
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i><span>分析中...</span>';
                    submitBtn.disabled = true;
                    
                    // 发送请求
                    fetch('/predict', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`分析请求失败: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(`${type}分析成功，接收到数据:`, data);
                        
                        // 恢复按钮状态
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        
                        // 显示结果
                        try {
                            // 创建或更新结果显示区域
                            let resultContainer = document.querySelector(`#${moduleId} .result-container`);
                            if (!resultContainer) {
                                resultContainer = document.createElement('div');
                                resultContainer.className = 'result-container';
                                resultContainer.style.cssText = `
                                    background: rgba(13, 18, 30, 0.75);
                                    border-radius: 20px;
                                    border: 1px solid rgba(138, 92, 246, 0.2);
                                    padding: 30px;
                                    margin-top: 30px;
                                    box-shadow: 0 8px 32px rgba(2, 4, 15, 0.2), 0 0 15px rgba(138, 92, 246, 0.1);
                                    backdrop-filter: blur(10px);
                                    position: relative;
                                    overflow: hidden;
                                    width: 100%;
                                `;
                                module.querySelector('.content-grid').appendChild(resultContainer);
                            }
                            
                            // 更新结果内容
                            resultContainer.innerHTML = `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    margin-bottom: 25px;
                                    position: relative;
                                    z-index: 1;
                                ">
                                    <div style="
                                        width: 44px;
                                        height: 44px;
                                        border-radius: 12px;
                                        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        margin-right: 15px;
                                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
                                    ">
                                        <i class="fas fa-check-circle" style="color: white; font-size: 20px;"></i>
                                    </div>
                                    <h3 style="
                                        font-size: 24px;
                                        font-weight: 600;
                                        color: white;
                                        margin: 0;
                                    ">分析结果</h3>
                                </div>
                                
                                <div style="
                                    display: flex;
                                    gap: 30px;
                                    margin-bottom: 30px;
                                ">
                                    <div style="
                                        flex: 1;
                                        background: rgba(0, 0, 0, 0.2);
                                        border-radius: 15px;
                                        padding: 20px;
                                        position: relative;
                                    ">
                                        <h4 style="
                                            font-size: 18px;
                                            color: white;
                                            margin: 0 0 15px;
                                        ">检测结果</h4>
                                        <p style="
                                            color: rgba(255, 255, 255, 0.8);
                                            margin: 0;
                                            line-height: 1.6;
                                            font-size: 16px;
                                        ">${data.result}</p>
                                    </div>
                                </div>
                                
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <p style="
                                        color: rgba(255, 255, 255, 0.4);
                                        font-size: 14px;
                                        margin: 0;
                                    ">分析完成时间: ${new Date().toLocaleString()}</p>
                                    <button class="share-btn" style="
                                        background: transparent;
                                        border: 1px solid rgba(138, 92, 246, 0.5);
                                        color: rgba(138, 92, 246, 0.9);
                                        padding: 8px 15px;
                                        border-radius: 8px;
                                        font-size: 14px;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        gap: 5px;
                                    ">
                                        <i class="fas fa-share-alt"></i>
                                        分享结果
                                    </button>
                                </div>
                            `;
                            
                            // 滚动到结果区域
                            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            
                            // 绑定分享按钮事件
                            const shareBtn = resultContainer.querySelector('.share-btn');
                            if (shareBtn) {
                                shareBtn.addEventListener('click', () => {
                                    alert('分享功能开发中，敬请期待！');
                                });
                            }
                            
                            console.log('结果显示成功');
                        } catch (error) {
                            console.error('显示结果时出错:', error);
                            alert('显示结果失败: ' + error.message);
                        }
                    })
                    .catch(error => {
                        console.error(`${type}分析错误:`, error);
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                        alert(`分析失败: ${error.message}`);
                    });
                });
            }
        }
    });
}

// 初始化关于我们页面的联系按钮
function initAboutPageContactButton() {
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            alert('感谢您的关注！请发送邮件至：contact@petai.com 与我们取得联系，或拨打客服热线：400-888-9999');
        });
    }
}