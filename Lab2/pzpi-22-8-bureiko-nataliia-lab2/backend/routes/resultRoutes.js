const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const { setSurveyCompleted } = require("../surveyState");

let resultRoutes = express.Router();

resultRoutes.route("/survey-results/:clientId").get(async (req, res) => {
    try {
        const clientId = req.params.clientId;

        if (!clientId) {
            return res.status(400).send("Client ID is required");
        }

        let db = database.getDb();
        const client = await db.collection("clients").findOne({ _id: new ObjectId(clientId) });

        if (!client) {
            return res.status(404).send("Client not found");
        }

        const answers = client.survey_answers || [];  

        if (answers.length === 0) {
            return res.status(404).send("No answers found for the client");
        }

        // Підрахунок балів для категорій
        let categoryPoints = {};
        for (let answer of answers) {
            const answerData = await db.collection("answers").findOne({ _id: new ObjectId(answer.answer_id) });

            if (answerData && answerData.category) {
                let categoryId = answerData.category.toString();
                categoryPoints[categoryId] = (categoryPoints[categoryId] || 0) + answerData.point;
            }
        }

        // Сортуємо категорії по балам та знаходимо топ-3
        const topCategories = Object.entries(categoryPoints)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        if (topCategories.length === 0) {
            return res.status(404).send("No categories found");
        }

        let productScores = {};
        let productCategoryCount = {};

        // Для кожної категорії з топ-3 шукаємо продукти та рахуємо частоту зустрічання в категоріях
        for (let [categoryId] of topCategories) {
            const priorities = await db.collection("priorities").find({ category: new ObjectId(categoryId) }).toArray();

            for (let priority of priorities) {
                const productId = priority.product.toString();
                const productPriority = priority.priority;

                // Якщо продукт зустрічається перший раз, то створюємо новий об'єкт для нього
                if (!productScores[productId]) {
                    productScores[productId] = { totalPriority: 0, categories: [] };
                }
                productScores[productId].totalPriority += productPriority;
                productScores[productId].categories.push(categoryId);

                // Збільшуємо лічильник у зв'язку з тим скільки раз продукт зустрічається 
                if (!productCategoryCount[productId]) {
                    productCategoryCount[productId] = 0;
                }
                productCategoryCount[productId]++;
            }
        }

        // Сортування продуктів: спочатку по частоті появлення в категоріях, потім по середньому значенню пріоритета
        const sortedProducts = Object.entries(productScores)
            .map(([productId, data]) => {
                const averagePriority = data.totalPriority / data.categories.length;
                return { productId, averagePriority, count: productCategoryCount[productId] };
            })
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return a.count - b.count;  // Спочатку сортуємо по частоті
                }
                return a.averagePriority - b.averagePriority;  // Якщо частота рівна, то по пріоритету
            })
            .slice(0, 5);
                
        // Записуємо рекомендовані категорії в таблицю клієнтів
        const recommendedCategoryIds = topCategories.map(([categoryId]) => new ObjectId(categoryId));

        await db.collection("clients").updateOne(
            { _id: new ObjectId(clientId) },
            { $set: { recommended_categories: recommendedCategoryIds } }
        );

        setSurveyCompleted(true);

        res.json({
            topCategories: topCategories,
            topProducts: sortedProducts
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = resultRoutes;