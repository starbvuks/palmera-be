const { connectToDatabase } = require('../lib/mongodb');
const response = require('../lib/response');

const handler = async (event) => {


    try {
        const propertyId = event.pathParameters['id'];
        const { Images } = JSON.parse(event.body);
        if (!Images) {
            return response.error('Images are required', 400);
        }
        // Connect to MongoDB
        const db = await connectToDatabase();
        // Check if property exists
        const property = await db.collection('properties').findOne({ _id: propertyId });
        if (!property) {
            return response.error('property not found', 404);
        }

        if (!property.media || !property.media.photos) {
            return response.error('images not found', 404);
        }

        const updatedImages = property.verification.documents.filter(id => !Images.includes(id));
        await db.collection('properties').updateOne({ _id: propertyId }, { $set: { "media.photos": updatedImages } });

        return response.success({
            message: 'Deleted image  successfully '
        });
    } catch (error) {
        console.error('Delete image error:', error);
        return response.error('Internal server error', 500);
    }
};

module.exports = {
    handler,
};