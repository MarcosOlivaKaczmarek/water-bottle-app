# Water Bottle App

A simple water intake tracking web app.

## CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Deployment.

### Frontend CI/CD

- A GitHub Actions workflow (`.github/workflows/frontend-ci-cd.yml`) is set up to automatically build, test, and deploy the frontend application to Vercel. This workflow is triggered on every push to the `main` branch and on pull requests to the `main` branch.

### Backend CI/CD

- A GitHub Actions workflow (`.github/workflows/backend-ci-cd.yml`) is set up to automatically build, test, and deploy the backend application to Heroku. This workflow is triggered on every push to the `main` branch and on pull requests to the `main` branch.

### Verify Merge

- A GitHub Actions workflow (`.github/workflows/verify-merge.yml`) is set up to automatically verify that all pull requests have been successfully merged into the `main` branch. This workflow is triggered on every push to the `main` branch.
