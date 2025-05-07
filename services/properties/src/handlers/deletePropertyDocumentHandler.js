const { connectToDatabase } = require('../../../auth/src/lib/mongodb');
const response = require('../../../auth/src/lib/response');

const handler = async (event) => {


    try {
        const propertyId = event.pathParameters['id'];
        const documnetId = event.pathParameters['docId'];

        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if property exists
        const property = await db.collection('properties').findOne({ _id: propertyId });
        if (!property) {
            return response.error('property not found', 404);
        }

        if (!property.verification || !property.verification.documents) {
            return response.error('documents not found', 404);
        }

        const updatedDocuments = property.verification.documents.filter(file => file.id !== documnetId);
        await db.collection('properties').updateOne({ _id: propertyId }, { $set: { "verification.documents": updatedDocuments } });
        return response.success({
            message: 'Deleted document  successfully '
        });
    } catch (error) {
        console.error('Delete document error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};