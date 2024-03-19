import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

const AWS_REGION = process.env.COGNITO_REGION ?? 'us-east-1';

async function getToken(result: CognitoUserSession, identityPool: string | undefined, userPoolId: string | undefined) {
  const client = new S3Client({
    region: AWS_REGION,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: AWS_REGION },
      identityPoolId: identityPool as string,
      logins: {
        [`cognito-idp.${AWS_REGION}.amazonaws.com/${userPoolId}`]: result.getIdToken().getJwtToken(),
      },
    })
  });
  await client.config.credentials();
  const accessToken = result.getAccessToken().getJwtToken();
  return accessToken;

}

export { getToken };
