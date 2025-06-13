'ui';

// 请求悬浮窗权限
if (!floaty.checkPermission()) {
    toast('请授予悬浮窗权限');
    floaty.requestPermission();
    exit();
}

// 全局变量
let isRunning = false;
let mainThread = null;

// 创建悬浮窗布局
let window = floaty.window(
    <vertical bg="#88000000" padding="8" w="280">
        <horizontal>
            <text text="脚本控制" textColor="#ffffff" textSize="14sp" gravity="center" w="*" />
        </horizontal>
        <horizontal margin="4">
            <button id="startBtn" text="开始" w="60" h="40" textSize="12sp" bg="#4CAF50" />
            <button id="stopBtn" text="停止" w="60" h="40" textSize="12sp" bg="#FF5722" layout_marginLeft="4" />
            <button id="closeBtn" text="关闭" w="60" h="40" textSize="12sp" bg="#9E9E9E" layout_marginLeft="4" />
        </horizontal>
        <horizontal margin="4">
            <text text="当前状态:" textColor="#ffffff" textSize="12sp" />
        </horizontal>
        <ScrollView h="120" bg="#22000000" margin="4">
            <vertical>
                <text id="logText" text="等待开始..." textColor="#00FF00" textSize="11sp" padding="4" />
            </vertical>
        </ScrollView>
    </vertical>
);

// 设置悬浮窗初始位置
window.setPosition(100, 100);

// 开始按钮点击事件
window.startBtn.click(() => {
    if (!isRunning) {
        isRunning = true;
        updateLog('🚀 脚本开始运行');
        toast('脚本开始运行');

        // 在这里启动您的主要脚本逻辑
        mainThread = threads.start(function () {
            mainScript();
        });

        // 更新按钮状态
        ui.run(() => {
            if (window && window.startBtn) {
                window.startBtn.setText('运行中');
                window.startBtn.attr('bg', '#FFC107');
            }
        });
    } else {
        toast('脚本已在运行中');
    }
});

// 停止按钮点击事件
window.stopBtn.click(() => {
    if (isRunning) {
        isRunning = false;
        updateLog('⏹️ 脚本已手动停止');
        toast('脚本已停止');

        // 停止主线程
        if (mainThread) {
            mainThread.interrupt();
            mainThread = null;
        }

        // 更新按钮状态
        ui.run(() => {
            if (window && window.startBtn) {
                window.startBtn.setText('开始');
                window.startBtn.attr('bg', '#4CAF50');
            }
        });
    } else {
        toast('脚本未在运行');
    }
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

    // 关闭悬浮窗
    window.close();
    toast('悬浮窗已关闭');
    exit();
});

let step = 1;
let logMessages = [];

// 更新悬浮窗日志显示
function updateLog(message) {
    console.log(message);
    logMessages.push(new Date().toLocaleTimeString() + ': ' + message);

    // 保持最新的10条日志
    if (logMessages.length > 10) {
        logMessages.shift();
    }

    // 更新悬浮窗显示
    ui.run(() => {
        if (window && window.logText) {
            window.logText.setText(logMessages.join('\n'));
        }
    });
}

// 简化的点击函数 - 点击后检查按钮是否消失
function clickButton(buttonText) {
    let btn = text(buttonText).findOne(1000);
    if (btn) {
        updateLog('点击按钮: ' + buttonText);
        btn.click();

        // 短暂等待让点击生效
        sleep(300);

        // 检查按钮是否还存在
        let checkBtn = text(buttonText).findOne(500);
        if (!checkBtn) {
            updateLog(buttonText + ' 按钮已消失，页面已跳转');
            return true;
        } else {
            updateLog(buttonText + ' 按钮仍存在，点击未生效');
            return false;
        }
    } else {
        updateLog('未找到按钮: ' + buttonText);
        return null; // 返回null表示按钮不存在
    }
}

// 主要脚本逻辑函数
function mainScript() {
    while (isRunning) {
        try {
            if (step == 1) {
                updateLog('=== 步骤1: 寻找立即预订按钮 ===');

                let result = clickButton('立即预订');

                if (result === true) {
                    // 按钮消失，页面已跳转
                    step = 2;
                    updateLog('✅ 成功进入步骤2');
                } else if (result === false) {
                    // 按钮存在但点击未生效，立即重试
                    updateLog('🔄 立即重试点击立即预订按钮');
                }
            } else if (step == 2) {
                updateLog('=== 步骤2: 寻找确认按钮 ===');
                let result = clickButton('确认');
                if (result === true) {
                    step = 3;
                    updateLog('✅ 成功进入步骤3 - 进入支付阶段');
                } else if (result === false) {
                    updateLog('🔄 立即重试点击确认按钮');
                }
            } else if (step == 3) {
                updateLog('=== 步骤3: 持续点击立即支付按钮 ===');

                // 首先检查是否存在刷新按钮，使用clickButton方法
                let refreshResult = clickButton('刷新');
                if (refreshResult === true) {
                    // 刷新按钮消失，刷新成功
                    updateLog('🔄 刷新成功，继续检查支付按钮');
                } else if (refreshResult === false) {
                    // 刷新按钮存在但点击未生效，立即重试
                    updateLog('🔄 立即重试点击刷新按钮');
                } else {
                    // 没有刷新按钮，检查立即支付按钮
                    let payBtn = text('立即支付').findOne(1000);
                    if (payBtn) {
                        updateLog('💰 找到立即支付按钮，点击...');
                        payBtn.click();
                    } else {
                        // 抢票成功,执行停止脚本逻辑
                        updateLog('🎉 抢票成功!脚本停止运行!');
                        toast('抢票成功!脚本停止运行!');

                        isRunning = false;

                        ui.run(() => {
                            if (window && window.startBtn) {
                                window.startBtn.setText('开始');
                                window.startBtn.attr('bg', '#4CAF50');
                            }
                        });
                        break;
                    }
                }
            }

            // 短暂延迟避免过于频繁的操作
            sleep(100);
        } catch (e) {
            updateLog('❌ 脚本执行出错: ' + e.message);
            console.error('脚本执行出错:', e);
            // 出错时停止脚本
            isRunning = false;
            ui.run(() => {
                if (window && window.startBtn) {
                    window.startBtn.setText('开始');
                    window.startBtn.attr('bg', '#4CAF50');
                }
            });
            break;
        }
    }
    console.log('脚本已停止');
}

console.log('悬浮窗已启动，请点击按钮控制脚本');
