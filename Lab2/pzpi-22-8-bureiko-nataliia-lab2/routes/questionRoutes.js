const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let questionRoutes = express.Router();

// Get all questions
questionRoutes.route("/questions").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("questions").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("No questions found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Get a question by ID
questionRoutes.route("/questions/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("questions").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Question not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new question
questionRoutes.route("/questions").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let questionObject = {
            name: request.body.name,
            text: request.body.text,
            surveys: request.body.surveys.map(id => new ObjectId(id)) 
        };

        let data = await db.collection("questions").insertOne(questionObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing question
questionRoutes.route("/questions/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let questionObject = {
            $set: {
                name: request.body.name,
                text: request.body.text,
                surveys: request.body.surveys.map(id => new ObjectId(id)) 
            }
        };

        let data = await db.collection("questions").updateOne(
            { _id: new ObjectId(request.params.id) },
            questionObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Question not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete a question
questionRoutes.route("/questions/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("questions").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Question not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = questionRoutes;
