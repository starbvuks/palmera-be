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
    try {
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
        if (!boundary) {
            throw new Error('Could not extract boundary from content-type');
        }

        const parts = parseMultipart.Parse(bodyBuffer, boundary);
        console.log('Extracted parts:', parts.length);
        return parts;
    } catch (error) {
        console.error('Error extracting files:', error);
        throw error;
    }
}

const handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const userId = event.pathParameters?.id;
        if (!userId) {
            return response.error('User ID is required', 400);
        }

        console.log('Processing upload for user:', userId);

        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ _id: userId });
        if (!user) {
            return response.error('User not found', 404);
        }

        const parts = extractFiles(event);
        if (!parts || parts.length === 0) {
            return response.error('No files uploaded', 400);
        }

        console.log('Processing', parts.length, 'files');

        const allowedTypes = ['application/pdf'];
        const uploadedFiles = [];
        
        for (const file of parts) {
            const { filename, type, data } = file;
            console.log('Processing file:', filename, 'type:', type);
            
            if (!data || !filename || !type) {
                return response.error('Invalid file upload - missing data, filename, or type', 400);
            }
            if (!allowedTypes.includes(type)) {
                return response.error(`Invalid file type: ${type}. Only PDF is allowed.`, 400);
            }

            const fileExtension = type.split('/')[1];
            const id = uuidv4();
            const fileKey = `user_documents/${userId}/${id}.${fileExtension}`;

            console.log('Uploading to S3:', fileKey);

            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileKey,
                Body: data,
                ContentType: type
            };

            // Use the new AWS SDK v3
            await s3Client.send(new PutObjectCommand(uploadParams));
            
            const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
            const fileDoc = {
                document_name: filename,
                id: id,
                document_url: fileUrl,
                document_type: 'other', // Default type, can be enhanced later
                uploadedAt: new Date().toISOString()
            };
            uploadedFiles.push(fileDoc);
            console.log('File uploaded successfully:', fileUrl);
        }
        
        console.log('Updating user document list in database');
        await db.collection('users').updateOne(
            { _id: userId }, 
            { $push: { "hostDetails.verification.documents": { $each: uploadedFiles } } }
        );

        console.log('Upload completed successfully');
        return response.success({ 
            message: 'Documents uploaded successfully', 
            documents: uploadedFiles,
            count: uploadedFiles.length
        }, 200);
    } catch (error) {
        console.error('Upload document error:', error);
        return response.error(`Internal server error: ${error.message}`, 500);
    }
};

module.exports = { handler };