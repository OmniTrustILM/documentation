---
sidebar_position: 11
---

# Code Review

Code review is a process of reviewing the code changes by the other developers before the code is merged in the code base. Code review helps to ensure that coding best practices and conventions are being followed and that changes in the source code are compliant.

## Quality code review

The purpose of quality code review is to review changes of the source code from the quality metrics point of view.

Quality code review must be done by different developer than one who committed changes, with relevant knowledge of code review techniques and coding practice.

### Code quality requirements

- **Unit test coverage** should be **at least 70%**.
- **Duplication** in code must be measured. Metric must be **lower than 5%**.

### Quality code review checklist

The following checklist is used for the quality code review:

- [ ] do all changes perform as intended?
- [ ] is source code written according conventions and understandable?
- [ ] is source code modular?
- [ ] are exceptions handled properly?
- [ ] is logging implemented correctly?
- [ ] are comments and TODOs resolved?
- [ ] does source code conform to quality requirements?
- [ ] are unit tests written for all public methods?

## Security code review

The purpose of security code review is to check if the changes in the source code are done according secure coding guidelines.

Security code review must be done by different developer than one who committed changes, with relevant knowledge of code review techniques and secure coding practice.

### Code security requirements

- Source code does not contain major security vulnerabilities according to [OWASP Top 10](https://owasp.org/www-project-top-ten/).
- Static Analysis Security Testing (SAST) is used to test the source code for security vulnerabilities.

### Security code review checklist

The following checklist is used for the security code review:

- [ ] are all inputs and requests data validated?
- [ ] is software protected from XSS and XSRF?
- [ ] is authentication and session management implemented securely?
- [ ] is cryptography properly configured for encryption of the data?
- [ ] does the communication security meets cryptography standards?
- [ ] is software protected from buffer overflow?
- [ ] does dependency check contain high security vulnerabilities?
- [ ] does static security code analysis contain issues?
- [ ] OWASP Application Security Verification Standard test report validated?
