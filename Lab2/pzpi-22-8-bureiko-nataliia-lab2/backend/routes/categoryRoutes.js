const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

let categoryRoutes = express.Router();

// Get all categories
categoryRoutes.route("/categories").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("categories").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("No categories found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Get a category by ID
categoryRoutes.route("/categories/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("categories").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Category not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new category
categoryRoutes.route("/categories").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let categoryObject = {
            name: request.body.name
        };

        let data = await db.collection("categories").insertOne(categoryObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing category
categoryRoutes.route("/categories/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let categoryObject = {
            $set: {
                name: request.body.name
            }
        };

        let data = await db.collection("categories").updateOne(
            { _id: new ObjectId(request.params.id) },
            categoryObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Category not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete a category
categoryRoutes.route("/categories/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("categories").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Category not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = categoryRoutes;
