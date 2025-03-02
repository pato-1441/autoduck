# Autoduck

Autoduck is an automated testing tool that leverages AI to generate and execute Playwright tests based on natural language descriptions. It provides a user-friendly interface to write test steps in plain English and watch them being executed in real-time.

## Features

- ✨ Natural language test step definition
- 🤖 AI-powered test code generation
- 🎬 Real-time test execution visualization
- 📸 Automatic screenshots for each test step
- 📊 Detailed test results and reporting

## Prerequisites

Before setting up Autoduck, make sure you have the following installed:

- Node.js (v18 or later)
- pnpm (v8 or later)
- A modern web browser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/autoduck.git
   cd autoduck
   ```

2. Install dependencies:

   ```bash
   pnpm run setup
   ```

   This will install all dependencies for both frontend and backend.

## Usage

### Development

To start both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:

- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Running only the frontend:

```bash
pnpm dev:front
```

### Running only the backend:

```bash
pnpm dev:back
```

### Build frontend for production

```bash
pnpm build
```

### Building backend for production

```bash
pnpm build:back
```

## Project Structure

```
autoduck/
├── src/                  # Frontend React application
├── backend/              # Backend server
│   ├── services/         # Core backend services
│   ├── utils/            # Utility functions
│   └── scripts/          # Server scripts
│   └── prompts/          # Prompts constants
│   └── routes/               # Route handlers
│       ├── api.js            # Get active browsers socket info
// optional
└── screenshots/          # Test screenshots output
└── videos/          # Test test videos output
```

## Writing Tests

1. Open the application in your browser
2. Enter your API key (for AI services)
3. Specify the target URL to test
4. Write your test steps in plain English, one step per line
   Example:
   ```
   Go to the login page
   Enter "testuser" in the username field
   Enter "password123" in the password field
   Click the login button
   Verify that the dashboard is displayed
   ```
5. Click "Run Tests" to start execution
6. Wait for the test to end and verify with the screenshots that everything is correct

## Troubleshooting

### Browser issues

If you encounter browser connection issues:

- Ensure you have the latest version of your browser
- Check that the backend server is running
- Verify network connectivity between frontend and backend

### Test execution failures

If tests fail to execute:

- Check the browser console for detailed errors
- Verify your API key is valid and has sufficient permissions
- Make sure your test steps are clear and specific

## License

[MIT License](LICENSE)
