const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let clientRoutes = express.Router();

// 1. Get all clients
clientRoutes.route("/clients").get(async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("clients").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("Clients not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// 2. Get a client by ID
clientRoutes.route("/clients/:id").get(async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("clients").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Client not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// 3. Create a new client
clientRoutes.route("/clients").post(async (request, response) => {
    try {
        let db = database.getDb();
        let clientObject = {
            gender: request.body.gender,
            age: request.body.age,
            survey_answers: request.body.survey_answers || [],  // Default empty array if not provided
            recommended_categories: request.body.recommended_categories || []  // Default empty array if not provided
        };

        let data = await db.collection("clients").insertOne(clientObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// 4. Update a client
clientRoutes.route("/clients/:id").put(async (request, response) => {
    try {
        let db = database.getDb();
        let clientObject = {
            $set: {
                gender: request.body.gender,
                age: request.body.age,
                survey_answers: request.body.survey_answers,
                recommended_categories: request.body.recommended_categories
            }
        };

        let data = await db.collection("clients").updateOne(
            { _id: new ObjectId(request.params.id) },
            clientObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Client not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// 5. Delete a client
clientRoutes.route("/clients/:id").delete(async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("clients").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Client not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = clientRoutes;
