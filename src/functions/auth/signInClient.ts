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

    const token = await authClient(username, password);
    return sendResponse(200, { token });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'UserNotFoundException') {
      await createUser(clientData);
      const token = await authenticateCognitoUser(clientPoolData);
      return sendResponse(200, { token });
    }
    console.log(error);
    return sendResponse(401, { mensagem: 'Falha na autenticar do usuario' });
  }
}

export { handler };
