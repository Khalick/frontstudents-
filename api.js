
    async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            try {
                const res = await fetch('https://clipsback-production.up.railway.app/auth/student-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (res.ok && data.token) {
                    localStorage.setItem('token', data.token);
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

    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
