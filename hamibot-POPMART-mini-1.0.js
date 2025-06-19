// 脚本id:6850015529cc438f9aec7e16
console.show();

// 创建悬浮窗按钮
let resetWindow = floaty.window(
    <frame gravity="center" w="*" h="*">
        {/* 垂直 */}
        <vertical>
            <button id="startBtn" text="开始" w="80" h="*" bg="#635eff" textColor="#ffffff" textSize="16sp" margin="10" />

            <button id="settingBtn" text="配置" w="80" h="*" bg="#ffffff" textSize="16sp" margin="10" />
        </vertical>
    </frame>
);

// 设置按钮位置
resetWindow.setPosition(device.width - 300, device.height / 2 / 2);

let isRunning = false; // 初始化为false
let mainThread = null;
let model = 2; // 1:抢购模式 2:补货模式
let deliveryMethod = '到店取';
let buyBtn = '就是这家';
let isRun = false; // 是否进入循环点击模式

console.log('脚本初始化成功!');
console.log('当前取货方式---- ' + deliveryMethod);

// 开始
resetWindow.startBtn.on('click', function () {
    if (!isRunning) {
        changeFontText('关闭', '#FF9800');

        isRunning = true;

        console.log('脚本已开始运行');

        mainThread = threads.start(function () {
            runMainScript();
        });
    } else {
        changeFontText('开始', '#635eff');

        isRunning = false;

        isRun = false;

        mainThread.interrupt();

        console.log('脚本已关闭');
    }
});

// 配置
resetWindow.settingBtn.on('click', function () {
    dialogs
        .build({
            title: '请选择取货方式',
            items: ['到店取', '送到家'],
            itemsSelectMode: 'single',
            itemsSelectedIndex: deliveryMethod == '到店取' ? 0 : 1,
        })
        .on('single_choice', (index, item) => {
            deliveryMethod = item;

            buyBtn = deliveryMethod == '到店取' ? '就是这家' : '确认无误';

            changeFontText('开始', '#635eff');

            isRunning = false;

            isRun = false;

            if (mainThread != null && mainThread.isAlive()) {
                mainThread.interrupt();
            }

            console.clear();

            console.log('配置更新成功! 请点击开始按钮重新启动');

            console.log('已选择取货方式: ' + deliveryMethod);
        })
        .show();
});

function runMainScript() {
    console.log('开始执行脚本...');

    while (isRunning) {
        try {
            if (!isRun) {
                // 寻找并点击立即购买按钮
                className('android.widget.TextView').text('立即购买').findOne().click();
            }

            // 检查是否出现确定按钮
            if (text('确定').exists() || isRun) {
                isRun = true;

                console.log('检测到确定按钮');

                let btn1 = className('android.widget.TextView').text('确定').findOne(500);

                btn1 && btn1.click();

                console.log('确定按钮点击 -- 完毕!');

                let btn2 = className('android.widget.TextView').text('确认信息并支付').findOne(500);

                btn2 && btn2.click();

                console.log('确认信息并支付 -- 完毕!');

                let btn3 = className('android.widget.TextView').text(buyBtn).findOne(500);

                btn3 && btn3.click();

                console.log('就是这家 -- 完毕!');
            }

            if (text('确定').exists() || isRun) {
                let btn4 = className('android.widget.TextView').text('确定').findOne(500);

                btn4 && btn4.click();
            }
        } catch (e) {
            console.log('操作出错：' + e);
        }

        sleep(600);
    }
}

// 切换按钮字体
function changeFontText(text, color) {
    resetWindow.startBtn.setText(text);
    resetWindow.startBtn.setBackgroundColor(colors.parseColor(color));
}

// 保持脚本运行状态
setInterval(() => {}, 1000);

// 监听退出事件，关闭悬浮窗
events.on('exit', function () {
    if (resetWindow != null) {
        resetWindow.close();
    }
});
