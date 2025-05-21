/**
 * Utility functions for formatting API responses
 */

const success = (data, statusCode = 200) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            success: true,
            data,
        }),
    };
};

const error = (message, statusCode = 500) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            success: false,
            error: message,
        }),
    };
};

module.exports = {
    success,
    error,
}; 