console.show();

let x = 47 + (1211 - 47) / 2;
let y = 2581 + (2747 - 2581) / 2;

let time = setInterval(() => {
    press(x, y, 1);
}, 10);

setTimeout(() => {
    clearInterval(time);
}, 10000);

// 保持脚本运行
setInterval(() => {}, 1000);

// 47 2581 1211 2747
