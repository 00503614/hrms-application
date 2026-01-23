let employees = [];
let editingIndex = null;
let filteredEmployees = [...employees];

// Validation functions
const validators = {
    name: (value) => value.trim().length >= 2 ? '' : 'Name must be at least 2 characters',
    phone: (value) => /^[0-9]{10,}$/.test(value.replace(/\D/g, '')) ? '' : 'Phone must be at least 10 digits',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address',
    designation: (value) => value.trim().length >= 2 ? '' : 'Designation is required',
    position: (value) => value.trim().length >= 2 ? '' : 'Position is required',
    posting: (value) => value.trim().length >= 2 ? '' : 'Place of posting is required'
};

// Real-time validation on input
document.getElementById('name').addEventListener('blur', validateField);
document.getElementById('phone').addEventListener('blur', validateField);
document.getElementById('email').addEventListener('blur', validateField);

function validateField(e) {
    const field = e.target.id;
    const value = e.target.value;
    const error = validators[field](value);
    const errorEl = document.getElementById(field + 'Error');
    
    if (error) {
        e.target.classList.add('input-error');
        errorEl.textContent = error;
    } else {
        e.target.classList.remove('input-error');
        errorEl.textContent = '';
    }
}

// Fetch employees from API
async function fetchEmployees() {
    try {
        const response = await fetch('/api/employees');
        employees = await response.json();
        filteredEmployees = [...employees];
        loadEmployees();
        updateStats();
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

// Update stats
function updateStats() {
    document.getElementById('totalEmployees').textContent = employees.length;
}

// Load and display employees
function loadEmployees() {
    const tableBody = document.getElementById('employeeTableBody');
    tableBody.innerHTML = '';

    if (filteredEmployees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="no-results">No employees found</td></tr>';
        return;
    }

    filteredEmployees.forEach((employee, displayIndex) => {
        const actualIndex = employees.indexOf(employee);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.phone}</td>
            <td>${employee.email}</td>
            <td>${employee.designation}</td>
            <td>${employee.position}</td>
            <td>${employee.posting}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editEmployee(${actualIndex})">Edit</button>
                    <button class="delete-btn" onclick="deleteEmployee(${actualIndex})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add or update employee
document.getElementById('employeeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate all fields
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        designation: document.getElementById('designation').value,
        position: document.getElementById('position').value,
        posting: document.getElementById('posting').value
    };

    let hasError = false;
    for (let field in validators) {
        const error = validators[field](formData[field]);
        if (error) {
            hasError = true;
            document.getElementById(field).classList.add('input-error');
            document.getElementById(field + 'Error').textContent = error;
        }
    }

    if (hasError) return;

    try {
        if (editingIndex !== null) {
            // Update existing employee
            const response = await fetch(`/api/employees/${editingIndex}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showSuccessMessage('Employee updated successfully!');
                editingIndex = null;
                cancelEdit();
            }
        } else {
            // Add new employee
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showSuccessMessage('Employee added successfully!');
                this.reset();
            }
        }

        clearErrors();
        fetchEmployees();
    } catch (error) {
        console.error('Error saving employee:', error);
        showSuccessMessage('Error saving employee!');
    }
});

// Edit employee
function editEmployee(index) {
    editingIndex = index;
    const employee = employees[index];
    
    document.getElementById('name').value = employee.name;
    document.getElementById('phone').value = employee.phone;
    document.getElementById('email').value = employee.email;
    document.getElementById('designation').value = employee.designation;
    document.getElementById('position').value = employee.position;
    document.getElementById('posting').value = employee.posting;
    
    document.getElementById('formTitle').textContent = 'Edit Employee';
    document.getElementById('submitBtn').textContent = 'Update Employee';
    document.getElementById('cancelBtn').style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel edit
document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

function cancelEdit() {
    editingIndex = null;
    document.getElementById('employeeForm').reset();
    document.getElementById('formTitle').textContent = 'Add New Employee';
    document.getElementById('submitBtn').textContent = 'Add Employee';
    document.getElementById('cancelBtn').style.display = 'none';
    clearErrors();
}

// Delete employee
async function deleteEmployee(index) {
    if (confirm('Are you sure you want to delete this employee?')) {
        try {
            const response = await fetch(`/api/employees/${index}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showSuccessMessage('Employee deleted successfully!');
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredEmployees = [...employees];
    } else {
        filteredEmployees = employees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            emp.phone.includes(searchTerm) ||
            emp.designation.toLowerCase().includes(searchTerm)
        );
    }
    
    loadEmployees();
});

// Clear errors
function clearErrors() {
    document.getElementById('name').classList.remove('input-error');
    document.getElementById('phone').classList.remove('input-error');
    document.getElementById('email').classList.remove('input-error');
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('emailError').textContent = '';
}

// Show success message
function showSuccessMessage(message) {
    const msgEl = document.getElementById('successMessage');
    msgEl.textContent = message;
    msgEl.style.display = 'block';
    setTimeout(() => {
        msgEl.style.display = 'none';
    }, 3000);
}

// Initial load
window.addEventListener('load', () => {
    fetchEmployees();
});
