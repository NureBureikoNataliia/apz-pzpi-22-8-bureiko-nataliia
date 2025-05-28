const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let answerRoutes = express.Router();

// Get all answers
answerRoutes.route("/answers").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("answers").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("Answers not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Get an answer by ID
answerRoutes.route("/answers/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("answers").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Answer not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new answer
answerRoutes.route("/answers").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let answerObject = {
            text: request.body.text,
            point: request.body.point,
            question: new ObjectId(request.body.question),
            category: new ObjectId(request.body.category)
        };

        let data = await db.collection("answers").insertOne(answerObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing answer
answerRoutes.route("/answers/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let answerObject = {
            $set: {
                text: request.body.text,
                point: request.body.point,
                question: new ObjectId(request.body.question),
                category: new ObjectId(request.body.category)
            }
        };

        let data = await db.collection("answers").updateOne(
            { _id: new ObjectId(request.params.id) },
            answerObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Answer not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete an answer
answerRoutes.route("/answers/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("answers").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Answer not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = answerRoutes;
