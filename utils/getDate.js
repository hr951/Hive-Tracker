function getDate() {
    const date1 = new Date();
    const date2 = date1.getFullYear() + "年" +
        (date1.getMonth() + 1) + "月" +
        date1.getDate() + "日" +
        date1.getHours() + "時" +
        date1.getMinutes() + "分" +
        date1.getSeconds() + "秒";

    return date2;
}

module.exports = {
    getDate
}