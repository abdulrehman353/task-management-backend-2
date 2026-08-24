# Task Management System

A backend-based **Task Management System** built with **Node.js, Express.js, MySQL, Sequelize ORM, MinIO, and Docker**.

## 🚀 Features

* User Signup & Login
* JWT-based Authentication
* Organization Create, Update & Delete
* Assign / Remove Users from Organizations
* Transfer Organization Ownership
* Organization-specific Logo & Theme
* Project Create, Update & Delete
* Ticket/Task Create, Update & Delete
* Assign Tickets/Tasks to Users
* Ticket/Task Workflow Management
* Attach Images & Files to Tickets using **MinIO Object Storage**
* Roles & Permissions
* Swagger API Documentation
* Database Migrations with Sequelize
* Docker Multi-Container Orchestration

## 🗄️ Database & Storage

The system includes the following main entities:

* Users
* Organizations
* Projects
* Project Members
* Tasks / Tickets
* Comments
* Attachments
* Activity History

**MySQL** is used as the primary database and **Sequelize ORM** is used for models, relationships, and migrations.

**MinIO Object Storage** is used to store ticket/task attachments and other uploaded files. File references are stored in the database while the actual files are managed through MinIO.

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MySQL**
* **Sequelize ORM**
* **JWT**
* **Swagger / OpenAPI**
* **MinIO Object Storage**
* **Docker & Docker Compose**
* **WSL (Windows Subsystem for Linux)**
* **Cloudflare Tunnel**

## ⚙️ Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_management_backend_2
DB_USER=root
DB_PASSWORD=your_password
```

### Run Migrations

```bash
npx sequelize-cli db:migrate
```

### Start Server

```bash
npm start
```

## 📦 MinIO Object Storage

The project uses **MinIO** for object storage and file management.

MinIO is used for:

* Ticket/task image attachments
* File uploads
* Object storage management
* Accessing stored files through generated object URLs

The backend communicates with MinIO for uploading and managing ticket/task attachments.

## 🐳 Docker & Multi-Container Orchestration

The project supports a **multi-container architecture** using Docker.

The application can be separated into dedicated containers for services such as:

```text
Client / API Request
        ↓
Node.js + Express
        ↓
MySQL Database
        ↓
MinIO Object Storage
```

**Docker Compose** can be used to manage and run the required services together.

## 🐧 WSL / Virtualization Setup

The development environment can use **WSL (Windows Subsystem for Linux)** to provide a Linux-based environment on Windows.

WSL/virtualization is used to support:

* Docker-based development
* Linux-compatible development environment
* Containerized services
* Local infrastructure setup

## 📚 API Documentation

Swagger is integrated for API documentation and testing.

```text
http://localhost:5000/api-docs
```

## 🌐 Deployment

The local backend can be made publicly accessible using **Cloudflare Tunnel**.

```text
Client
  ↓
Cloudflare Tunnel
  ↓
Node.js / Express
  ↓
MySQL
  ↓
MinIO
```

## 🔐 Access Control

The system supports user authentication and organization-level access management, with **roles and permissions** for controlling user capabilities.

## 📌 Project Status

**Backend development in progress** — core database, authentication, organization management, project and ticket/task workflow, file storage, API documentation, access control, and containerized infrastructure are being implemented.
