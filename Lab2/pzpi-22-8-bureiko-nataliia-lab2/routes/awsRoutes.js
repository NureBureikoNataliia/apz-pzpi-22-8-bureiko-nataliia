const express = require("express");
const verifyToken = require("../authMiddleware");
const jwt = require('jsonwebtoken')
require("dotenv").config({path: "../config.env"})

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")

let awsRoutes = express.Router();
const s3Bucket = "productstorage0"

const s3Client = new S3Client( {
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

// Get image
awsRoutes.route("/images/:id").get(verifyToken, async (request, response) => {
    try {
        const id = request.params.id
        const bucketParams = {
            Bucket: s3Bucket,
            Key: id,
        }

        const data = await s3Client.send(new GetObjectCommand(bucketParams))

        const contentType = data.ContentType
        const srcString = await data.Body.transformToString('base64')
        const imageSource = `data:${contentType};base64, ${srcString}`

        response.json(imageSource);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});

// Create image
awsRoutes.route("/images").post(verifyToken, async (request, response) => {
    try {
        const file = request.files[0]
        console.log(file)
        const bucketParams = {
            Bucket: s3Bucket,
            Key: file.originalname,
            Body: file.buffer
        }

        const data = await s3Client.send(new PutObjectCommand(bucketParams))
        response.status(201).json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send("Internal Server Error");
    }
});


// Delete image
// awsRoutes.route("/images/:id").delete(async (request, response) => {
//     try {
//         let db = database.getDb();
//         let data = await db.collection("quizzes").deleteOne({ _id: new ObjectId(request.params.id) });

//         if (data.deletedCount > 0) {
//             response.json(data);
//         } else {
//             response.status(404).send("Quiz not found for deletion");
//         }
//     } catch (error) {
//         console.error(error);
//         response.status(500).send("Internal Server Error");
//     }
// });



module.exports = awsRoutes;
