import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';
import jwt from 'jsonwebtoken';

const POOL_CLIENT_CLIENT_ID = process.env.CLIENTES_IDENTITY_POOL_ID as string;

interface DecodedToken {
  sub: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
  client_id: string;
  username: string;
}

async function validateToken(
  userPoolId: string,
  clientId: string,
  token: string
): Promise<string> {
  const verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse: 'access',
    clientId,
  });

  const payload = await verifier.verify(token);
  return payload.sub;
}

async function handler(event: APIGatewayRequestAuthorizerEventV2) {
  const response = {
    isAuthorized: false,
    context: {
      typeUser: '',
      'x-client-id': ''
    },
  };

  try {
    console.log(event);

    const authorization = event?.headers?.authorization;

    if (!authorization) {
      return response;
    }

    const token = authorization?.split(' ')[1];
    const decodedToken = jwt.decode(token) as DecodedToken;

    if (!decodedToken) {
      return response;
    }

    console.log(`Decoded Token: ${JSON.stringify(decodedToken)}`);
    response.context['x-client-id'] = decodedToken.client_id;

    const PoolRegex = /([^/]+)$/;
    const getPoolIdMatch = decodedToken?.iss?.match(PoolRegex);
    if (!getPoolIdMatch) {
      return response;
    }

    const getPoolId = getPoolIdMatch[1];
    validateToken(
      getPoolId,
      POOL_CLIENT_CLIENT_ID,
      token
    );

    response.isAuthorized = true;
    return response;
  } catch (err) {
    console.log(err);
  }
  response.isAuthorized = false;
  return response;
}

export { handler };
