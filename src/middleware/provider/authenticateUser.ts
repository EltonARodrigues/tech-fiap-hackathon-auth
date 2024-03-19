
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

import { AuthenticationDataType, IPoolData } from '../../types/CognitoInputTypes';
import { UserDataUserPoolType } from '../../types/UserTypes';
import { encryptPassword } from '../auth/encryptPassword';
import { getToken } from '../auth/getToken';

async function authenticateCognitoUser(userDataPoolData: UserDataUserPoolType) {
  const authenticationData: AuthenticationDataType = {
    Username: userDataPoolData.Username,
    Password: userDataPoolData.Password ? userDataPoolData.Password : encryptPassword(userDataPoolData.Username),
  };

  const authenticationDetails = new AuthenticationDetails(authenticationData);

  const poolData: IPoolData = {
    UserPoolId: userDataPoolData.UserPoolId ?? '',
    ClientId: userDataPoolData.ClientId ?? '',
  };

  const userPool = new CognitoUserPool(poolData);
  const userData = {
    Username: userDataPoolData.Username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  const token = new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        try {
          const res = await getToken(result, userDataPoolData.IdentityPoolId, userDataPoolData.UserPoolId);
          resolve(res);

        } catch (err) {
          console.error('falha na autenticação', err);
          reject(err);
        }
      },
      onFailure: (err: Error) => {
        console.error('falha na autenticação', err);
        reject(err);
      },
      newPasswordRequired: () => {
        cognitoUser.completeNewPasswordChallenge(
          userDataPoolData.NewPassword ?? authenticationData.Password,
          null,
          {
            onSuccess: async () => {
              userDataPoolData.Password = userDataPoolData.NewPassword;
              resolve(authenticateCognitoUser(userDataPoolData));
            },
            onFailure: (err: Error): void => {
              console.error('falha na criação da nova senha');
              reject(err)
                ;
            }
          }
        );
      },
    });
  })
  return token;
}

export { authenticateCognitoUser };
