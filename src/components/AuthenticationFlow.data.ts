export type AuthenticationProtocol = 'saml' | 'jws';
type ActorId = 'user' | 'client' | 'authority' | 'signing';
export type AuthenticationActor = {id: ActorId; name: string; role: string; description: string};
export type AuthenticationStep = {title: string; description: string; from: ActorId; to: ActorId};
export type AuthenticationFlowData = {
  title: string;
  protocol: string;
  credential: string;
  actors: readonly AuthenticationActor[];
  steps: readonly AuthenticationStep[];
};

export const authenticationFlows: Record<AuthenticationProtocol, AuthenticationFlowData> = {
  saml: {
    title: 'SAML authentication and authorization flow',
    protocol: 'SAML 2.0',
    credential: 'Signed SAML Response',
    actors: [
      {
        id: 'user',
        name: 'Users and applications',
        role: 'Service consumer',
        description: 'Request a service and authenticate.',
      },
      {
        id: 'client',
        name: 'Enterprise application',
        role: 'Client / signing backend',
        description: 'Coordinates authentication and the service request.',
      },
      {
        id: 'authority',
        name: 'SAML authority',
        role: 'Authorization server / identity provider',
        description: 'Authenticates the user and issues a signed SAML Response.',
      },
      {
        id: 'signing',
        name: 'Signing component',
        role: 'Resource server',
        description: 'Validates the response and assertion attributes, then signs or validates.',
      },
    ],
    steps: [
      {
        title: 'Distribute the SAML authority certificate',
        from: 'authority',
        to: 'signing',
        description:
          'The worker in the signing component is configured to trust the SAML authority server’s certificate and its public key. Authorization rules matching assertion attributes from the signed SAML Response are also configured.',
      },
      {
        title: 'Request signing or validation',
        from: 'user',
        to: 'client',
        description:
          'The user requests signing or validation services from the Enterprise application.',
      },
      {
        title: 'Request authentication',
        from: 'client',
        to: 'authority',
        description:
          'The Enterprise application requests authentication from the SAML authority, providing details about the user’s authentication domain.',
      },
      {
        title: 'Provide authentication context',
        from: 'authority',
        to: 'client',
        description:
          'The SAML authority provides the authentication context for the user to the Enterprise application.',
      },
      {
        title: 'Forward authentication context',
        from: 'client',
        to: 'user',
        description:
          'The Enterprise application forwards the authentication context to the user. The user uses this context to authenticate to the SAML authority’s service.',
      },
      {
        title: 'Authenticate the user',
        from: 'user',
        to: 'authority',
        description:
          'The user authenticates using credentials with the Authentication server / Identity provider. When MFA is enabled, there may be multiple rounds in the authentication process.',
      },
      {
        title: 'Produce signed SAML Response',
        from: 'authority',
        to: 'user',
        description:
          'Upon successful authentication, the user receives the signed SAML Response from the SAML authority. The response also contains an AudienceRestriction element to specify the target system for use of the SAML Response.',
      },
      {
        title: 'Forward signed SAML Response',
        from: 'user',
        to: 'client',
        description:
          'The user forwards the signed SAML Response to the Enterprise application as proof of successful authentication and authorization for the signing or validation request.',
      },
      {
        title: 'Submit signing or validation request',
        from: 'client',
        to: 'signing',
        description:
          'The Enterprise application submits the request with the signed SAML Response to the signing component.',
      },
      {
        title: 'Perform the task and provide a response',
        from: 'signing',
        to: 'client',
        description:
          'The signing component validates the signed SAML Response and its assertion attributes, performs the operation and provides a response to the Enterprise application.',
      },
      {
        title: 'Return the response',
        from: 'client',
        to: 'user',
        description:
          'The Enterprise application forwards the signing component’s response to the user.',
      },
    ],
  },
  jws: {
    title: 'Extended JWS authentication and authorization flow',
    protocol: 'Extended JWS',
    credential: 'JWS',
    actors: [
      {
        id: 'user',
        name: 'Users and applications',
        role: 'Service consumer',
        description: 'Request a service and authenticate.',
      },
      {
        id: 'client',
        name: 'Signing backend',
        role: 'Client',
        description: 'Coordinates authentication and the service request.',
      },
      {
        id: 'authority',
        name: 'Authorization server',
        role: 'Token issuer',
        description: 'Authenticates the user and issues a JWS.',
      },
      {
        id: 'signing',
        name: 'Signing component',
        role: 'Resource server',
        description: 'Validates the JWS and its claims, then signs or validates.',
      },
    ],
    steps: [
      {
        title: 'Distribute the authorization server public key',
        from: 'authority',
        to: 'signing',
        description:
          'The worker in the signing component is configured to trust the public key of the authorization server. Authorization rules matching claims of the JWS are also configured.',
      },
      {
        title: 'Request signing or validation',
        from: 'user',
        to: 'client',
        description: 'The user requests signing or validation services from the signing backend.',
      },
      {
        title: 'Request authentication',
        from: 'client',
        to: 'authority',
        description:
          'The signing backend requests authentication from the authorization server, providing details about the user’s authentication domain.',
      },
      {
        title: 'Provide authentication context',
        from: 'authority',
        to: 'client',
        description:
          'The authorization server provides the authentication context for the user to the signing backend.',
      },
      {
        title: 'Forward authentication context',
        from: 'client',
        to: 'user',
        description:
          'The signing backend forwards the authentication context to the user. The user uses this context to authenticate to the authorization server’s service.',
      },
      {
        title: 'Authenticate the user',
        from: 'user',
        to: 'authority',
        description:
          'The user authenticates using credentials with the authorization server. When MFA is enabled, there may be multiple rounds in the authentication process.',
      },
      {
        title: 'Produce JWS',
        from: 'authority',
        to: 'user',
        description:
          'Upon successful authentication, the user receives the JWS from the authorization server.',
      },
      {
        title: 'Forward JWS',
        from: 'user',
        to: 'client',
        description:
          'The user forwards the JWS to the signing backend as proof of successful authentication and authorization for the signing or validation request.',
      },
      {
        title: 'Submit signing or validation request',
        from: 'client',
        to: 'signing',
        description:
          'The signing backend submits the request with the JWS to the signing component.',
      },
      {
        title: 'Perform the task and provide a response',
        from: 'signing',
        to: 'client',
        description:
          'The signing component validates the JWS and its claims, performs the operation and provides a response to the signing backend.',
      },
      {
        title: 'Return the response',
        from: 'client',
        to: 'user',
        description: 'The signing backend forwards the signing component’s response to the user.',
      },
    ],
  },
};
