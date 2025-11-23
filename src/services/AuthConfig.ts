export const oneDriveConfig = {
  clientId: "a720470f-3893-441b-ba48-81aa16e9027d",
  redirectUrl: "msauth.com.credentialvault://auth",
  scopes: [
    "offline_access",
    "openid",
    "profile",
    "Files.ReadWrite",
    "User.Read"
  ],
  serviceConfiguration: {
    authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token"
  }
};
