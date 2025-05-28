const express = require("express");
const database = require("../connect");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config({path: "./config.env"})

let employeeRoutes = express.Router();
const SALT_ROUNDS = 6

// Get all employees
employeeRoutes.route("/employees").get(async (request, response) => {
    let db = database.getDb();
    let data = await db.collection("employees").find({}).toArray();

    if (data.length > 0) {
        response.json(data);
    } else {
        response.status(404).send("No employees found");
    }
});

// Get employee by ID
employeeRoutes.route("/employees/:id").get(async (request, response) => {
    let db = database.getDb();
    let data = await db.collection("employees").findOne({ _id: new ObjectId(request.params.id) });

    if (data) {
        response.json(data);
    } else {
        response.status(404).send("employee not found");
    }
});

// Update an existing employee
employeeRoutes.route("/employees/:id").put(async (request, response) => {
    let db = database.getDb();

    const hash = await bcrypt.hash(request.body.password, SALT_ROUNDS)

    let mongoObject = {
        $set: {
            firstName: request.body.firstName,
            surname: request.body.surname,
            email: request.body.email,
            admin: request.body.admin,
            password: hash,
        },
    };

    let data = await db.collection("employees").updateOne(
        { _id: new ObjectId(request.params.id) },
        mongoObject
    );

    response.json(data)
});

// Delete an employee
employeeRoutes.route("/employees/:id").delete(async (request, response) => {
    let db = database.getDb();
    let data = await db.collection("employees").deleteOne({ _id: new ObjectId(request.params.id) });
    response.json(data)
});

//Login
employeeRoutes.route("/employees/login").post(async (request, response) => {
    let db = database.getDb()

    const user = await db.collection("employees").findOne({email: request.body.email})

    if (user) {
        let confirmation = await bcrypt.compare(request.body.password, user.password)
        
        if (confirmation) { 
            const token = jwt.sign(user, process.env.SECRETKEY, {expiresIn: "1h"})
            response.json({success: true, token})
        } else {
            response.json({success: false, message: "Incorrect password"})
        }
    } else {
        response.json({success: false, message: "User is not found"})
    }
    
})

// Create employee
employeeRoutes.route("/employees").post(async (request, response) => {
    let db = database.getDb()

    const takenEmail = await db.collection("employees").findOne({email: request.body.email})

    if (takenEmail) {
        response.json({message: "This email is taken"})
    } 
    else {
        const hash = await bcrypt.hash(request.body.password, SALT_ROUNDS)

        let mongoObject = {
            firstName: request.body.firstName,
            surname: request.body.surname,
            email: request.body.email,
            admin: request.body.admin,
            password: hash,
        }
        let data = await db.collection("employees").insertOne(mongoObject)

        response.json(data)
    }
    
})

module.exports = employeeRoutes;
