// const lunar = require("vietnamese-lunar-calendar");
const { LunarDate } = require("lunar-date-vn");

class EventDateServices {
    // hàm lấy các ngày lễ trong năm của Việt Nam
    async getVietnamHolidays(year) {
        const holidays = [];

        const pad = (n) => String(n).padStart(2, "0");
        const formatDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

        const pushItem = ({
            name,
            date,
            calendarType,
            type,
            category,
            isDayOff = false,
            note = "",
            lunarDate = null
        }) => {
            const itemYear = new Date(date).getFullYear();
            if (itemYear !== year) return;

            holidays.push({
                name,
                date,
                calendarType,
                ...(lunarDate ? { lunarDate } : {}),
                type,
                category,
                isDayOff,
                note
            });
        };

        const pushSolar = ({
            name,
            month,
            day,
            type,
            category,
            isDayOff = false,
            note = ""
        }) => {
            pushItem({
                name,
                date: formatDate(year, month, day),
                calendarType: "solar",
                type,
                category,
                isDayOff,
                note
            });
        };

        const pushLunar = ({
            name,
            lunarDay,
            lunarMonth,
            lunarYear = year,
            type,
            category,
            isDayOff = false,
            note = "",
            leap_month = false
        }) => {
            try{
            const lunarDate = new LunarDate({
                day: lunarDay,
                month: lunarMonth,
                year: lunarYear,
                leap_month
            });

            lunarDate.init();
            const solar = lunarDate.toSolarDate();

            pushItem({
                name,
                date: formatDate(solar.year, solar.month, solar.day),
                calendarType: "lunar",
                lunarDate: `${pad(lunarDay)}-${pad(lunarMonth)}`,
                type,
                category,
                isDayOff,
                note
            });
        }catch(error){
        console.error("Error converting lunar to solar date:", error);
    }}
        const tet = new LunarDate({ day: 1, month: 1, year });
            tet.init();
            const tetSolar = tet.toSolarDate();

            const giaoThuaDate = new Date(tetSolar.year, tetSolar.month - 1, tetSolar.day);
            giaoThuaDate.setDate(giaoThuaDate.getDate() - 1);

            pushItem({
                name: "Giao thừa",
                date: formatDate(
                    giaoThuaDate.getFullYear(),
                    giaoThuaDate.getMonth() + 1,
                    giaoThuaDate.getDate()
                ),
                calendarType: "lunar",
                type: "traditional",
                category: "tet"
            });
        // ================= OFFICIAL =================
        pushSolar({ name: "Tết Dương lịch", month: 1, day: 1, type: "official", category: "public_holiday", isDayOff: true });
        pushLunar({ name: "Tết Nguyên Đán", lunarDay: 1, lunarMonth: 1, type: "official", category: "public_holiday", isDayOff: true });
        pushLunar({ name: "Giỗ Tổ Hùng Vương", lunarDay: 10, lunarMonth: 3, type: "official", category: "public_holiday", isDayOff: true });
        pushSolar({ name: "30/4", month: 4, day: 30, type: "official", category: "public_holiday", isDayOff: true });
        pushSolar({ name: "1/5", month: 5, day: 1, type: "official", category: "public_holiday", isDayOff: true });
        pushSolar({ name: "Quốc khánh", month: 9, day: 2, type: "official", category: "public_holiday", isDayOff: true });

        // ================= TRADITIONAL =================
        // pushLunar({ name: "Giao thừa", lunarDay: 30, lunarMonth: 12, lunarYear: year - 1, type: "traditional", category: "tet" });
        pushLunar({ name: "Mùng 2 Tết", lunarDay: 2, lunarMonth: 1, type: "traditional", category: "tet" });
        pushLunar({ name: "Mùng 3 Tết", lunarDay: 3, lunarMonth: 1, type: "traditional", category: "tet" });
        pushLunar({ name: "Mùng 4 Tết", lunarDay: 4, lunarMonth: 1, type: "traditional", category: "tet" });
        pushLunar({ name: "Mùng 5 Tết", lunarDay: 5, lunarMonth: 1, type: "traditional", category: "tet" });

        pushLunar({ name: "Rằm tháng Giêng", lunarDay: 15, lunarMonth: 1, type: "traditional", category: "festival" });
        pushLunar({ name: "Tết Hàn Thực", lunarDay: 3, lunarMonth: 3, type: "traditional", category: "festival" });

        // Thanh Minh (dương lịch)
        pushSolar({ name: "Tết Thanh Minh", month: 4, day: 4, type: "traditional", category: "festival" });

        pushLunar({ name: "Tết Đoan Ngọ", lunarDay: 5, lunarMonth: 5, type: "traditional", category: "festival" });
        pushLunar({ name: "Vu Lan", lunarDay: 15, lunarMonth: 7, type: "traditional", category: "festival" });
        pushLunar({ name: "Trung Thu", lunarDay: 15, lunarMonth: 8, type: "traditional", category: "festival" });

        pushLunar({ name: "Ông Công Ông Táo", lunarDay: 23, lunarMonth: 12, lunarYear: year - 1, type: "traditional", category: "festival" });

        // ================= POPULAR =================
        pushSolar({ name: "Valentine", month: 2, day: 14, type: "popular", category: "dating" });
        pushSolar({ name: "8/3", month: 3, day: 8, type: "popular", category: "celebration" });
        pushSolar({ name: "1/4", month: 4, day: 1, type: "popular", category: "fun" });
        pushSolar({ name: "1/6", month: 6, day: 1, type: "popular", category: "family" });
        pushSolar({ name: "20/10", month: 10, day: 20, type: "popular", category: "celebration" });
        pushSolar({ name: "Halloween", month: 10, day: 31, type: "popular", category: "entertainment" });
        pushSolar({ name: "20/11", month: 11, day: 20, type: "popular", category: "celebration" });
        pushSolar({ name: "Noel", month: 12, day: 24, type: "popular", category: "entertainment" });
        pushSolar({ name: "Giáng Sinh", month: 12, day: 25, type: "popular", category: "entertainment" });
        pushSolar({ name: "Countdown", month: 12, day: 31, type: "popular", category: "event" });

        holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

        return holidays;
    }
    // hàm lấy các ngày lễ trong ngày hôm nay
    async getTodayHoliday() {
        const today = new Date();

        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate() ;

        const pad = (n) => String(n).padStart(2, "0");
        const todayStr = `${year}-${pad(month)}-${pad(day)}`;

        const holidays = await this.getVietnamHolidays(year);

        return holidays.filter(h => h.date === todayStr);
    }
    // hàm lấy thời tiết hiện tại của một thành phố
    async getWeather(city) {
        if(!city) {
            console.log("ko có city");
            return { condition: "Unknown" };
        }
        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            condition: data.current.condition.text
        };
    }
}

module.exports = new EventDateServices();