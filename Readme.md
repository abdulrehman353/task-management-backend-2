# Task Management System

A backend-based **Task Management System** built with **Node.js, Express.js, MySQL, and Sequelize ORM**.

## 🚀 Features

* User Signup & Login
* Organization Create, Update & Delete
* Assign / Remove Users from Organizations
* Transfer Organization Ownership
* Organization-specific Logo & Theme
* Sequelize ORM with Database Migrations
* Swagger API Documentation
* JWT-based Authentication
* Roles & Permissions
* MySQL Database

## 🗄️ Database

The system includes the following main entities:

* Users
* Organizations
* Projects
* Project Members
* Tasks
* Comments
* Attachments
* Activity History

**MySQL** is used as the database and **Sequelize ORM** is used for models, relationships, and migrations.

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MySQL**
* **Sequelize ORM**
* **JWT**
* **Swagger / OpenAPI**
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

## 📚 API Documentation

Swagger is integrated for API documentation and testing.

```text
http://localhost:5000/api-docs
```

## 🌐 Deployment

The local backend can be made publicly accessible using **Cloudflare Tunnel**.

```text
Client → Cloudflare → Node.js Server → MySQL
```

## 🔐 Access Control

The system supports user authentication and organization-level access management, with roles and permissions for controlling user capabilities.

## 📌 Project Status

**Backend development in progress** — core database, organization management, authentication, API documentation, and access-control features are being implemented.
