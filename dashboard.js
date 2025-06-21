// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading... Checking auth...');
    
    // Ensure BACKEND_URL is available
    if (!window.BACKEND_URL && window.APP_CONFIG) {
        window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
        console.log('Set BACKEND_URL from APP_CONFIG:', window.BACKEND_URL);
    }
    
    const username = localStorage.getItem('currentUser');
    const studentId = localStorage.getItem('studentId');
    const registrationNumber = localStorage.getItem('registrationNumber');
    // Check if user is logged in and token exists
    const token = localStorage.getItem('token');
      console.log('Auth check:', { 
        usernameExists: !!username, 
        tokenExists: !!token, 
        studentIdExists: !!studentId,
        registrationNumberExists: !!registrationNumber
    });
    
    if (!token) {
        console.log('Not authenticated, redirecting to login page');
        window.location.href = 'index.html';
        return;
    }

    // Update welcome message
    document.querySelectorAll('.user-info').forEach(element => {
        element.textContent = `Welcome back, ${username}`;
    });
    
    // Fetch student data using registration number
    async function fetchStudentData() {
        // For demo mode, use hardcoded data if token is demo token
        if (token === 'demo-token-12345') {
            console.log('Using demo data for student profile');
            const demoStudent = {
                name: 'Demo Student',
                registration_number: 'CLIP/2023/DEMO',
                course: 'Diploma in Computer Science',
                year_semester: 'Year 2, Semester 1'
            };
            populateStudentData(demoStudent, [], { fee_balance: 15000, total_paid: 35000, semester_fee: 50000, session_progress: 65 });
            return;
        }
        
        const regNumber = registrationNumber || username; // Use stored registration number
        if (!regNumber) {
            console.error('No registration number found');
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const apiUrl = `${backendUrl}/student/registration/${regNumber}`;
            console.log('Fetching student data from:', apiUrl);
            
            const res = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch student data: ${res.status}`);
            }
            
            const student = await res.json();
            console.log('Student data received:', student);
            populateStudentData(student, [], { fee_balance: 0, total_paid: 0, semester_fee: 0, session_progress: 0 });
            
        } catch (error) {
            console.error('Error fetching student data:', error);
            const basicStudent = {
                name: regNumber,
                registration_number: regNumber,
                course: 'N/A',
                year_semester: 'N/A'
            };
            populateStudentData(basicStudent, [], { fee_balance: 0, total_paid: 0, semester_fee: 0, session_progress: 0 });
        }
    }
    
    // Helper function to populate student data in the UI
    function populateStudentData(student, units, fees) {
        // Student profile in sidebar
        document.getElementById('studentName').textContent = student.name || 'N/A';
        document.getElementById('regNumber').textContent = student.registration_number || 'N/A';
        document.getElementById('courseName').textContent = student.course || 'N/A';
        document.getElementById('yearSemester').textContent = student.level_of_study || 'N/A';
        
        // Student information in main dashboard
        if (document.getElementById('dashboardName')) {
            document.getElementById('dashboardName').textContent = student.name || 'N/A';
            document.getElementById('dashboardRegNumber').textContent = student.registration_number || 'N/A';
            document.getElementById('dashboardYearSemester').textContent = student.level_of_study || 'N/A';
            document.getElementById('dashboardCourse').textContent = student.course || 'N/A';
        }
        
        // Update welcome message with first name
        const firstName = student.name?.split(' ')[0] || 'Student';
        document.querySelectorAll('.user-info').forEach(element => {
            element.textContent = `Welcome back, ${firstName}`;
        });
        
        // Fee details
        document.getElementById('feeBalance').textContent = fees.fee_balance ? `KSH ${fees.fee_balance}` : 'KSH 0';
        document.getElementById('totalPaid').textContent = fees.total_paid ? `KSH ${fees.total_paid}` : 'KSH 0';
        document.getElementById('semesterFee').textContent = fees.semester_fee ? `KSH ${fees.semester_fee}` : 'KSH 0';
        document.getElementById('sessionProgress').textContent = fees.session_progress ? `${fees.session_progress}%` : '0%';
        
        // Registered units
        const unitsList = document.getElementById('registeredUnits');
        unitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong></li>';
        
        if (units && units.length > 0) {
            units.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.name || unit.unit_name}</span>
                    <span>${unit.code || unit.unit_code}</span>
                    <span>${unit.status}</span>
                `;
                unitsList.appendChild(unitItem);
            });
        } else {
            const noUnits = document.createElement('li');
            noUnits.innerHTML = '<span>No registered units found</span>';
            unitsList.appendChild(noUnits);
        }
    }
    
    // Call fetchStudentData
    // fetchStudentData();
    
    // Fetch available units from backend
    async function fetchAvailableUnits() {
        // For demo mode
        if (token === 'demo-token-12345') {
            const demoUnits = [
                { id: 'demo1', unit_name: 'Advanced Programming', unit_code: 'CS202' },
                { id: 'demo2', unit_name: 'Computer Networks', unit_code: 'CS304' },
                { id: 'demo3', unit_name: 'Data Structures', unit_code: 'CS201' }
            ];
            
            const availableUnitsList = document.getElementById('availableUnits');
            availableUnitsList.innerHTML = '';
            
            demoUnits.forEach(unit => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${unit.unit_name}</span>
                    <span>${unit.unit_code}</span>
                    <button onclick="registerUnit('${unit.id}')">Register</button>
                `;
                availableUnitsList.appendChild(li);
            });
            
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            console.log('Fetching available units from:', backendUrl + '/units');
            
            const res = await fetch(backendUrl + '/units');
            
            if (!res.ok) {
                throw new Error('Failed to fetch available units');
            }
            
            const units = await res.json();
            const availableUnitsList = document.getElementById('availableUnits');
            availableUnitsList.innerHTML = '';
            
            if (units && units.length > 0) {
                units.forEach(unit => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${unit.unit_name}</span>
                        <span>${unit.unit_code}</span>
                        <button onclick="registerUnit('${unit.id}')">Register</button>
                    `;
                    availableUnitsList.appendChild(li);
                });
            } else {
                availableUnitsList.innerHTML = '<li><span>No available units found</span></li>';
            }
        } catch (error) {
            console.error('Error fetching available units:', error);
            document.getElementById('availableUnits').innerHTML = 
                '<li><span>Failed to load available units. Please try again later.</span></li>';
        }
    }

    // Make registerUnit function available globally
    window.registerUnit = async function(unitId) {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        if (!studentId || !token) {
            alert('You must be logged in.');
            return;
        }
        
        // For demo mode
        if (token === 'demo-token-12345') {
            console.log('Registering demo unit:', unitId);
            const statusElement = document.getElementById('unitRegisterStatus');
            statusElement.textContent = 'Unit registered successfully!';
            
            // Add the unit to registered units for demo
            const unitsList = document.getElementById('registeredUnits');
            const demoUnitNames = {
                'demo1': 'Advanced Programming',
                'demo2': 'Computer Networks',
                'demo3': 'Data Structures'
            };
            const demoUnitCodes = {
                'demo1': 'CS202',
                'demo2': 'CS304',
                'demo3': 'CS201'
            };
            
            if (demoUnitNames[unitId]) {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${demoUnitNames[unitId]}</span>
                    <span>${demoUnitCodes[unitId]}</span>
                    <span>Registered</span>
                `;
                unitsList.appendChild(unitItem);
                
                // Remove from available units
                const availableUnits = document.querySelectorAll('#availableUnits li');
                for (let i = 0; i < availableUnits.length; i++) {
                    if (availableUnits[i].textContent.includes(demoUnitNames[unitId])) {
                        availableUnits[i].remove();
                        break;
                    }
                }
            }
            
            return;
        }
        
        // Real API call
        try {
            const backendUrl = window.BACKEND_URL;
            console.log(`Registering unit ${unitId} for student ${studentId}`);
            
            const res = await fetch(`${backendUrl}/students/${studentId}/register-unit`, {
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
            console.error('Error registering unit:', error);
            document.getElementById('unitRegisterStatus').textContent = 'Error registering unit. Please try again later.';
        }
    };

    // Download exam card
    document.getElementById('downloadExamCardBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('examCardStatus').textContent = 'Demo mode: In a real system, your exam card would download here.';
            setTimeout(() => {
                document.getElementById('examCardStatus').textContent = '';
            }, 3000);
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/exam-card`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.status === 403) {
                document.getElementById('examCardStatus').textContent = data.error || 'You are not authorized to download this exam card.';
            } else if (res.status === 404) {
                document.getElementById('examCardStatus').textContent = 'No exam card found.';
            } else if (data.file_url) {
                document.getElementById('examCardStatus').textContent = '';
                window.open(data.file_url, '_blank');
            } else {
                document.getElementById('examCardStatus').textContent = 'Failed to download exam card.';
            }
        } catch (error) {
            console.error('Error downloading exam card:', error);
            document.getElementById('examCardStatus').textContent = 'Network error. Please try again later.';
        }
    }

    // Download fee statement and receipt
    document.getElementById('downloadFeeStatementBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('financeStatus').textContent = 'Demo mode: In a real system, your fee statement would download here.';
            setTimeout(() => {
                document.getElementById('financeStatus').textContent = '';
            }, 3000);
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/fee-statement`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.status === 404) {
                document.getElementById('financeStatus').textContent = 'No fee statement found.';
            } else if (data.statement_url) {
                document.getElementById('financeStatus').textContent = '';
                window.open(data.statement_url, '_blank');
            } else {
                document.getElementById('financeStatus').textContent = 'Failed to download fee statement.';
            }
        } catch (error) {
            console.error('Error downloading fee statement:', error);
            document.getElementById('financeStatus').textContent = 'Network error. Please try again later.';
        }
    };
    
    document.getElementById('downloadFeeReceiptBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('financeStatus').textContent = 'Demo mode: In a real system, your fee receipt would download here.';
            setTimeout(() => {
                document.getElementById('financeStatus').textContent = '';
            }, 3000);
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/fee-receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.status === 404) {
                document.getElementById('financeStatus').textContent = 'No fee receipt found.';
            } else if (data.receipt_url) {
                document.getElementById('financeStatus').textContent = '';
                window.open(data.receipt_url, '_blank');
            } else {
                document.getElementById('financeStatus').textContent = 'Failed to download fee receipt.';
            }
        } catch (error) {
            console.error('Error downloading fee receipt:', error);
            document.getElementById('financeStatus').textContent = 'Network error. Please try again later.';
        }
    };

    // fetchAvailableUnits();
      document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('studentId');
        localStorage.removeItem('registrationNumber');
        localStorage.removeItem('studentData');
        window.location.href = 'index.html';
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
