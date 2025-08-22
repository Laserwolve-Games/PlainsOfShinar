# Contributing to Plains of Shinar

Thank you for your interest in contributing to Plains of Shinar! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Development Environment

Plains of Shinar is built using Pixi.js and modern web technologies. To contribute:

### Prerequisites

- Node.js (latest LTS version)
- Modern web browser with WebGPU support
- Code editor with TypeScript/JavaScript support
- Basic understanding of Pixi.js and WebGPU

### Setup

1. Install dependencies (if any):
   ```bash
   npm install
   ```

2. Start a local development server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. Open your browser to `http://localhost:8000`

## Code Style and Standards

### JavaScript/TypeScript

- Use ES6+ features and modules
- Follow consistent naming conventions (camelCase for variables/functions)
- Write clear, descriptive comments
- Use meaningful variable and function names
- Implement proper error handling

### Code Organization

- Keep modules small and focused
- Separate concerns (rendering, game logic, input handling)
- Follow the existing project structure
- Use meaningful file and folder names

### Performance

- Optimize for WebGPU rendering
- Minimize memory allocations in update loops
- Use object pooling for frequently created/destroyed objects
- Profile performance changes

## Submitting Changes

### Pull Requests

1. Ensure your code follows the project's coding standards
2. Write clear, descriptive commit messages
3. Include a detailed description of your changes
4. Reference any related issues
5. Test across different browsers and devices
6. Ensure performance is not negatively impacted

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Browser console errors (if any)
- Screenshots or videos if applicable

### Feature Requests

For new features:

- Describe the feature and its use case
- Explain why it would benefit the project
- Consider the scope and complexity
- Provide mockups or examples if applicable

## Testing Guidelines

### Manual Testing

- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Verify WebGPU compatibility
- Check mobile device performance
- Test with different screen sizes and orientations

### Performance Testing

- Monitor frame rate and memory usage
- Test with lower-end devices
- Profile rendering performance
- Check for memory leaks

## Code Review Process

All submissions require review before merging. We look for:

- Code quality and maintainability
- Adherence to project standards
- Proper testing across platforms
- Performance considerations
- Clear documentation

## Areas for Contribution

### Game Development

- Character animations and sprites
- Game mechanics and features
- Performance optimizations
- Bug fixes

### Technical Improvements

- WebGPU optimizations
- Cross-browser compatibility
- Mobile performance
- Asset loading and management

### Documentation

- Code documentation
- User guides
- Developer documentation
- API documentation

## Resources

- [Pixi.js Documentation](https://pixijs.com/)
- [WebGPU Specification](https://gpuweb.github.io/gpuweb/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Game Development Patterns](https://gameprogrammingpatterns.com/)

## Questions?

If you have questions about contributing:

- Open an issue for discussion
- Check existing issues and pull requests
- Review the project documentation

Thank you for contributing to Plains of Shinar!
