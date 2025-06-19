// 脚本id:685114a139001f1c72ee3281

console.show();

const { state, commoditys, commoditys_num } = hamibot.env;

console.log(state);

console.log(commoditys);

console.log(commoditys_num);

// 获取页面所有id为lnc的空间
const lncs = id('lnc').find();

console.log(lncs);

setInterval(() => {}, 1000);
