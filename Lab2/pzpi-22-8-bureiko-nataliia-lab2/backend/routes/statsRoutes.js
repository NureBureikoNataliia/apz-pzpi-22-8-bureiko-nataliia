const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let statsRoutes = express.Router();

statsRoutes.route("/statistics").get(verifyToken, async (req, res) => {
  try {
    const db = database.getDb();

    // 1. Питання та відповіді
    const questions = await db
      .collection("questions")
      .aggregate([
        {
          $lookup: {
            from: "answers",
            localField: "_id",
            foreignField: "question",
            as: "answers",
          },
        },
        {
          $lookup: {
            from: "clients",
            pipeline: [
              { $unwind: "$survey_answers" },
              {
                $group: {
                  _id: "$survey_answers.answer_id",
                  count: { $sum: 1 },
                },
              },
            ],
            as: "clientAnswers",
          },
        },
        {
          $project: {
            question: "$text",
            answers: {
              $map: {
                input: "$answers",
                as: "answer",
                in: {
                  text: "$$answer.text",
                  count: {
                    $ifNull: [
                      {
                        $first: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$clientAnswers",
                                as: "clientAnswer",
                                cond: {
                                  $eq: ["$$clientAnswer._id", "$$answer._id"],
                                },
                              },
                            },
                            as: "filteredAnswer",
                            in: "$$filteredAnswer.count",
                          },
                        },
                      },
                      0, // Если count не найдено, возвращаем 0
                    ],
                  },
                },
              },
            },
          },
        },
      ])
      .toArray();

    // 2. Діапазон віку для жінок та чоловіків
    const ageRanges = [
      { min: 0, max: 12 },
      { min: 12, max: 18 },
      { min: 18, max: 30 },
      { min: 30, max: 40 },
      { min: 40, max: 65 },
      { min: 65, max: Infinity },
    ];

    const clients = await db.collection("clients").find().toArray();

    const ageStats = clients.reduce(
      (stats, client) => {
        const age = client.age || 0;
        const gender = client.gender || "unknown";
        const range = ageRanges.find((r) => age >= r.min && age < r.max);

        if (range) {
          stats[gender] = stats[gender] || {};
          stats[gender][`${range.min}-${range.max}`] =
            (stats[gender][`${range.min}-${range.max}`] || 0) + 1;
        }
        return stats;
      },
      { male: {}, female: {} }
    );

    const mostCommonAgeRange = {
      male: Object.entries(ageStats.male).reduce(
        (max, [range, count]) => (count > max.count ? { range, count } : max),
        { range: null, count: 0 }
      ).range,
      female: Object.entries(ageStats.female).reduce(
        (max, [range, count]) => (count > max.count ? { range, count } : max),
        { range: null, count: 0 }
      ).range,
    };

    // 3. 5 найпопулярніші категорії
    const categoryStats = await db
      .collection("clients")
      .aggregate([
        {
          $unwind: "$recommended_categories", // Розгортаємо масив рекомендованих категорій
        },
        {
          $group: {
            _id: "$recommended_categories", // Групуємо по ідентифікатору категорії
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories", // Приєднуємо данні категорій
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails", // Розгортаємо вкладені дані категорій
        },
        {
          $project: {
            _id: 1,
            name: "$categoryDetails.name",
            count: 1,
          },
        },
        { $sort: { count: -1 } }, // Сортуємо за кількістю в порядку зменшення
        { $limit: 5 }, // Залишаємо лише 5 найпопулярніших
        
      ])
      .toArray();

    // Формуємо кінцевий результат
    const result = {
      questions,
      mostCommonAgeRange,
      popularCategories: categoryStats.map((cat) => ({
        name: cat.name,
      })),
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = statsRoutes;
