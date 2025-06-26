async function login() {
    const registrationNumber = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (registrationNumber && password) {
        try {
            // Get the backend URL from window.APP_CONFIG
            const backendUrl = window.APP_CONFIG?.BACKEND_URL || 'http://localhost:3000';
            console.log(`Attempting login to ${backendUrl}/auth/student-login`);
            
            document.getElementById('loginStatus').textContent = 'Connecting to server...';
            
            const res = await fetch(`${backendUrl}/auth/student-login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    registration_number: registrationNumber.trim(),
                    password: password.trim()
                })
            });
            
            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);
            
            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', data.student?.name || data.name || registrationNumber);
                localStorage.setItem('studentId', data.student_id || data.studentId || data.student?.id || data.id);
                
                // Explicitly store registration number
                const regNumber = data.student?.reg_number || data.student?.registration_number || 
                                 data.reg_number || data.registration_number || registrationNumber;
                localStorage.setItem('registrationNumber', regNumber);
                
                // Store complete student data
                const studentData = data.student || {
                    name: data.name || registrationNumber,
                    reg_number: regNumber,
                    course: data.course || 'N/A',
                    year_semester: data.year_semester || 'N/A',
                    id: data.student_id || data.studentId || data.id
                };
                localStorage.setItem('studentData', JSON.stringify(studentData));
                
                document.getElementById('loginStatus').textContent = 'Login successful! Redirecting...';
                document.getElementById('loginStatus').style.color = '#04b613';
                
                setTimeout(() => {
                    window.location.href = 'DASHBAORD.html';
                }, 1000);
            } else {
                document.getElementById('loginStatus').textContent = data.error || data.message || 'Login failed';
                document.getElementById('loginStatus').style.color = '#ff3333';
                console.error('Login failed:', data);
            }
        } catch (err) {
            console.error('Login error:', err);
            document.getElementById('loginStatus').textContent = 'Network error. Please try again.';
            document.getElementById('loginStatus').style.color = '#ff3333';
        }
    } else {
        document.getElementById('loginStatus').textContent = 'Please enter both registration number and password';
        document.getElementById('loginStatus').style.color = '#ff3333';
    }
    }

// Forgot Password Functions
function showForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'block';
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('resetRegNumber').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('resetStatus').textContent = '';
}

async function resetPassword() {
    const regNumber = document.getElementById('resetRegNumber').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!regNumber || !newPassword || !confirmPassword) {
        document.getElementById('resetStatus').textContent = 'Please fill in all fields';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        document.getElementById('resetStatus').textContent = 'Passwords do not match';
        return;
    }
    
    try {
        const backendUrl = window.APP_CONFIG?.BACKEND_URL || 'https://clipsback-production.up.railway.app';
        document.getElementById('resetStatus').textContent = 'Sending reset link...';
        
        const res = await fetch(`${backendUrl}/student/auth/forgot-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                registration_number: regNumber,
                new_password: newPassword
            })
        });
        
        console.log('Reset password response status:', res.status);
        const data = await res.json();
        console.log('Reset password response data:', data);
        
        if (res.ok) {
            document.getElementById('resetStatus').textContent = 'Password reset successful! Redirecting...';
            document.getElementById('resetStatus').style.color = '#04b613';
            setTimeout(() => {
                closeForgotPasswordModal();
                window.location.reload();
            }, 1500);
        } else {
            document.getElementById('resetStatus').textContent = data.error || data.message || 'Failed to send reset link';
            document.getElementById('resetStatus').style.color = '#ff3333';
        }
    } catch (error) {
        console.error('Reset password error:', error);
        document.getElementById('resetStatus').textContent = 'Network error. Please try again.';
        document.getElementById('resetStatus').style.color = '#ff3333';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPasswordModal();
    }
}

// Add event listener for Enter key on password field
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});
