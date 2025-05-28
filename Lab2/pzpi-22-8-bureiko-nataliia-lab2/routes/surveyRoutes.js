const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const verifyToken = require("../authMiddleware");

// Import our date formatting utilities
const {
    getUserLocaleInfo,
    parseDate,
    formatObjectDates,
    formatArrayDates,
    createDateFormatterMiddleware
} = require("../utils/dateFormatter");

let surveyRoutes = express.Router();

// Apply date formatting middleware to all routes in this router
// This will automatically format dates in all responses
surveyRoutes.use(createDateFormatterMiddleware([
    'change_date', 'created_at', 'updated_at'
]));

// Get all surveys
surveyRoutes.route("/surveys").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("surveys").find({}).toArray();

        if (data.length > 0) {
            // Date formatting is handled automatically by middleware
            response.json(data);
        } else {
            response.status(404).send("No surveys found");
        }
    } catch (error) {
        console.error("Error fetching surveys:", error);
        response.status(500).send("Internal Server Error");
    }
});

// Get a survey by ID
surveyRoutes.route("/surveys/:id").get(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("surveys").findOne({ 
            _id: new ObjectId(request.params.id) 
        });

        if (data) {
            // Date formatting is handled automatically by middleware
            response.json(data);
        } else {
            response.status(404).send("Survey not found");
        }
    } catch (error) {
        console.error("Error fetching survey:", error);
        response.status(500).send("Internal Server Error");
    }
});

// Create a new survey
surveyRoutes.route("/surveys").post(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        
        // Parse the incoming date and store it as a proper Date object
        const changeDate = parseDate(request.body.change_date);
        const currentDate = new Date();
        
        let surveyObject = {
            name: request.body.name,
            description: request.body.description,
            questions_amount: request.body.questions_amount,
            actuality: request.body.type,
            change_date: changeDate, // Store as Date object for consistency
            created_at: currentDate, // Add creation timestamp
            updated_at: currentDate, // Add update timestamp
            admin: new ObjectId(request.body.admin), 
            questions: request.body.questions.map(id => new ObjectId(id)) 
        };

        let data = await db.collection("surveys").insertOne(surveyObject);
        
        const responseData = {
            acknowledged: data.acknowledged,
            insertedId: data.insertedId,
            survey: surveyObject // Date formatting handled by middleware
        };
        
        response.status(201).json(responseData);
    } catch (error) {
        console.error("Error creating survey:", error);
        response.status(500).send("Internal Server Error");
    }
});

// Update an existing survey
surveyRoutes.route("/surveys/:id").put(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        
        // Parse the incoming date and add update timestamp
        const changeDate = parseDate(request.body.change_date);
        const currentDate = new Date();
        
        let surveyObject = {
            $set: {
                name: request.body.name,
                description: request.body.description,
                questions_amount: request.body.questions_amount,
                actuality: request.body.type,
                change_date: changeDate, // Store as Date object
                updated_at: currentDate, // Update the timestamp
                admin: new ObjectId(request.body.admin), 
                questions: request.body.questions.map(id => new ObjectId(id)) 
            }
        };

        let data = await db.collection("surveys").updateOne(
            { _id: new ObjectId(request.params.id) },
            surveyObject
        );

        if (data.matchedCount > 0) {
            // Get the updated document to return it
            const updatedSurvey = await db.collection("surveys").findOne({ 
                _id: new ObjectId(request.params.id) 
            });
            
            const responseData = {
                acknowledged: data.acknowledged,
                matchedCount: data.matchedCount,
                modifiedCount: data.modifiedCount,
                survey: updatedSurvey // Date formatting handled by middleware
            };
            
            response.json(responseData);
        } else {
            response.status(404).send("Survey not found for update");
        }
    } catch (error) {
        console.error("Error updating survey:", error);
        response.status(500).send("Internal Server Error");
    }
});

// Delete a survey
surveyRoutes.route("/surveys/:id").delete(verifyToken, async (request, response) => {
    try {
        let db = database.getDb();
        let data = await db.collection("surveys").deleteOne({ 
            _id: new ObjectId(request.params.id) 
        });

        if (data.deletedCount > 0) {
            response.json(data);
        } else {
            response.status(404).send("Survey not found for deletion");
        }
    } catch (error) {
        console.error("Error deleting survey:", error);
        response.status(500).send("Internal Server Error");
    }
});

module.exports = surveyRoutes;