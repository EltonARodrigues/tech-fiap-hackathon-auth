import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient
} from '@aws-sdk/client-cognito-identity-provider';
import { UserConfirmationData } from '../../types/UserTypes';

import { ICognitoInput } from '../../types/CognitoInputTypes';
import { encryptPassword } from '../auth/encryptPassword';

const AWS_REGION = process.env.COGNITO_REGION ?? 'us-east-1';

const client = new CognitoIdentityProviderClient({ region: AWS_REGION });

async function createUser(userData: UserConfirmationData) {

  const input: ICognitoInput = {
    UserPoolId: userData.UserPoolId ?? '',
    TemporaryPassword: encryptPassword(userData.Username),
    Username: userData.Username,
    MessageAction: 'SUPPRESS',
  };

  try {
    const command = new AdminCreateUserCommand(input);
    const response = await client.send(command);
    if (response.User?.Username) {
      return true
    } else {
      throw new Error('usuário não criado')
    }
  } catch (error: unknown) {
    console.error(error);
    throw error;
  }
}

export { createUser };
