# Water Bottle App

A simple water intake tracking web app.

## CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

### Verify Merge

- A GitHub Actions workflow (`.github/workflows/verify-merge.yml`) is set up to automatically verify that all pull requests have been successfully merged into the `main` branch. This workflow is triggered on every push to the `main` branch.
