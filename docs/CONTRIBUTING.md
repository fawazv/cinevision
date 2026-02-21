# Contributing to CineVision

Thank you for your interest in contributing to CineVision! This guide will help you get started.

---

## Development Setup

1. **Fork** the repository and clone your fork
2. Install dependencies: `cd server && npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Start the dev server: `npx nodemon src/index.js`

---

## Branch Naming

| Type | Format | Example |
|---|---|---|
| Feature | `feature/description` | `feature/multi-camera-ui` |
| Bug Fix | `fix/description` | `fix/gesture-jitter` |
| Docs | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/scene-store` |

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pinch-to-zoom gesture
fix: resolve camera orbit drift
docs: update API reference for export endpoints
refactor: extract gesture classifier into separate module
test: add unit tests for script parser
```

---

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure all existing tests pass
4. Add tests for new functionality
5. Update documentation if behavior changes
6. Open a PR with a clear description of what and why

---

## Code Style

- **JavaScript/TypeScript** — Use ESLint with the project config
- **React** — Functional components with hooks
- **Naming** — camelCase for variables/functions, PascalCase for components/classes
- **Comments** — Explain *why*, not *what*

---

## Areas We Need Help

- 🎨 **3D Assets** — Low-poly environment props (GLTF format)
- 🤖 **Gesture Recognition** — Improving classifier accuracy
- 📱 **Mobile Support** — Touch-based fallback controls
- 🌍 **i18n** — Translations for the UI
- 📝 **Documentation** — Tutorials, guides, and examples
- 🧪 **Testing** — Unit and integration tests

---

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
