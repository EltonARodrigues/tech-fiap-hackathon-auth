export type UserConfirmationData = {
  Username: string;
  UserPoolId: string | undefined;
}

export type UserDataUserPoolType = {
  Username: string;
  Password?: string;
  NewPassword?: string;
  UserPoolId: string | undefined;
  ClientId: string | undefined;
  IdentityPoolId: string | undefined;
}