async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            try {
                const res = await fetch(`${BACKEND_URL}/auth/student-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (res.ok && data.token) {                    localStorage.setItem('token', data.token);
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('studentId', data.student_id);
                    setTimeout(() => {
                        window.location.href = 'DASHBAORD.html';
                    }, 1000);
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (err) {
                alert('Network error. Please try again.');
            }
        } else {
            alert('Please enter both username and password');
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

document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});
