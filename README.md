# 🩸 Blood Donation Microservices App

A full-stack, microservices-based web application for managing blood donation subscriptions, blood inventory, and user authentication. Built with React, Node.js, Python, FastAPI, MongoDB, Docker, API Gateway, CI/CD with GitHub Actions, and deployed on AWS.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#️-architecture)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Setup & Installation](#️-setup--installation)
- [Usage](#-usage)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Screenshots & Diagrams](#️-screenshots--diagrams)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Project Overview

This project demonstrates a real-world microservices architecture with multiple backend services communicating via an API Gateway.

- Users can register, login, subscribe to blood donation alerts, and view their subscriptions.
- Admins can manage blood inventory and monitor donation requests.
- The frontend communicates exclusively with the API Gateway, which handles routing and JWT authentication.

**Goal:** Showcase full-stack, microservices, Dockerized development, CI/CD, and deployment skills.

---

## 🏗 Architecture

### High-Level Architecture

### Components

- **Frontend (React + Redux Toolkit + Vite)** – Handles user interaction and visualization.
- **API Gateway (Node.js + Express)** – Routes requests to backend services and handles authentication.
- **Auth Service (Node.js + MongoDB)** – Manages users, registration, login, and JWT issuance.
- **Blood Service (Python + FastAPI + MongoDB)** – Handles blood inventory, subscription management, and data storage.
- **Docker & Docker Compose** – Containerizes all services for consistent local and production environments.
- **AWS Deployment** – Hosted services with environment-specific configuration.

---

## ✨ Features

### User Features
- User registration & login
- Subscribe to blood donation notifications
- View personal subscriptions

### Admin Features
- Add/update blood inventory
- View all subscriptions
- Role-based access control

### General
- JWT-based authentication
- API Gateway for service routing
- Microservices with independent deployments
- Data visualization (optional)
- Map integration (optional)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Redux Toolkit, Vite, Tailwind CSS |
| Backend | Node.js (API Gateway & Auth), Python FastAPI (Blood Service) |
| Database | MongoDB Atlas |
| DevOps | Docker, Docker Compose, GitHub Actions (CI/CD) |
| Deployment | AWS (EC2, S3, or Elastic Beanstalk) |

---

## ⚙️ Setup & Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/blood-microservices.git
cd blood-microservices
```

2. **Create a `.env` file in each service.**

Example `.env`:

```env
PORT=5002
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
```

3. **Build and start all services with Docker Compose:**

```bash
docker compose up --build
```

4. **Access services:**

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| API Gateway | `http://localhost:5000` |
| Auth Service | `http://localhost:5002` |
| Blood Service | `http://localhost:5003` |

---

## 📦 Usage

### User
1. Register → Login
2. Subscribe to blood notifications
3. View your subscriptions

### Admin
1. Login as admin
2. Manage blood inventory
3. View all subscriptions

---

## 🔄 CI/CD Pipeline

GitHub Actions automates:
- Linting & unit tests
- Docker image building
- Deployment to AWS

---

## 🖼 Screenshots & Diagrams

**Frontend Preview**

**Blood Service Dashboard**

**Architecture Diagram**

![Architecture Diagram](diagram.png)



---

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`feature/your-feature`)
3. Commit changes (`git commit -m "feat: your message"`)
4. Push branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).