
const EventDateServices = require("./eventDateServices");
const { connectAI } = require("../config/connectAI");
const promtServices = require("./promtAI");
const checkRepository = require("../repository/CheckRepostory");
const historyWasteLessServices = require("./historyWasteServices");
const dishesRepository = require("../repository/DishesRepository");
const retry = require("../utils/retry");
const sequelize = require("../config/connectData");
const AIRepository = require("../repository/AIRepository");
const DishesRepository = require("../repository/DishesRepository");
const { now } = require("sequelize/lib/utils");
class AIServices {
    async serviceAIEveryDays(){
        try {
            // lấy tất cả brand 
            const brands = await checkRepository.AllBrand();
            if(!brands || brands.length === 0){
                return false
            }
            const dateVN = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
                }).format(new Date());
            // tính coi phải cuối tuần không
            const dayOfWeek = new Date(`${dateVN}T00:00:00+07:00`).getDay();
            const is_weekend = (dayOfWeek === 0 || dayOfWeek === 6) ? true : false;
            for(const brand of brands){
                const location = brand.province;
                const restaurant_type = brand.rolebrand;
                const is_holiday = await EventDateServices.getTodayHoliday();
                const weather = await EventDateServices.getWeather(location);
                const summary = await historyWasteLessServices.SummaryHistory7next(brand.id);
                const detailThreeNextDays = await historyWasteLessServices.DetailHistory3next(brand.id);
                // lấy danh sách món ăn của hệ thống
                const dishes = await dishesRepository.GetAllDishesTrueAI(brand.id);
                if(!dishes || dishes.length === 0){
                    continue
                }
                const prompt = await promtServices.generatePrompt({
                        location: location,
                        restaurant_type: restaurant_type,
                        weather: weather,
                        is_holiday: is_holiday,
                        is_weekend: is_weekend,
                        summary: summary,
                        detailThreeNextDays: detailThreeNextDays,
                        dishes: dishes
                        });
                const result = await retry(() => connectAI(prompt));
                await this.SaveDataFromAI(result, brand.id);
            }
            return "AI analysis completed successfully";
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async SaveDataFromAI(result, brandID){
        const t = await sequelize.transaction();
        try {
            const data = await this.parseAIResponse(result);
            // console.log(data);
            const dateVN = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
                }).format(new Date());
            await this.validateAIResult(data);
            const dataAI={
                summary: data.summary,
                risk_level: data.risk_level,
                ai_customer_count: data.ai_customer,
                date: dateVN,
            };
            const AI= await AIRepository.createAi_Analysis(dataAI, brandID, { transaction: t });
                for (const item of data.details) {
                    const dishes_id = await this.mapDishNameToId(item.dish_name, brandID);
                    const detailData = {
                        dishes_id: dishes_id,
                        recommended_quantity: Number(item.recommended_quantity), // Chuyển đổi recommended_quantity sang kiểu sốitem.recommended_quantity,
                        predicted_waste_quantity: Number(item.predicted_waste_quantity),
                        suggestion_note: item.suggestion_note || null
                    };
                    await AIRepository.createAi_Analysis_Detail(detailData, AI.id, { transaction: t });
                }
            await t.commit();
            return AI;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
    // hàm parse kết quả trả về từ AI để lấy được số lượng khách hàng dự đoán được
    async parseAIResponse(text){
        try {
            const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

            return JSON.parse(cleaned);
        } catch (error) {
            throw new Error("AI response is not valid JSON");
        }
    };
    // hàm validate kết quả trả về từ AI để đảm bảo dữ liệu đúng định dạng và hợp lệ trước khi lưu vào database
    async validateAIResult(data) {
        if (!data) throw new Error("AI result empty");

        if (!Array.isArray(data.details)) {
            throw new Error("details must be array");
        }

        for (const item of data.details) {
            if (!item.dish_name) {
            throw new Error("Missing dish_name");
            }

            if (Number(item.predicted_waste_quantity) > Number(item.recommended_quantity)) {
            throw new Error("waste > recommended");
            }
        }

        return true;
    };

    //
    async mapDishNameToId(dishName, brandId){
            if (!dishName || !brandId) return null;

            const normalizeText = (text = "") => {
                return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9\s]/g, "")
                .replace(/\s+/g, " ")
                .trim();
            };

            const similarity = (a, b) => {
                const aWords = a.split(" ").filter(Boolean);
                const bWords = b.split(" ").filter(Boolean);

                if (!aWords.length || !bWords.length) return 0;

                let matchCount = 0;
                for (const word of aWords) {
                if (bWords.includes(word)) matchCount++;
                }

                return matchCount / Math.max(aWords.length, bWords.length);
            };

            const dishes = await DishesRepository.GetAllDishesTrueAI(brandId);

            if (!dishes || dishes.length === 0) return null;

            const normalizedInput = normalizeText(dishName);

            if (!normalizedInput) return null;

            // 1. Exact match
            const exactMatch = dishes.find(
                (dish) => normalizeText(dish.name) === normalizedInput
            );
            if (exactMatch) return exactMatch.id;

            // 2. Includes match
            const includeMatch = dishes.find((dish) => {
                const normalizedDishName = normalizeText(dish.name);
                return (
                normalizedDishName.includes(normalizedInput) ||
                normalizedInput.includes(normalizedDishName)
                );
            });
            if (includeMatch) return includeMatch.id;

            // 3. Similarity match
            let bestMatch = null;
            let bestScore = 0;

            for (const dish of dishes) {
                const normalizedDishName = normalizeText(dish.name);
                const score = similarity(normalizedInput, normalizedDishName);

                if (score > bestScore) {
                bestScore = score;
                bestMatch = dish;
                }
            }

            // threshold để tránh map sai
            if (bestMatch && bestScore >= 0.5) {
                return bestMatch.id;
            }
            return null;
        };
    // check món ăn đó có nguyên liệu hợp lý hay không
    async CheckIngredientOutput(nameDish, categoryDish, dish_recipes){
        try {
            const prompt = await promtServices.generatePromptCheckIngredientForDish({nameDish, categoryDish, ingredient: dish_recipes});
            const result = await retry(() => connectAI(prompt));
            console.log("kết quả:",result);
            const data = await this.parseAIResponse(result);
            return data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AIServices();