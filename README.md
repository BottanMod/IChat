# IChat

IChat App is a real-time chat application built with ASP.NET Core for the backend and React for the frontend. Using Signal R and Websockets. This guide will help you set up the project locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET SDK](https://dotnet.microsoft.com/download) (version 8.0 or higher)
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or any other database you plan to use)

## Clone the Repository

1. Open your terminal or command prompt.
2. Clone the repository using the following command:

   ```bash
   git clone https://github.com/BottanMod/IChat.git
   ```

3. Navigate into the cloned directory:

   ```bash
   cd IChat
   ```

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd IChat.Server
   ```

2. Install the necessary NuGet packages. You can do this by running the following command:

   ```bash
   dotnet restore
   ```

3. Set up your database connection string in `appsettings.json`. Modify the `ConnectionStrings` section to point to your local database.

   ```json
   "ConnectionStrings": {
       "ChatDbConnection": "Server=your_server;Database=your_database;User Id=your_user;Password=your_password;"
   }
   ```

4. Set up your encryption key in `appsettings.json`. Modify the `Encryption` section to add your key.

   ```json
   "Encryption": {
       "Key": "<your-32-bit-encryption-key-here>"
   }
   ```

5. Set up your JWT key in `appsettings.json`. Modify the `JWT` section to add your key.

   ```json
   "TokenSecret": {
       "Key": "<your-32-bit-jwt-key-here>"
   }
   ```

6. Run the database migrations to set up your database schema:

   ```bash
   dotnet ef database update
   ```

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ichat.Client
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `ichat.Client` directory to store your environment variables (like the Encryption Key):

   ```bash
   VITE_ENCRYPTION_KEY=<your-32-bit-key>
   ```

## Database Setup

If you haven't set up your database yet, follow these steps:

1. Ensure your SQL Server is running.
2. Create a new database using SQL Server Management Studio (SSMS) or any other tool.
3. Update your connection string in `appsettings.json` as described in the Backend Setup section.
4. Run update-database EF Tools command to update the database.

## Running the Application

1. Start the backend server:

   ```bash
   dotnet run
   ```

   This will start the server on `https://localhost:7261`.

2. In a new terminal window, navigate to the frontend directory again:

   ```bash
   cd ichat.Client
   ```

3. Start the React application:

   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173` to see the application in action.

## Additional Notes

- Ensure that the backend is running before starting the frontend application.
- If you encounter any issues, check the console for error messages.
- Remember to replace the placeholders in the `appsettings.json` and `.env` file with your actual database credentials and neccessary keys.
- Ensure that the ports for the frontend and backend are correct and change them to the correct ports if needed.