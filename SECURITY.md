# Security Policy

## Supported Versions

We provide security updates for the following versions of Plains of Shinar:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Previous| :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Plains of Shinar, please report it responsibly.

### How to Report

1. **Do not** open a public issue
2. Email security concerns to: contact@laserwolvegames.com
3. Include detailed information about the vulnerability
4. Provide steps to reproduce if possible

### What to Include

- Description of the vulnerability
- Potential impact
- Steps to reproduce
- Any suggested fixes (optional)
- Your contact information

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Status Updates**: Weekly until resolved
- **Resolution**: Target within 30 days for critical issues

### Disclosure Policy

- We will work with you to understand and resolve the issue
- We ask that you do not publicly disclose the vulnerability until we have had a chance to address it
- We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Best Practices

When contributing to Plains of Shinar:

- Follow secure coding practices
- Validate all user inputs
- Be cautious with third-party integrations
- Use HTTPS for all external communications
- Sanitize data before rendering in the browser
- Follow Pixi.js security guidelines

## Common Security Considerations

### Client-Side Security

- Validate all user inputs on both client and server
- Protect against XSS attacks
- Use Content Security Policy (CSP) headers
- Sanitize user-generated content

### WebGPU Security

- Follow WebGPU security best practices
- Be aware of GPU-based timing attacks
- Validate shader inputs and outputs

### Data Protection

- Minimize collection of personal data
- Use secure storage for sensitive information
- Implement proper session management
- Follow privacy best practices
