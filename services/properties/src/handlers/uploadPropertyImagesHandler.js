const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const parseMultipart = require('parse-multipart');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

function extractFiles(event) {
    if (!event.body || !event.headers) {
        throw new Error('Invalid event structure');
    }

    const bodyBuffer = event.isBase64Encoded ?
        Buffer.from(event.body, 'base64') :
        Buffer.from(event.body, 'binary');

    const contentType = event.headers['Content-Type'] || event.headers['content-type'];
    if (!contentType) {
        throw new Error('Missing content-type header');
    }

    const boundary = parseMultipart.getBoundary(contentType);
    const parts = parseMultipart.Parse(bodyBuffer, boundary);
    return parts
}

const handler = async (event) => {
    try {
        const propertyId = event.pathParameters.id;


        if (!propertyId) {
            return response.error('Property ID is required', 400);
        }

        const db = await connectToDatabase();
        const property = await db.collection('properties').findOne({ _id: propertyId });
        if (!property) {
            return response.error('Property not found', 404);
        }

        const parts = extractFiles(event);
        if (!parts.length) {
            return response.error('No files uploaded', 400);
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const uploadedFiles = [];
        for (const file of parts) {
            const { filename, type, data } = file;
            if (!data || !filename || !type) {
                return response.error('Invalid file upload', 400);
            }
            if (!allowedTypes.includes(type)) {
                return response.error('Invalid file type. Only JPEG and PNG are allowed.', 400);
            }

            const fileExtension = type.split('/')[1];
            const fileKey = `property-Images/${propertyId}/${uuidv4()}.${fileExtension}`;

            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileKey,
                Body: data,
                ContentType: type
            };

            await s3.putObject(uploadParams).promise();
            const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
            uploadedFiles.push(fileUrl);
        }
        await db.collection('properties').updateOne({ _id: propertyId }, { $push: { "media.photos": { $each: uploadedFiles } } });

        return response.success({ message: 'File uploaded successfully', documents: uploadedFiles }, 200);
    } catch (error) {
        console.error('Upload document error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };