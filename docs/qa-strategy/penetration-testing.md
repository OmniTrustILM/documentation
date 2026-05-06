---
sidebar_position: 21
---

# Penetration Testing

Penetration testing is focused on testing the security of the platform. The penetration testing is executed by the external and independent individual or company that is specialized in this area. The penetration testing is executed on the production-like environment.

## Penetration testing scope

Penetration testing is performed on the platform with core components running on the production-like environment.
The type of penetration testing is white box, which means that the penetration tester has access to the source code of the platform, full deployment and network information, including documentation and credentials, and is able to use it for the purpose of the penetration testing.

White box testing should cover as many attack vectors as possible.

The penetration testing is focused on the following areas:
- Authentication
- Authorization
- Data protection
- Data integrity

## Penetration testing requirements

- Penetration testing must be executed on the production-like environment
- Penetration testing must be executed by the external and independent individual or company
- Penetration testing must be executed on the platform with core components running
- Penetration testing must be executed on the platform with the latest version of the core components
- Penetration tester must have access to the source code of the platform
- Penetration tester must have access to the full deployment and network information, including documentation and credentials
- Penetration tester must have appropriate knowledge and experience in penetration testing (OSCP, CEH, etc.)

## Vulnerability ranking

Every vulnerability must be ranked according [Common Vulnerability Scoring System (CVSS)](https://www.first.org/cvss/). The only exception may be vulnerability ranking from the vendor of 3rd party dependency.

The CVSS provides an open framework for communicating the characteristics and impacts of IT vulnerabilities. Its quantitative model ensures repeatable accurate measurement while enabling users to see the underlying vulnerability characteristics that were used to generate the ranking.

Ranking should be calculated in accordance with the CVSS framework, and mapped to one of the following severity categories:

| Severity | CVSS Score |
|----------|------------|
| Critical | 9.0 - 10.0 |
| High     | 7.0 - 8.9  |
| Medium   | 4.0 - 6.9  |
| Low      | 0.1 - 3.9  |
