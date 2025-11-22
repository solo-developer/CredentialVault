export const oneDriveConfig = {
  clientId: "668bde74-a6c1-4825-b6cc-4fc9cb05697b",
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
