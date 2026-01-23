# HRMS Application

A Human Resource Management System built with Node.js and Express.js.

## Features

- Add, edit, and delete employee records
- Search employees by name, email, phone, or designation
- Real-time form validation
- Responsive web interface
- Employee statistics dashboard

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

```bash
npm start
```

The application will run on `http://localhost:3000`

## Project Structure

```
hrms-application/
├── index.js                 # Main server file
├── package.json            # Project dependencies
├── public/
│   ├── index.html         # Main HTML file
│   └── scripts/
│       └── app.js         # Client-side JavaScript
└── data/
    └── employees.json     # Employee data storage
```

## API Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:index` - Update employee
- `DELETE /api/employees/:index` - Delete employee

## Technologies Used

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript (Vanilla)
