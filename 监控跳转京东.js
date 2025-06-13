'ui';

// 检查悬浮窗权限
if (!floaty.checkPermission()) {
    toast('请授予悬浮窗权限');
    floaty.requestPermission();
    exit();
}

// 创建悬浮窗布局
let window = floaty.window(
    <card w="200" h="300" cardCornerRadius="12dp" cardElevation="8dp" margin="4">
        <vertical bg="#ee1a1a1a" padding="12">
            <horizontal id="titleBar" gravity="center_vertical" bg="#33ffffff" padding="8" margin="0 0 8 0" w="*" h="32">
                <text text="🤖 AutoJS控制台" color="#ffffff" textSize="12sp" gravity="center" textStyle="bold" />
            </horizontal>

            <horizontal gravity="center" margin="4">
                <button id="startBtn" text="▶ 开始" w="45" h="36" bg="#4CAF50" textColor="#ffffff" textSize="10sp" style="Widget.AppCompat.Button.Colored" />
                <button id="stopBtn" text="⏸ 停止" w="45" h="36" bg="#f44336" textColor="#ffffff" textSize="10sp" layout_marginLeft="8" style="Widget.AppCompat.Button.Colored" />
                <button id="closeBtn" text="❌ 关闭" w="45" h="36" bg="#9E9E9E" textColor="#ffffff" textSize="10sp" layout_marginLeft="8" style="Widget.AppCompat.Button.Colored" />
            </horizontal>

            <text text="📋 运行日志:" color="#ffffff" textSize="10sp" margin="4 8 4 2" textStyle="bold" />
            <ScrollView w="*" h="120" bg="#22ffffff" margin="2">
                <text id="logText" text="等待开始..." color="#e0e0e0" textSize="9sp" padding="6" gravity="top" />
            </ScrollView>

            <button id="clearLogBtn" text="🗑 清空日志" w="*" h="35" bg="#607D8B" textColor="#ffffff" textSize="9sp" margin="2 4 2 2" />
        </vertical>
    </card>
);

// 设置悬浮窗初始位置
window.setPosition(0, 100);

// 运行状态标志
let isRunning = false;
let mainThread = null;

// 当前步骤
let stepState = 1;

// 第一步点击关键词
const stepOne = '刚刚';

// 第二部点击关键词
const stepTwo = '点击前往抢购';

// 日志输出方法
function logToWindow(message) {
    var timestamp = new Date().toLocaleTimeString();
    var logMessage = '[' + timestamp + '] ' + message;

    ui.run(() => {
        var currentLog = window.logText.getText();
        var newLog = currentLog + '\n' + logMessage;

        // 限制日志长度，保留最新的20行
        var lines = newLog.split('\n');
        if (lines.length > 20) {
            lines = lines.slice(-20);
            newLog = lines.join('\n');
        }

        window.logText.setText(newLog);
    });
}

// 添加拖拽功能
var windowX, windowY, downX, downY;
var moving = false;

window.titleBar.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            windowX = window.getX();
            windowY = window.getY();
            downX = event.getRawX();
            downY = event.getRawY();
            moving = false;
            return true;
        case event.ACTION_MOVE:
            if (!moving && (Math.abs(event.getRawX() - downX) > 10 || Math.abs(event.getRawY() - downY) > 10)) {
                moving = true;
            }
            if (moving) {
                window.setPosition(windowX + (event.getRawX() - downX), windowY + (event.getRawY() - downY));
            }
            return true;
        case event.ACTION_UP:
            moving = false;
            return true;
    }
    return false;
});

// 开始按钮点击事件
window.startBtn.click(() => {
    if (!isRunning) {
        isRunning = true;
        logToWindow('脚本已开始运行');

        // 主要脚本
        mainThread = threads.start(function () {
            while (isRunning) {
                getBtn();
            }
        });

        // 更新按钮状态
        ui.run(() => {
            window.startBtn.setText('运行中');
            window.startBtn.setBackgroundColor(colors.parseColor('#FF9800'));
        });
    } else {
        logToWindow('脚本已在运行中');
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

        logToWindow('脚本已停止');

        // 更新按钮状态
        ui.run(() => {
            window.startBtn.setText('开始');
            window.startBtn.setBackgroundColor(colors.parseColor('#4CAF50'));
        });
    } else {
        logToWindow('脚本未在运行');
    }
});

// 清空日志按钮点击事件
window.clearLogBtn.click(() => {
    ui.run(() => {
        window.logText.setText('日志已清空...');
    });
    logToWindow('日志已清空');
});

// 关闭按钮点击事件
window.closeBtn.click(() => {
    // 停止脚本
    if (isRunning) {
        isRunning = false;
        if (mainThread) {
            mainThread.interrupt();
        }
    }

    // 关闭悬浮窗
    window.close();
    toast('悬浮窗已关闭');
    exit();
});

// 悬浮窗已创建，位置固定

// 脚本退出时清理
events.on('exit', () => {
    if (window) {
        window.close();
    }
    if (mainThread) {
        mainThread.interrupt();
    }
});

console.log('悬浮窗已启动，可以拖拽移动位置');
toast('悬浮窗已启动');

// 京东专用点击方法 - 简化版，只保留有效的坐标点击
function clickJDButton(element) {
    try {
        // 获取控件坐标
        var bounds = element.bounds();
        var centerX = bounds.centerX();
        var centerY = bounds.centerY();

        // 使用坐标点击（已验证有效的方法）
        var result = click(centerX, centerY);
        if (result) {
            console.log('✅ 成功！使用【坐标点击】方法成功点击按钮，坐标: (' + centerX + ', ' + centerY + ')');
            return true;
        }

        console.log('❌ 坐标点击失败');
        return false;
    } catch (error) {
        console.log('❌ 点击过程出错: ' + error);
        return false;
    }
}

function clickNotifyButton() {
    notifyElement = text('立即购买').findOne(3000);

    if (notifyElement) {
        console.log("通过text找到'到货通知'按钮");
        var clickResult = clickJDButton(notifyElement);
        console.log('京东按钮最终点击结果: ' + clickResult);

        notifyElement2 = text('普通支付').findOne(3000);
        var clickResult = clickJDButton(notifyElement2);

        notifyElement3 = text('确认付款').findOne(3000);
        var clickResult = clickJDButton(notifyElement3);
    }
}

// 寻找需要点击的控件
const getBtn = () => {
    // 第一步
    if (stepState == 1) {
        logToWindow('第一步查找中...');

        let allElements = className('android.view.View').find();

        allElements.forEach((item) => {
            let desc = item.desc();

            // 检查desc是否包含"刚刚"
            if (desc && desc.includes(stepOne)) {
                logToWindow("找到包含'刚刚'的控件: " + desc);

                let clickElement = item.findOne(className('android.widget.ImageView').desc('点击前往抢购'));

                if (clickElement) {
                    logToWindow("找到'点击前往抢购'按钮，准备点击");
                    let clickResult = clickElement.click();
                    logToWindow('点击操作结果: ' + clickResult);

                    if (clickResult) {
                        logToWindow("成功点击'点击前往抢购'，等待页面加载...");
                        stepState = 2;
                    }
                } else {
                    logToWindow("未找到'点击前往抢购'按钮");
                }
            }
        });
    }

    if (stepState == 2) {
        clickNotifyButton();
    }
};
