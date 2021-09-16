# MILPACS Changelog - Now in Typescript

An application that looks for changes in the 7th Cavalry Regiment's MILPACS via the 7Cav API and logs them. Built to eventually integrate with a Pub/Sub system like RabbitMQ to signal other applications that depend on knowing of changes to milpacs.

The system currently looks for the following changes for each trooper:

* New trooper
* Removed/Deleted trooper
* Rank change
* Roster change
* Primary position change
* Secondary position added/removed
* Service record entry added/removed
* Award added/removed

## Setup

* Ensure that you have a postgresql database running. See `ormconfig.json` for connection settings
* Run `npm build`
* Run `npm start`
* Make a GET request to `/api/roster/current?save=1` to create a reference roster entry for the database

## To Do

* ❌ Postgresql Database
* ❌ Pub/Sub service (RabbitMQ? Redis Pub/Sub?)
* ❌ Front end, probably in React.js
* ❌ docker-compose file for solution deployment
* ❌ Create script that pulls initial state of roster. Similar to `/api/roster/current?save=1`
