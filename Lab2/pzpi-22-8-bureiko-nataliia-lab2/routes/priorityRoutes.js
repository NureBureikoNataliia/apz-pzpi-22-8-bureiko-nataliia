const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let priorityRoutes = express.Router();

// Get all priorities
priorityRoutes.route("/priorities").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("priorities").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("No priorities found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Get a priority by ID
priorityRoutes.route("/priorities/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("priorities").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Priority not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new priority
priorityRoutes.route("/priorities").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let priorityObject = {
            priority: request.body.priority,
            category: new ObjectId(request.body.category), // Преобразуем category в ObjectId
            product: new ObjectId(request.body.product)   // Преобразуем product в ObjectId
        };

        let data = await db.collection("priorities").insertOne(priorityObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing priority
priorityRoutes.route("/priorities/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let priorityObject = {
            $set: {
                priority: request.body.priority,
                category: new ObjectId(request.body.category),
                product: new ObjectId(request.body.product)
            }
        };

        let data = await db.collection("priorities").updateOne(
            { _id: new ObjectId(request.params.id) },
            priorityObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Priority not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete a priority
priorityRoutes.route("/priorities/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("priorities").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Priority not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = priorityRoutes;
