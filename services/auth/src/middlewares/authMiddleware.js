const jwt = require('jsonwebtoken');

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
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
  };

  return authResponse;
};

const verifyToken = async (event) => {
  try {
    const token = event.authorizationToken;

    if (!token) {
      throw new Error('No token provided');
    }

    if (!token.startsWith('Bearer ')) {
      throw new Error('Invalid token format');
    }

    const tokenValue = token.split(' ')[1];
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    return generatePolicy(decoded.userId, 'Allow', event.methodArn);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

module.exports = {
  verifyToken,
}; 