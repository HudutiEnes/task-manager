# Task Manager

<p align="center">
  A full-stack task management application built with React, Tailwind CSS, Node.js, and Express.js.
  <br />
  Containerized with Docker Compose and supported by a security-focused networking setup.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
</p>

---

## Overview

Task Manager is a full-stack web application designed to manage everyday tasks through a responsive user interface and a RESTful backend API.

The frontend is built with React and styled using Tailwind CSS, providing an interface for interacting with tasks. The backend uses Node.js and Express.js to handle API requests, application logic, validation, and authentication.

The application is containerized using Docker Compose, allowing the frontend and backend components to run together in an organized environment.

Beyond application development, this project explores practical infrastructure concepts, including reverse proxy configuration, HTTPS, firewall management, service networking, and application logging.

## Features

### Frontend

- React-based user interface.
- Tailwind CSS styling.
- Communication with the backend through REST API requests.
- Task management through the application interface.
- Separation between presentation and backend application logic.

### Backend & API

- RESTful API built with Express.js.
- Create, read, update, and delete task operations.
- Modular routing and controller structure.
- Task status validation.
- Centralized error-handling middleware.
- HTTP request logging with Morgan.
- User registration and login functionality.
- Password hashing with bcrypt.

### Infrastructure & DevOps

- Multi-service application orchestration with Docker Compose.
- Containerized frontend and backend components.
- Nginx reverse proxy.
- HTTPS configuration using a self-signed RSA-2048 certificate.
- Fedora Firewalld integration.
- Custom firewall zone for controlled network access.
- Automated firewall configuration script.
- Health-check script for application availability.

---

## Architecture

The application follows a frontend/backend architecture, with Docker Compose coordinating the application services.

```text
                    USER
                     |
                     v
                WEB BROWSER
                     |
                     v
              REACT FRONTEND
             + TAILWIND CSS
                     |
               REST API REQUESTS
                     |
                     v
              EXPRESS BACKEND
                  :3000
                     |
          +----------+----------+
          |          |          |
          v          v          v
        ROUTES   CONTROLLERS  MIDDLEWARE
          |          |          |
          +----------+----------+
                     |
                     v
               APPLICATION DATA


          DOCKER COMPOSE
       Orchestrates application
              services
```

### Application Communication

1. The user interacts with the React frontend through a web browser.
2. The frontend sends HTTP requests to the backend API.
3. Express receives requests and passes them through the appropriate middleware and routes.
4. Controllers process the requested operations.
5. The backend returns JSON responses to the frontend.
6. Docker Compose coordinates the services and their networking.

Nginx provides an additional reverse-proxy layer for controlled application access.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface |
| Styling | Tailwind CSS | Responsive UI styling |
| Backend | Node.js | JavaScript runtime |
| API | Express.js | REST API and application logic |
| Authentication | bcrypt | Password hashing |
| Logging | Morgan | HTTP request logging |
| Containerization | Docker | Application containers |
| Orchestration | Docker Compose | Multi-service management |
| Reverse Proxy | Nginx | Traffic routing and HTTPS |
| Firewall | Fedora Firewalld | Network access control |
| Scripting | Bash / Python | Infrastructure automation and health checks |

---

## Project Structure

```text
task-manager/
│
├── client/                  # React frontend
│   ├── src/
│   └── ...
│
├── src/                     # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── database/
│   └── server.js
│
├── nginx/                   # Nginx configuration
│
├── scripts/
│   ├── setup-firewall.sh    # Firewall automation
│   └── health_check.py      # Application health check
│
├── logs/                    # Application logs
│
├── tasks.json               # Task data
├── users.json               # User data
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── config.json.example
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure the following tools are installed:

- Git
- Docker Engine
- Docker Compose plugin
- Bash

### 1. Clone the repository

```bash
git clone https://github.com/HudutiEnes/task-manager.git

cd task-manager
```

### 2. Configure environment

Review the provided example configuration:

```bash
cp .env.example .env
```

Adjust environment values if required by your Docker Compose configuration.

### 3. Build and start the application

Start the complete application stack:

```bash
docker compose up --build -d
```

Docker Compose builds the application images and starts the configured services.

### 4. Verify running containers

```bash
docker compose ps
```

Inspect application logs:

```bash
docker compose logs -f
```

### 5. Stop the application

```bash
docker compose down
```

To stop the application and remove its containers without deleting named volumes:

```bash
docker compose down
```

---

## API Reference

The backend exposes RESTful endpoints under the `/api/v1` prefix.

### Task Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tasks` | Retrieve all tasks |
| GET | `/api/v1/tasks/:id` | Retrieve a task by ID |
| POST | `/api/v1/tasks` | Create a task |
| PUT | `/api/v1/tasks` | Update a task |
| DELETE | `/api/v1/tasks/:id` | Delete a task |

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| GET | `/api/v1/auth/login` | Authenticate an existing user |

### Example: Create a Task

```http
POST /api/v1/tasks
Content-Type: application/json
```

```json
{
  "title": "Finish infrastructure setup",
  "status": "in-progress",
  "dueDate": "2026-12-01"
}
```

### Supported Task Statuses

| Status | Description |
|---|---|
| `pending` | Task has not been started |
| `in-progress` | Task is currently being worked on |
| `completed` | Task has been completed |

Unsupported status values are rejected by the API validation logic.

---

## Infrastructure & Security

A major part of this project is understanding how application services interact with the host operating system and network infrastructure.

### 1. Docker & Docker Compose

Docker is used to package the application components into containers.

Docker Compose coordinates the services, providing a repeatable way to build, start, inspect, and stop the application stack.

This approach makes the application easier to run consistently across different environments.

### 2. Nginx Reverse Proxy

Nginx acts as an entry point for incoming application traffic.

It provides a reverse-proxy layer between external requests and the internal Express application.

The configuration includes:

- HTTP access through port `8080`.
- HTTPS access through port `443`.
- Self-signed RSA-2048 TLS certificate.
- Forwarding requests to the internal application server.

For local HTTPS testing:

```bash
curl -k https://localhost
```

The `-k` option bypasses certificate verification because the certificate is self-signed. It is intended for local testing, not as a production certificate-validation practice.

### 3. Firewall Management with Firewalld

The host system uses Fedora's native Firewalld for network access control.

A custom `devops-projects` zone is configured to restrict communication to the required TCP ports.

The project includes an automation script:

```bash
chmod +x ./scripts/setup-firewall.sh

sudo ./scripts/setup-firewall.sh
```

This makes firewall configuration repeatable and easier to manage.

### 4. Logging & Health Checks

Application visibility is supported through:

- Morgan HTTP request logging.
- Access logs stored in the `logs/` directory.
- A dedicated application health-check endpoint.
- A Python health-check script.

These components help with basic application monitoring and troubleshooting.

---

## Future Improvements

Potential next steps for the project:

- Complete PostgreSQL integration for persistent application data.
- Introduce token-based authentication and protected API routes.
- Add automated backend and frontend tests.
- Improve container health checks and dependency management.
- Add CI/CD pipelines using GitHub Actions.
- Introduce production-ready HTTPS certificates.
- Improve application monitoring and operational visibility.
- Add API documentation using OpenAPI / Swagger.

---

## What This Project Demonstrates

This project combines several practical software development and infrastructure concepts:

- Full-stack application development.
- React frontend development and component-based UI design.
- REST API design and backend architecture.
- Containerization with Docker.
- Multi-service orchestration using Docker Compose.
- Frontend/backend communication.
- Reverse proxy configuration with Nginx.
- HTTPS and certificate configuration.
- Linux firewall management with Firewalld.
- Infrastructure automation using Bash.
- Application logging and health checks.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://github.com/HudutiEnes">Enes Huduti</a>
  <br />
  <a href="https://github.com/HudutiEnes/task-manager">GitHub Repository</a>
</p>
