// 脚本id:684f7c2d29cc438f9ade8304

console.show();

// 创建悬浮窗按钮
let resetWindow = floaty.rawWindow(
    <frame gravity="center" w="*" h="*">
        <vertical>
            <button id="startBtn" text="开始" w="*" h="*" bg="#635eff" textColor="#ffffff" textSize="14sp" layout_margin="2dp" />

            <button id="modelBtn" text="刷新模式" w="*" h="*" bg="#635eff" textColor="#ffffff" textSize="14sp" layout_margin="2dp" />

            <button id="configBtn" text="配置(到店取)" w="*" h="*" bg="#ffffff" textSize="14sp" layout_margin="2dp" />

            <button id="settingBtn" text="校准" w="*" h="*" bg="#84adea" textColor="#ffffff" textSize="14sp" layout_margin="2dp" />
        </vertical>
    </frame>
);

// 设置按钮位置
resetWindow.setPosition(device.width - 300, device.height / 2 / 2);

// 创建存储
let storage = storages.create('ppmt_2.0');

// 确定按钮
let x = storage.get('x');
let y = storage.get('y');

// 确认信息并支付
let x2 = storage.get('x2');
let y2 = storage.get('y2');

// 就是这家
let x3 = storage.get('x3');
let y3 = storage.get('y3');

// 确认无误
let x4 = storage.get('x4');
let y4 = storage.get('y4');

let isRunning = false; // 初始化为false
let mainThread = null; // 线程1
let mainThread2 = null; // 线程2
let model = 1; // 模式 1:刷新模式 2:不刷新模式
let deliveryMethod = '到店取';
let buyBtn = '就是这家';
let isRun = false; // 是否进入循环点击模式

console.log('脚本初始化成功!');
console.log('当前模式---- ' + (model == 1 ? '刷新模式' : '不刷新模式'));

// 开始
resetWindow.startBtn.on('click', function () {
    if (!isRunning) startScript();
    else stopScript();
});

// 刷新模式
resetWindow.modelBtn.on('click', function () {
    if (model == 1) {
        model = 2;
    } else {
        model = 1;
    }

    resetWindow.modelBtn.setText(model == 1 ? '刷新模式' : '不刷新模式');

    stopScript();
});

// 配置
resetWindow.configBtn.on('click', function () {
    if (model == 1) return dialogs.alert('配置仅在"不刷新模式"下有效');

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

            resetWindow.configBtn.setText(`配置(${deliveryMethod})`);
        })
        .show();
});

// 校准
resetWindow.settingBtn.on('click', function () {
    let options = [
        // `确定-${x && y ? `已校准-${x},${y}` : '未校准'}`,
        `确认信息并支付-${x2 && y2 ? `已校准-${x2},${y2}` : '未校准'}`,
        `就是这家-${x3 && y3 ? `已校准-${x3},${y3}` : '未校准'}`,
        `确认无误-${x4 && y4 ? `已校准-${x4},${y4}` : '未校准'}`,
    ];

    dialogs.select('请选择校准按钮', options).then((i) => {
        let btn;

        switch (i + 1) {
            // case 0:
            //     btn = className('android.widget.TextView').text('确定').findOne();

            //     rect = btn.bounds();

            //     storage.put('x', rect.left + (rect.right - rect.left) / 2);

            //     storage.put('y', rect.top + (rect.bottom - rect.top) / 2);

            //     x = rect.left + (rect.right - rect.left) / 2;

            //     y = rect.top + (rect.bottom - rect.top) / 2;

            //     console.log(`确定按钮坐标: ${x}, ${y}`);

            //     break;
            case 1:
                btn = className('android.widget.TextView').text('确认信息并支付').findOne(200);
                storage.put('x2', btn.bounds().centerX());
                storage.put('y2', btn.bounds().centerY());

                if (!btn) return;

                x2 = btn.bounds().centerX();
                y2 = btn.bounds().centerY();

                console.log(`确认信息并支付按钮坐标: ${btn.bounds().centerX()}, ${btn.bounds().centerY()}`);
                break;
            case 2:
                btn = className('android.widget.TextView').text('就是这家').findOne(200);
                storage.put('x3', btn.bounds().centerX());
                storage.put('y3', btn.bounds().centerY());

                if (!btn) return;

                x3 = btn.bounds().centerX();
                y3 = btn.bounds().centerY();

                console.log(`就是这家按钮坐标: ${btn.bounds().centerX()}, ${btn.bounds().centerY()}`);
                break;
            case 3:
                btn = className('android.widget.TextView').text('确认无误').findOne(200);

                if (!btn) return;

                storage.put('x4', btn.bounds().centerX());
                storage.put('y4', btn.bounds().centerY());

                x4 = btn.bounds().centerX();
                y4 = btn.bounds().centerY();

                console.log(`确认无误按钮坐标: ${btn.bounds().centerX()}, ${btn.bounds().centerY()}`);
                break;
        }
    });
});

// 切换按钮字体
function changeFontText(text, color) {
    resetWindow.startBtn.setText(text);
    resetWindow.startBtn.setBackgroundColor(colors.parseColor(color));
}

// 停止脚本
function stopScript() {
    changeFontText('开始', '#635eff');

    isRunning = false;

    isRun = false;

    if (mainThread != null && mainThread.isAlive()) mainThread.interrupt();

    if (mainThread2 != null && mainThread2.isAlive()) mainThread2.interrupt();

    console.log('脚本已关闭');
}

// 开始脚本
function startScript() {
    console.clear();

    changeFontText('关闭', '#FF9800');

    isRunning = true;

    console.log('脚本已开始运行');

    mainThread = threads.start(function () {
        runMainScript();
    });
}

// 主要逻辑封装为函数
function runMainScript() {
    console.log('开始执行脚本...');

    if (model == 1) {
        while (isRunning) {
            // 寻找并点击立即购买按钮
            className('android.widget.TextView').text('立即购买').findOne().click();

            let btn1 = className('android.widget.TextView').text('确定').findOne(600);

            // 检查是否出现确定按钮
            if (btn1) {
                console.log('检测到确定按钮');

                btn1.click();

                // press(x, y, 1);

                console.log('确定按钮点击 -- 完毕!');

                sleep(200);

                press(x2, y2, 1);

                sleep(150);

                console.log('确认信息并支付 -- 完毕!');

                className('android.widget.TextView').text('就是这家').findOne().click();

                console.log('就是这家 -- 完毕!');

                stopScript();

                break;
            }
        }
    } else {
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

                    if (!mainThread2) {
                        mainThread2 = threads.start(function () {
                            console.log('开始执行线程2...');

                            while (isRun) {
                                let btn4 = className('android.widget.TextView').text('确定').findOne();

                                btn4 && btn4.click();
                            }
                        });
                    }
                }
            } catch (e) {
                console.log('操作出错：' + e);
            }

            sleep(600);
        }
    }
}

// 保持脚本运行状态
setInterval(() => {}, 1000);

// 监听退出事件，关闭悬浮窗
events.on('exit', function () {
    if (resetWindow != null) {
        resetWindow.close();
    }
});
