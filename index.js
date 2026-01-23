const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data file path
const dataFilePath = path.join(__dirname, 'data', 'employees.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize employees data file
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
}

// Helper function to read employees from file
function readEmployees() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write employees to file
function writeEmployees(employees) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(employees, null, 2));
    } catch (error) {
        console.error('Error writing employees:', error);
    }
}

// Routes

// Get all employees
app.get('/api/employees', (req, res) => {
    try {
        const employees = readEmployees();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read employees' });
    }
});

// Add new employee
app.post('/api/employees', (req, res) => {
    try {
        const { name, phone, email, designation, position, posting } = req.body;
        
        // Validation
        if (!name || !phone || !email || !designation || !position || !posting) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const employees = readEmployees();
        const newEmployee = { name, phone, email, designation, position, posting };
        employees.push(newEmployee);
        writeEmployees(employees);
        
        res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Update employee
app.put('/api/employees/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const { name, phone, email, designation, position, posting } = req.body;
        
        if (!name || !phone || !email || !designation || !position || !posting) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const employees = readEmployees();
        if (index < 0 || index >= employees.length) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        employees[index] = { name, phone, email, designation, position, posting };
        writeEmployees(employees);
        
        res.json({ message: 'Employee updated successfully', employee: employees[index] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete employee
app.delete('/api/employees/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const employees = readEmployees();
        
        if (index < 0 || index >= employees.length) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        employees.splice(index, 1);
        writeEmployees(employees);
        
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'HRMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`HRMS Application running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

