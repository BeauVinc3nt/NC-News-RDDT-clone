Full; Stack Reddit clone 

Live project demo link: https://beaunews.netlify.app/

---

This project is a reddit clone built from the ground up - from server side all the way to a consistent front-end.

The server is built via express, tested via supertest + Jest and hosted on Netlify (https://www.netlify.com/) with the database hosted via Supabase (https://supabase.com/).

When switching between testing, development and production, different .env files were used to test the data on a variety of appropriate databases for simplicity.

When testing, you must install supertest as a developer dependency for your environment through the following command: "npm install --save-dev supertest"

SETUP INSTRUCTIONS:

- Ensure npm (node package manager) is installed to download packages
- Run "npm install" to install all dependencies from the package.json to run the project.
- If a problem occurs with the package.json, run "npm init -y" in the command line to create a package.json with all required dependencies to run the project.

- Before testing or running the database for the first time, it is important to set up the database locally so that you can run the project.

Local database setup process: 
1. npm run setupdbs - creates an instance of the project database on your local machine (if the database exists => it will drop it and create a new one).
2. npm run seed- this will seed the newly created database with the appropriate data, populating tables and sample/ required data for the project (e.g. user tables, articles and comments)
3. npm run start - this will start the listening of the express server on the specified port to host the project locally via your machine. This can be exited by the "ctrl + z" command to stop the server.

If you are hosting the app yourself and decide to make changes, ensure that 'dotenv' and 'pg' are installed as dependencies as opposed to devdependencies as this will not be picked up by render at deployment (this is already done for you in the provided vanilla version of the package.json).
