// 请求截图权限
if (!requestScreenCapture()) {
    toast('请求截图权限失败');
    exit();
}

// 检查悬浮窗权限
if (!floaty.checkPermission()) {
    toast('请授予悬浮窗权限');
    floaty.requestPermission();
    exit();
}

let window = floaty.window(
    <card h="200" w="100" cardCornerRadius="15dp" cardElevation="10dp" margin="4" cardBackgroundColor="#f5f5f5">
        <vertical padding="8">
            <button id="startBtn" text="🔛 开始" w="*" h="40" bg="#4CAF50" textColor="#ffffff" textSize="11sp" style="Widget.AppCompat.Button.Colored" layout_margin="2dp" />

            <button id="stopBtn" text="⏸️ 停止" w="*" h="40" bg="#f44336" textColor="#ffffff" textSize="11sp" style="Widget.AppCompat.Button.Colored" layout_margin="2dp" />

            <button id="resetBtn" text="🔁 重置" w="*" h="40" bg="#FF9800" textColor="#ffffff" textSize="11sp" style="Widget.AppCompat.Button.Colored" layout_margin="2dp" />

            <button id="closeBtn" text="❌ 关闭" w="*" h="40" bg="#9E9E9E" textColor="#ffffff" textSize="11sp" style="Widget.AppCompat.Button.Colored" layout_margin="2dp" />
        </vertical>
    </card>
);

window.setPosition(0, 200);

// 全局变量
let isRunning = false;
let mainThread = null;

let tabTip = '到店取';

let tip1_x = 0;

let tip1_y = 0;

let tip2_x = 0;

let tip2_y = 0;

let step = 1;

// 查找文字
function findText(results, buttonText) {
    let obj = { x: 0, y: 0 };

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

            obj.x = centerX;

            obj.y = centerY;
        }
    }

    return obj;
}

// 第一步
function step_1(results) {
    console.log('=== 步骤1: 寻找立即购买按钮 ===');

    // 查找目标文字
    let { x, y } = findText(results, '立即购买');

    if (x && y) {
        click(x, y);

        step = 2;
    } else {
        console.log(`未找到:立即购买`);
    }

    sleep(800);
}

// 第二步
function step_2(results) {
    console.log('=== 步骤2: 寻找确定按钮 ===');

    let { x, y } = findText(results, '确定');

    console.log(`确定按钮位置: ${x}, ${y}`);

    if (x && y) {
        click(x, y);

        step = 3;
    } else {
        if (tip1_x == 0 || tip1_y == 0 || tip2_x == 0 || tip2_y == 0) {
            const { x: x1, y: y1 } = findText(results, '送到家');

            const { x: x2, y: y2 } = findText(results, '到店取');

            tip1_x = x1;

            tip1_y = y1;

            tip2_x = x2;

            tip2_y = y2;
        }

        click(tip1_x, tip1_y);

        tabTip = '送到家';
    }
}

// 第三步
function step_3(results) {
    console.log('=== 步骤3: 寻找支付 ===');

    sleep(500);

    let { x, y } = findText(results, '就是这家');

    if (x && y) {
        click(x, y);

        const { x: x1, y: y1 } = findText(results, '确认信息并支付');

        click(x1, y1);
    }
}

// 主要脚本逻辑
function mainScript() {
    while (isRunning) {
        try {
            // 如果是送到家,直接跳过识图,节省时间
            if (step == 2 && tabTip == '送到家' && tip1_x !== 0 && tip1_y !== 0) {
                click(tip2_x, tip2_y);

                tabTip = '到店取';

                console.log('跳过识图');

                continue;
            }

            // 截取屏幕
            let img = captureScreen();
            if (!img) {
                console.log('截图失败');
                sleep(500);
                continue;
            }

            // 使用OCR识别文字
            let results = paddle.ocr(img);
            if (!results || results.length === 0) {
                console.log('OCR识别失败或未识别到文字');
                sleep(500);
                continue;
            }

            switch (step) {
                case 1:
                    step_1(results);
                    break;
                case 2:
                    step_2(results);
                    break;
                case 3:
                    step_3(results);
                    break;
            }
        } catch (e) {
            console.log('❌ 脚本执行出错: ' + e.message);
            console.error('脚本执行出错:', e);
            sleep(1000);
            // 出错后不直接停止，而是继续运行
        }
    }

    console.log('脚本已停止');
}

// 重置函数
function resetScript() {
    // 重置所有状态变量
    step = 1;
    tabTip = '到店取';
    tip1_x = 0;
    tip1_y = 0;
    tip2_x = 0;
    tip2_y = 0;

    console.log('脚本状态已重置');
    toast('脚本状态已重置');
}

// 开始按钮点击事件
window.startBtn.click(() => {
    if (!isRunning) {
        isRunning = true;
        console.log('🔛 脚本开始运行');
        toast('脚本开始运行');

        // 启动主脚本线程
        mainThread = threads.start(function () {
            mainScript();
        });

        // 更新按钮状态
        ui.run(() => {
            window.startBtn.setText('▶️ 运行中');
            window.startBtn.setBackgroundColor(colors.parseColor('#FF9800'));
        });
    } else {
        console.log('脚本已在运行中');
        toast('脚本已在运行中');
    }
});

// 停止按钮点击事件
window.stopBtn.click(() => {
    if (isRunning) {
        isRunning = false;

        // 停止主线程
        if (mainThread) {
            mainThread.interrupt();
            mainThread = null;
        }

        console.log('⏸️ 脚本已停止');
        toast('脚本已停止');

        // 更新按钮状态
        ui.run(() => {
            window.startBtn.setText('🔛 开始');
            window.startBtn.setBackgroundColor(colors.parseColor('#4CAF50'));
        });
    } else {
        console.log('脚本未在运行');
        toast('脚本未在运行');
    }
});

// 重置按钮点击事件
window.resetBtn.click(() => {
    // 如果正在运行，先停止
    if (isRunning) {
        isRunning = false;
        if (mainThread) {
            mainThread.interrupt();
            mainThread = null;
        }

        // 更新按钮状态
        ui.run(() => {
            window.startBtn.setText('🔛 开始');
            window.startBtn.setBackgroundColor(colors.parseColor('#4CAF50'));
        });
    }

    // 重置脚本状态
    resetScript();
});

// 关闭按钮点击事件
window.closeBtn.click(() => {
    // 停止脚本
    if (isRunning) {
        isRunning = false;
        if (mainThread) {
            mainThread.interrupt();
            mainThread = null;
        }
    }

    console.log('❌ 悬浮窗关闭');
    toast('悬浮窗已关闭');

    // 关闭悬浮窗
    window.close();
    exit();
});

// 脚本退出时清理资源
events.on('exit', () => {
    if (isRunning) {
        isRunning = false;
    }
    if (mainThread) {
        mainThread.interrupt();
    }
    if (window) {
        window.close();
    }
});

setInterval(() => {}, 1000);
