import { AdminCreateUserRequest, DeliveryMediumType } from '@aws-sdk/client-cognito-identity-provider';
import { ICognitoUserPoolData } from 'amazon-cognito-identity-js';

export type AuthenticationDataType = {
  Username: string;
  Password: string;
}

export interface ICognitoInput extends AdminCreateUserRequest {
  UserPoolId: string;
  TemporaryPassword: string;
  Username: string;
  MessageAction?: 'RESEND' | 'SUPPRESS';
  DesiredDeliveryMediums?: DeliveryMediumType[];
}

export interface IPoolData extends ICognitoUserPoolData {
  UserPoolId: string;
  ClientId: string;
}
