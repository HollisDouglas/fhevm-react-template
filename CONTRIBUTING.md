# Contributing to FHEVM SDK

Thank you for your interest in contributing to the Universal FHEVM SDK! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue describing:
- The feature you'd like to see
- Why it would be useful
- How it might work

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/fhevm-sdk.git
   cd fhevm-sdk
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run build:sdk
   npm run test:sdk
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test changes
   - `refactor:` - Code refactoring

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing formatting conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for high code coverage

### Documentation

- Update README files when adding features
- Add JSDoc comments for new functions
- Include usage examples

## Project Structure

```
fhevm-sdk-template/
├── packages/fhevm-sdk/    # Core SDK
├── examples/              # Example applications
└── docs/                  # Additional documentation
```

## Questions?

Feel free to ask questions by creating an issue or reaching out to maintainers.

Thank you for contributing!
