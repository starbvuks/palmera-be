const jwt = require('jsonwebtoken');

const generatePolicy = (principalId, effect, resource, context = {}) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
  context, // all values must be strings
});

const verifyToken = async (event) => {
  console.log('Incoming authorizer event:', JSON.stringify(event));

  try {
    const token = event.authorizationToken;

    if (!token) throw new Error('No token provided');
    if (!token.startsWith('Bearer ')) throw new Error('Invalid token format');

    const tokenValue = token.split(' ')[1];
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Construct wildcard ARN: covers all methods and resources
    const methodArnParts = event.methodArn.split(':');
    const region = methodArnParts[3];
    const accountId = methodArnParts[4];
    const apiGatewayArnPart = methodArnParts[5]; // e.g. "api-id/stage/GET/resource"
    const [apiId, stage] = apiGatewayArnPart.split('/');

    const wildcardArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/${stage}/*`;

    console.log('Auth successful. User ID:', decoded.userId);
    console.log('Returning Allow policy for:', wildcardArn);

    return generatePolicy(
      decoded.userId,
      'Allow',
      wildcardArn,
      {
        userId: decoded.userId.toString(), // must be strings
        role: decoded.role ? decoded.role.toString() : 'user',
      }
    );

  } catch (error) {
    console.error('Token verification failed:', error.message);

    // Use original methodArn to deny only the requested route
    return generatePolicy('unauthorized', 'Deny', event.methodArn);
  }
};

module.exports = {
  verifyToken,
};
