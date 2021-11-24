/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。

let url = ''
let client_id = ''
let client_secret = ''

let CookieJDs = []


const got = require("got");
const fs = require("fs");
const path = require("path");
// 判断环境变量里面是否有京东ck
if (process.env.JD_COOKIE) {
    if (process.env.JD_COOKIE.indexOf('&') > -1) {
        CookieJDs = process.env.JD_COOKIE.split('&');
    } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
        CookieJDs = process.env.JD_COOKIE.split('\n');
    } else {
        CookieJDs = [process.env.JD_COOKIE];
    }
}
if (JSON.stringify(process.env).indexOf('GITHUB') > -1) {
    console.log(`请勿使用github action运行此脚本,无论你是从你自己的私库还是其他哪里拉取的源代码，都会导致我被封号\n`);
    !(async () => {
        await require('./sendNotify').sendNotify('提醒', `请勿使用github action、滥用github资源会封我仓库以及账号`)
        await process.exit(0);
    })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共${CookieJDs.length}个京东账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
};
for (let i = 0; i < CookieJDs.length; i++) {
    if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n提示:京东cookie 【${CookieJDs[i]}】填写不规范,可能会影响部分脚本正常使用。正确格式为: pt_key=xxx;pt_pin=xxx;（分号;不可少）\n`);
    const index = (i + 1 === 1) ? '' : (i + 1);
    exports['CookieJD' + index] = CookieJDs[i].trim();
}

let JD_COOKIES
!(async () => {
    console.log(`我是Tsukasa`)
    let tokenResp = await getToken(url, client_id, client_secret);
    if (tokenResp.data.token) {
        let envResp = await getEnv(url, tokenResp.data.token, 'JD_COOKIE');
        JD_COOKIES = envResp.data;
        fs.readFile("jdCookie.js", 'utf-8', function (err, data) {
            let cookieJDsRegExp = new RegExp('let CookieJDs = \\[([\\s\\S]*?)\]')
            let cookieJDsList = cookieJDsRegExp.exec(data);
            fs.writeFile(path.resolve(__dirname, './jdCookie.js'), data.replace(cookieJDsList[0],`let CookieJDs = [\n${JD_COOKIES.filter(row => row.status === 0).map(row => `"${row.value}",`).join('\n')}\n]`), { encoding: 'utf8' }, err => {})
        });
    }
})();

async function getToken(url, client_id, client_secret) {
    return (await got.get(`http://${url}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`, {
        headers: {},
        responseType: 'json'
    })).body
}

async function getEnv(url, token, envStr) {
    return (await got.get(`http://${url}/open/envs?searchValue=${envStr}&t=${new Date().getTime()}`, {
        headers: {"authorization": `Bearer ${token}`,},
        responseType: 'json'
    })).body
}
