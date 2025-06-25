const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const parseMultipart = require('parse-multipart');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const s3Client = new S3Client({
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
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error('Property ID is required', 400);
        }

        const propertyId = event.pathParameters.id;

        // Validate property ID format (basic validation)
        if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
            return response.error("Invalid property ID format", 400);
        }

        // Connect to MongoDB
        let db;
        try {
            db = await connectToDatabase();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return response.error("Database connection failed", 503);
        }

        // Check if property exists
        let property;
        try {
            property = await db.collection('properties').findOne({ _id: propertyId });
        } catch (queryError) {
            console.error("Database query error:", queryError);
            return response.error("Failed to retrieve property", 500);
        }

        if (!property) {
            return response.error('Property not found', 404);
        }

        // Extract files from request
        let parts;
        try {
            parts = extractFiles(event);
        } catch (extractError) {
            console.error("File extraction error:", extractError);
            return response.error('Invalid file upload format', 400);
        }

        if (!parts.length) {
            return response.error('No files uploaded', 400);
        }

        const allowedTypes = ['application/pdf'];
        const uploadedFiles = [];

        for (const file of parts) {
            const { filename, type, data } = file;
            
            if (!data || !filename || !type) {
                return response.error('Invalid file upload', 400);
            }
            
            if (!allowedTypes.includes(type)) {
                return response.error('Invalid file type. Only PDF is allowed.', 400);
            }

            const fileExtension = type.split('/')[1];
            const id = uuidv4()
            const fileKey = `property-Documents/${propertyId}/${id}.${fileExtension}`;

            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileKey,
                Body: data,
                ContentType: type
            };

            try {
                await s3Client.send(new PutObjectCommand(uploadParams));
            } catch (s3Error) {
                console.error("S3 upload error:", s3Error);
                return response.error('Failed to upload file to S3', 500);
            }

            const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
            const fileDoc = {
                document_name: filename,
                id: id,
                document_url: fileUrl,
            }
            uploadedFiles.push(fileDoc);
        }

        // Update property with new documents
        try {
            await db.collection('properties').updateOne(
                { _id: propertyId }, 
                { $push: { "verification.documents": { $each: uploadedFiles } } }
            );
        } catch (updateError) {
            console.error("Database update error:", updateError);
            return response.error('Failed to update property with documents', 500);
        }

        return response.success({ 
            message: 'Documents uploaded successfully', 
            documents: uploadedFiles,
            count: uploadedFiles.length
        }, 200);
    } catch (error) {
        console.error('Upload property documents error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = { handler };