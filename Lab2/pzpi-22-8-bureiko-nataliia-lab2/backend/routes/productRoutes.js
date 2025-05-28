const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config({path: "./config.env"})
const verifyToken = require("../authMiddleware");

let productRoutes = express.Router();

// Get all products
productRoutes.route("/products").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("products").find({}).toArray();

        if (data.length > 0) {
            response.json(data);
        } else {
            response.status(404).send("Products not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Get a product by ID
productRoutes.route("/products/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("products").findOne({ _id: new ObjectId(request.params.id) });

        if (data) {
            response.json(data);
        } else {
            response.status(404).send("Product not found");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new product
productRoutes.route("/products").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let mongoObject = {
            name: request.body.name,
            description: request.body.description,
            ingredients: request.body.ingredients,
            manufacturer: request.body.manufacturer,
            price: request.body.price,
            imageId: request.body.imageId
        };

        let data = await db.collection("products").insertOne(mongoObject);
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing product
productRoutes.route("/products/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let mongoObject = {
            $set: {
                name: request.body.name,
                description: request.body.description,
                ingredients: request.body.ingredients,
                manufacturer: request.body.manufacturer,
                price: request.body.price,
                imageId: request.body.imageId
            }
        };

        let data = await db.collection("products").updateOne(
            { _id: new ObjectId(request.params.id) },
            mongoObject
        );

        if (data.matchedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Product not found for update");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete a product
productRoutes.route("/products/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("products").deleteOne({ _id: new ObjectId(request.params.id) });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Product not found for deletion");
        }
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = productRoutes;
