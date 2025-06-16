console.show();

// 创建悬浮窗按钮
let resetWindow = floaty.window(
    <frame gravity="center">
        <button id="resetBtn" text="重置" w="150" h="60" bg="#ff0000" textSize="18sp" />
    </frame>
);

// 设置按钮位置
resetWindow.setPosition(device.width / 2 - 75, 100);

let isRunning = false; // 初始化为false
let mainThread = null;

// 按钮点击事件
resetWindow.resetBtn.on('click', function () {
    console.log('重置按钮被点击');
    if (!isRunning) {
        isRunning = true;
        toast('脚本已重新启动');
        console.log('脚本已重新启动');

        // 如果已有线程在运行，先停止它
        if (mainThread != null && mainThread.isAlive()) {
            mainThread.interrupt();
        }

        // 创建新线程运行主逻辑
        mainThread = threads.start(function () {
            runMainScript();
        });
    } else {
        toast('脚本正在运行中');
    }
});

// 主要逻辑封装为函数
function runMainScript() {
    console.log('开始执行脚本...');

    while (isRunning) {
        try {
            // 寻找并点击立即购买按钮
            className('android.widget.TextView').text('立即购买').findOne().click();

            // 检查是否出现确定按钮
            if (text('确定').exists()) {
                console.log('检测到确定按钮');

                className('android.widget.TextView').text('确定').findOne().click();

                console.log('确定按钮点击 -- 完毕!');

                className('android.widget.TextView').text('确认信息并支付').findOne().click();

                console.log('确认信息并支付 -- 完毕!');

                className('android.widget.TextView').text('就是这家').findOne().click();

                console.log('就是这家 -- 完毕!');

                isRunning = false;
                console.log('脚本已暂停，可点击重置按钮重新启动');
                break;
            }
        } catch (e) {
            console.log('操作出错：' + e);
        }

        console.log('未检测按钮!持续刷新!');

        sleep(500);
    }
}

// 启动时自动开始运行
isRunning = true;
mainThread = threads.start(function () {
    runMainScript();
});

// 保持脚本运行状态
setInterval(() => {}, 1000);

// 监听退出事件，关闭悬浮窗
events.on('exit', function () {
    if (resetWindow != null) {
        resetWindow.close();
    }
});
