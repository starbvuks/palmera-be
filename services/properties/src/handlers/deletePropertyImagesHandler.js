const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {
    try {
        // Validate path parameters
        if (!event.pathParameters || !event.pathParameters.id) {
            return response.error("Property ID is required", 400);
        }

        const propertyId = event.pathParameters.id;

        // Validate property ID format (basic validation)
        if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
            return response.error("Invalid property ID format", 400);
        }

        // Validate request body
        if (!event.body) {
            return response.error("Request body is required", 400);
        }

        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return response.error("Invalid JSON in request body", 400);
        }

        const { Images } = requestData;
        if (!Images || !Array.isArray(Images) || Images.length === 0) {
            return response.error('Images array is required and must not be empty', 400);
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

        if (!property.media || !property.media.photos) {
            return response.error('No images found for this property', 404);
        }

        // Filter out the images to be deleted
        const updatedImages = property.media.photos.filter(imageUrl => !Images.includes(imageUrl));

        // Check if any images were actually found to delete
        if (updatedImages.length === property.media.photos.length) {
            return response.error('None of the specified images were found', 404);
        }

        // Update property with filtered images
        try {
            await db.collection('properties').updateOne(
                { _id: propertyId }, 
                { $set: { "media.photos": updatedImages } }
            );
        } catch (updateError) {
            console.error("Database update error:", updateError);
            return response.error('Failed to delete images', 500);
        }

        const deletedCount = property.media.photos.length - updatedImages.length;

        return response.success({
            message: `Successfully deleted ${deletedCount} image(s)`,
            deletedCount,
            remainingImages: updatedImages.length
        });
    } catch (error) {
        console.error('Delete property images error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};