import { APIGatewayEvent } from 'aws-lambda';

import { authenticateCognitoUser } from '../../middleware/provider/authenticateUser';
import { createUser } from '../../middleware/provider/cognitoOperations';
import { authClient } from '../../middleware/provider/confirmUser';
import { IAuthUserRequest } from '../../types/RequestTypes';
import sendResponse from '../../utils/sendResponse';

async function handler(event: APIGatewayEvent) {
  const body: IAuthUserRequest = JSON.parse(event.body as string);
  const { username, password } = body;

  const clientData = {
    Username: username,
    UserPoolId: process.env.CLIENTES_POOL_ID
  }

  const clientPoolData = {
    Username: username,
    UserPoolId: process.env.CLIENTES_POOL_ID,
    ClientId: process.env.CLIENTES_POOL_CLIENT_ID,
    IdentityPoolId: process.env.CLIENTES_IDENTITY_POOL_ID,
    NewPassword: password
  }

  try {
    await createUser(clientData);
    const token = await authenticateCognitoUser(clientPoolData);
    return sendResponse(200, { token });

  } catch (error: unknown) {
    try {
      if(error instanceof Error ) {
        console.log(error.name)
      }
      if (error instanceof Error && (error.name === 'UsernameExistsException' || error.name === 'NotAuthorizedException')) {
        const token = await authClient(username, password);
        return sendResponse(200, { token });
      }

    } catch(err) {
      return sendResponse(401, { mensagem: 'Login failed, contact supervisor' });
    }
  }
  return sendResponse(500, { mensagem: 'Login failed, contact supervisor' }); 
}

export { handler };
