
// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('currentUser');
    const studentId = localStorage.getItem('studentId'); // Assuming you store student ID
    
    // Check if user is logged in and token exists
    const token = localStorage.getItem('token');
    if (!username || !token) {
        window.location.href = 'login page.html';
        return;
    }

    // Update welcome message
    document.querySelectorAll('.user-info').forEach(element => {
        element.textContent = `Welcome back, ${username}`;
    });

    // Fetch student data from backend with Authorization header
    async function fetchStudentData(studentId) {
        const baseUrl = BACKEND_URL + '/students/' + studentId;
        try {
            // Fetch student details
            const studentRes = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const student = await studentRes.json();
            // Fetch units
            const unitsRes = await fetch(baseUrl + '/units', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const units = await unitsRes.json();
            // Fetch fee info
            const feesRes = await fetch(baseUrl + '/fees', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const fees = await feesRes.json();

            // Populate student details from DB
            document.getElementById('studentName').textContent = student.name || student.username || username;
            document.getElementById('greetingName').textContent = (student.name || username).split(' ')[0];
            document.getElementById('regNumber').textContent = student.reg_number || student.regNumber || '';
            document.getElementById('courseName').textContent = student.course || '';
            document.getElementById('displayCourse').textContent = student.course || '';
            document.getElementById('yearSemester').textContent = student.year_semester || '';
            document.getElementById('studentImage').src = student.photo_url || 'https://via.placeholder.com/120';

            // Use Supabase Storage for student images (future implementation)
            // Example: Fetch image from Supabase Storage
            // const { data, error } = await supabase.storage.from('student-images').download('studentId.jpg');
            // if (data) { document.getElementById('studentImage').src = URL.createObjectURL(data); }

            // Populate fee details from DB
            document.getElementById('feeBalance').textContent = fees.fee_balance ? `KSH ${fees.fee_balance}` : 'KSH 0';
            document.getElementById('totalPaid').textContent = fees.total_paid ? `KSH ${fees.total_paid}` : 'KSH 0';
            document.getElementById('semesterFee').textContent = fees.semester_fee ? `KSH ${fees.semester_fee}` : 'KSH 0';
            document.getElementById('sessionProgress').textContent = fees.session_progress ? `${fees.session_progress}%` : '0%';

            // Populate registered units from DB
            const unitsList = document.getElementById('registeredUnits');
            unitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong></li>';
            units.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.name || unit.unit_name}</span>
                    <span>${unit.code || unit.unit_code}</span>
                    <span>${unit.status}</span>
                `;
                unitsList.appendChild(unitItem);
            });

            // Fetch and display available units
            const availableUnitsRes = await fetch(baseUrl + '/available-units', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const availableUnits = await availableUnitsRes.json();
            const availableUnitsList = document.getElementById('availableUnits');
            availableUnitsList.innerHTML = ''; // Clear existing content
            availableUnits.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.name || unit.unit_name}</span>
                    <span>${unit.code || unit.unit_code}</span>
                `;
                availableUnitsList.appendChild(unitItem);
            });

            // Registration status message
            const registrationStatus = document.getElementById('unitRegisterStatus');
            registrationStatus.textContent = 'You can register for additional units from the available units list.';
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    }

    // Call fetchStudentData
    fetchStudentData(studentId);

    // Fetch available units from backend
    async function fetchAvailableUnits() {
        try {
            const res = await fetch(BACKEND_URL + '/units');
            const units = await res.json();
            const availableUnitsList = document.getElementById('availableUnits');
            availableUnitsList.innerHTML = '';
            units.forEach(unit => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${unit.unit_name}</span>
                    <span>${unit.unit_code}</span>
                    <button onclick="registerUnit('${unit.id}')">Register</button>
                `;
                availableUnitsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching available units:', error);
        }
    }

    // Register a unit for the student
    async function registerUnit(unitId) {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        if (!studentId || !token) {
            alert('You must be logged in.');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/students/${studentId}/register-unit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ unit_id: unitId })
            });
            const data = await res.json();
            document.getElementById('unitRegisterStatus').textContent = data.error || 'Unit registered!';
            fetchStudentData(studentId); // Refresh registered units
        } catch (error) {
            document.getElementById('unitRegisterStatus').textContent = 'Error registering unit.';
        }
    }

    // Download exam card
    document.getElementById('downloadExamCardBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const res = await fetch(`${BACKEND_URL}/students/${studentId}/exam-card`);
        const data = await res.json();
        if (res.status === 403) {
            document.getElementById('examCardStatus').textContent = data.error;
        } else if (res.status === 404) {
            document.getElementById('examCardStatus').textContent = 'No exam card found.';
        } else if (data.file_url) {
            document.getElementById('examCardStatus').textContent = '';
            window.open(data.file_url, '_blank');
        }
    }

    // Download fee statement and receipt
    document.getElementById('downloadFeeStatementBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const res = await fetch(`${BACKEND_URL}/students/${studentId}/fee-statement`);
        const data = await res.json();
        if (res.status === 404) {
            document.getElementById('financeStatus').textContent = 'No fee statement found.';
        } else if (data.statement_url) {
            document.getElementById('financeStatus').textContent = '';
            window.open(data.statement_url, '_blank');
        }
    };
    document.getElementById('downloadFeeReceiptBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const res = await fetch(`${BACKEND_URL}/students/${studentId}/fee-receipt`);
        const data = await res.json();
        if (res.status === 404) {
            document.getElementById('financeStatus').textContent = 'No fee receipt found.';
        } else if (data.receipt_url) {
            document.getElementById('financeStatus').textContent = '';
            window.open(data.receipt_url, '_blank');
        }
    }

    // Handle finance file upload
    document.getElementById('uploadFinanceForm').onsubmit = async function(e) {
        e.preventDefault();
        const type = document.getElementById('financeType').value;
        const studentId = document.getElementById('financeStudentId').value;
        const fileInput = document.getElementById('financeFile');
        const file = fileInput.files[0];
        if (!file || !studentId) {
            document.getElementById('financeUploadStatus').textContent = 'Please select a file and enter a student ID.';
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        let endpoint = '';
        if (type === 'statement') {
            endpoint = `${BACKEND_URL}/students/${studentId}/upload-fee-statement`;
        } else {
            endpoint = `${BACKEND_URL}/students/${studentId}/upload-fee-receipt`;
        }
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById('financeUploadStatus').textContent = 'Upload successful!';
            } else {
                document.getElementById('financeUploadStatus').textContent = data.error || 'Upload failed.';
            }
        } catch (err) {
            document.getElementById('financeUploadStatus').textContent = 'Network error.';
        }
    }

    fetchAvailableUnits();

    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('studentId');
        window.location.href = 'login page.html';
    });

    /* In a real implementation, you would fetch data from Django like this:
    fetch(`/api/students/${studentId}`)
        .then(response => response.json())
        .then(data => {
            // Populate all fields with real data
        })
        .catch(error => console.error('Error:', error));
    */
});