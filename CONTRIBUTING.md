# Contributing to MOD

Thank you for your interest in contributing to MOD! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mod.git
   cd mod
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Project Structure

```
mod/
├── packages/
│   ├── core/          # Main library (@mode-7/mod)
│   └── demo/          # Playground application
├── docs/              # Documentation (VitePress)
└── README.md
```

### Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clear, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm run test          # Run tests
   npm run build         # Build the package
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep components focused and composable

## Component Guidelines

### Creating a New Audio Module

1. **Create the component** in `packages/core/src/components/`:
   ```typescript
   export interface YourComponentProps {
     input: ModStreamRef;
     output: ModStreamRef;
     // ... your props
   }

   export const YourComponent: React.FC<YourComponentProps> = ({
     input,
     output,
     // ...
   }) => {
     // Implementation
   };
   ```

2. **Export from index.ts**:
   ```typescript
   export { YourComponent } from './components/your-component';
   export type { YourComponentProps } from './components/your-component';
   ```

3. **Write tests** in `packages/core/src/__tests__/YourComponent.test.tsx`

4. **Add documentation** in `docs/api/category/your-component.md`

5. **Add to playground** in `packages/demo/src/`:
   - Add to `moduleDefinitions.ts`
   - Add rendering case in `ModuleRenderer.tsx`

6. **Update LLM guide** in `docs/llm-guide.md`

## Documentation

- All public APIs should be documented
- Use clear, concise language
- Include code examples
- Update the LLM guide for new components

## Testing

- Write unit tests for new components
- Test audio processing logic
- Test React component behavior
- Ensure existing tests pass

## Pull Request Guidelines

- **One feature per PR** - Keep PRs focused
- **Clear description** - Explain what and why
- **Update documentation** - Include doc changes
- **Pass all tests** - Ensure CI passes
- **Follow code style** - Match existing patterns

## Reporting Issues

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Code examples if applicable

## Feature Requests

We welcome feature requests! Please:
- Check if it already exists in issues
- Describe the use case
- Explain why it would be valuable
- Consider if it fits the project scope

## Questions?

Feel free to open an issue for questions or join discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
