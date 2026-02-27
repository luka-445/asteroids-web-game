# Asteroids Web Game

## Project Overview
A browser version of the Asteroids arcade game from 1979 with an online leaderboard.

## Project Board

# How to Run backend/frontend locally

1. Ensure Node.js is installed. Run the following commands in a terminal
    - node -v
    - npm -v

2. Install Depedencies
    - npm install
    This installs express, better-splite3

3. Start the server
    Open the root folder in the terminal and run this command
     - node src/backend/server.js

4. Open in browser
    Go to: http://localhost:3000/main_page.html

Now you should be able to see the main_page through the server. do not open any html files through folder by double clicking, this will not go through the server.
## Languages and APIs to be used
- WebGL for frontend rendering
- Javascript
- Backend: Node.js
- Relational Database (To be determined)

## Project Structure
- docs/wireframes: 
    This folder houses the most basic design of how the individual web pages will look and that are needed. It also contains a pdf file that describes how they work and how the user can navigate between the screens.
- src/frontend:
    This folder will store all browser code. 

    For example it could contain files such as:
        - index.html
        - main.js
        - WebGL rendering code.
        - game logic.
        - Shaders
        - CSS (if any).
- src/backend:
    This folder will house the server-side code.

    It will handle:
        - Score submissions
        - storing scores
        - querying the database
        - returning leaderboard data
        - validating scores
- src/database:
    This is where database related code and items will be stored.



