// autoX.js

// 请求截图权限
if (!requestScreenCapture()) {
    toast('请求截图权限失败');
    exit();
}

// 全局变量
let isRunning = true;

// 查找文字
function findText(results, buttonText) {
    for (let i = 0; i < results.length; i++) {
        let result = results[i];

        if (result.words == buttonText) {
            console.log(
                '文本：' + result.words,
                '相似度：' + result.confidence.toFixed(2),
                '范围：' + result.bounds,
                '左边：' + result.bounds.left,
                '顶边：' + result.bounds.top,
                '右边：' + result.bounds.right,
                '底边：' + result.bounds.bottom
            );

            let centerX = result.bounds.left + (result.bounds.right - result.bounds.left) / 2;
            let centerY = result.bounds.top + (result.bounds.bottom - result.bounds.top) / 2;

            return { x: centerX, y: centerY };
        }
    }

    return { x: 0, y: 0 };
}

// 使用OCR识别文字并点击的函数
function clickButtonByOCR(buttonText, buttonText2) {
    try {
        // 截取屏幕
        let img = captureScreen();
        if (!img) {
            console.log('截图失败');
            return 0;
        }

        // 使用OCR识别文字
        let results = paddle.ocr(img);
        if (!results || results.length === 0) {
            console.log('OCR识别失败或未识别到文字');
            return 0;
        }

        if (buttonText2) {
            const { x, y } = findText(results, buttonText2);

            if (x && y) {
                // 点击文字区域中心点
                click(x, y);

                return 3;
            }
        }

        // 查找目标文字
        const { x, y } = findText(results, buttonText);

        if (x && y) {
            // 点击文字区域中心点
            click(x, y);

            return 1;
        } else {
            console.log('未找到文字: ' + buttonText);
            return 2;
        }
    } catch (e) {
        console.log('OCR识别出错: ' + e.message);
        return 0;
    }
}

// 主要脚本逻辑
function mainScript() {
    let step = 1;

    while (isRunning) {
        try {
            if (step == 1) {
                console.log('=== 步骤1: 寻找立即购买按钮 ===');

                // 尝试寻找"立即购买"按钮
                let result = clickButtonByOCR('立即购买');

                switch (result) {
                    case 1:
                        step = 2;
                        console.log('✅ 成功进入步骤2');
                        break;
                    case 2:
                        // 未找到按钮，继续寻找
                        console.log('🔍 继续寻找预订/购买按钮...');
                        break;
                    case 0:
                        // OCR识别出错，等待重试
                        console.log('OCR识别出错，等待重试...');
                        break;
                }
            } else if (step == 2) {
                console.log('=== 步骤2: 寻找确认按钮 ===');

                // 尝试寻找"确认"按钮,并检查立即购买按钮是否消失
                let result = clickButtonByOCR('确认', '立即购买');

                switch (result) {
                    case 1:
                        step = 3;
                        console.log('✅ 成功进入步骤3 - 进入支付阶段');
                        break;
                    case 2:
                        console.log('🔍 继续寻找确认按钮...');
                        break;
                    case 3:
                        step = 1;
                        console.log('✅ 回退步骤1 - 点击立即购买按钮');
                        break;
                    case 0:
                        // OCR识别出错，等待重试
                        console.log('OCR识别出错，等待重试...');
                        break;
                }
            }

            sleep(300);
        } catch (e) {
            console.log('❌ 脚本执行出错: ' + e.message);
            console.error('脚本执行出错:', e);
            isRunning = false;
            break;
        }
    }

    console.log('脚本已停止');
}

mainScript();
