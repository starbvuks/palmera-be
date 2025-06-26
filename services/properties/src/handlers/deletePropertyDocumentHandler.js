const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Property ID is required", 400);
        }

        if (!event.pathParameters || !event.pathParameters.docId) {
            return response.error("Document ID is required", 400);
        }

        const propertyId = event.pathParameters.id;
        const documentId = event.pathParameters.docId;

        // Validate property ID format (basic validation)
        if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
            return response.error("Invalid property ID format", 400);
        }

        // Validate document ID format (basic validation)
        if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
            return response.error("Invalid document ID format", 400);
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

        if (!property.verification || !property.verification.documents) {
            return response.error('No documents found for this property', 404);
        }

        // Check if document exists
        const documentExists = property.verification.documents.some(doc => doc.id === documentId);
        if (!documentExists) {
            return response.error('Document not found', 404);
        }

        // Filter out the document to be deleted
        const updatedDocuments = property.verification.documents.filter(file => file.id !== documentId);

        // Update property with filtered documents
        try {
            await db.collection('properties').updateOne(
                { _id: propertyId }, 
                { $set: { "verification.documents": updatedDocuments } }
            );
        } catch (updateError) {
            console.error("Database update error:", updateError);
            return response.error('Failed to delete document', 500);
        }

        return response.success({
            message: 'Document deleted successfully',
            documentId,
            remainingDocuments: updatedDocuments.length
        });
    } catch (error) {
        console.error('Delete property document error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};