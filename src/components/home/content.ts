const modules = '/docs/certificate-key/concept-design/modules';

export const trustAreas = [
  {
    id: 'certificates',
    label: 'Certificates',
    role: 'Establish identity',
    title: 'Make identity verifiable.',
    description:
      'Discover and manage certificates across their lifecycle, from issuance and renewal to revocation.',
    href: `${modules}/certificate-management`,
    action: 'Explore certificates',
  },
  {
    id: 'keys',
    label: 'Keys',
    role: 'Protect and prove',
    title: 'Protect the foundations of trust.',
    description:
      'Create, protect and manage cryptographic keys across different technologies and providers.',
    href: `${modules}/key-management`,
    action: 'Explore key management',
  },
  {
    id: 'secrets',
    label: 'Secrets',
    role: 'Enable access',
    title: 'Keep sensitive access under control.',
    description:
      'Store, version and synchronize secrets across vault technologies, with profiles and compliance rules to govern their use.',
    href: `${modules}/secret-management`,
    action: 'Explore secrets',
  },
  {
    id: 'signing',
    label: 'Signing',
    role: 'Verify integrity',
    title: 'Make integrity something you can verify.',
    description:
      'Explore digital signing, native timestamping in preview, and production signing with SignServer.',
    href: '/docs/signing/introduction',
    action: 'Explore digital signing',
  },
] as const;

export type TrustArea = (typeof trustAreas)[number];

export const journeys = [
  {label: 'Learn', description: 'Understand the platform and its core concepts.', href: '/docs'},
  {
    label: 'Deploy',
    description: 'Choose an environment and prepare your installation.',
    href: '/docs/certificate-key/installation-guide/deployment/deployment-options',
  },
  {
    label: 'Operate',
    description: 'Configure the platform for everyday work.',
    href: '/docs/certificate-key/settings/overview',
  },
  {
    label: 'Integrate',
    description: 'Connect your services and infrastructure.',
    href: '/docs/certificate-key/connectors/overview',
  },
] as const;

export const resources = [
  {label: 'API reference', description: 'Explore the APIs and build an integration', href: '/api'},
  {
    label: 'Community',
    description: 'Ask questions, share ideas and contribute',
    href: '/docs/community/overview',
  },
  {
    label: 'Releases',
    description: 'Find current component versions',
    href: '/docs/certificate-key/current-versions',
  },
  {
    label: 'Development lifecycle',
    description: 'Understand how the platform is built',
    href: '/docs/development-lifecycle/overview',
  },
] as const;
