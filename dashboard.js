// Global logout function that can be called from anywhere
window.logout = function() {
    console.log('Global logout function called');
    
    try {
        // Clear all stored data
        localStorage.clear(); // Clear all localStorage data
        
        // Force redirect to login page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect even if there's an error
        window.location.href = 'index.html';
    }
};

// Check if user is logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard DOMContentLoaded event fired');
    
    // Ensure BACKEND_URL is available
    if (!window.BACKEND_URL && window.APP_CONFIG) {
        window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
        console.log('Set BACKEND_URL from APP_CONFIG:', window.BACKEND_URL);
    }
    
    const username = localStorage.getItem('currentUser');
    const studentId = localStorage.getItem('studentId'); // Assuming you store student ID
    // Check if user is logged in and token exists
    const token = localStorage.getItem('token');
    
    console.log('Auth check:', { username, studentId, token: !!token });
    
    if (!username || !token) {
        console.log('Not authenticated, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    // Update welcome message
    document.querySelectorAll('.user-info').forEach(element => {
        element.textContent = `Welcome back, ${username}`;
    });    // Fetch student data from backend with Authorization header
    async function fetchStudentData(studentId) {
        const baseUrl = window.BACKEND_URL + '/students/' + studentId;
        console.log('Fetching student data from:', baseUrl);
        console.log('Student ID:', studentId);
        console.log('Token available:', !!token);
        
        try {
            // Fetch student details
            const studentRes = await fetch(baseUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Student API response status:', studentRes.status);
            
            // Check if the response is OK and is JSON
            if (!studentRes.ok) {
                throw new Error(`HTTP ${studentRes.status}: ${studentRes.statusText}`);
            }
            
            const contentType = studentRes.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server response is not JSON');
            }
            
            const student = await studentRes.json();
            console.log('Student data received:', student);
            
            // Fetch units with better error handling
            let units = [];
            try {
                const unitsRes = await fetch(baseUrl + '/units', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (unitsRes.ok) {
                    units = await unitsRes.json();
                } else {
                    console.warn(`Units API returned ${unitsRes.status}: ${unitsRes.statusText}`);
                }
            } catch (error) {
                console.error('Error fetching units:', error);
            }
            
            // Fetch fee info with better error handling
            let fees = {};
            try {
                const feesRes = await fetch(baseUrl + '/fees', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (feesRes.ok) {
                    fees = await feesRes.json();
                } else {
                    console.warn(`Fees API returned ${feesRes.status}: ${feesRes.statusText}`);
                }
            } catch (error) {
                console.error('Error fetching fees:', error);
            }            // Populate student details from DB with null checks
            const studentNameEl = document.getElementById('studentName');
            if (studentNameEl) studentNameEl.textContent = student.name || student.username || username;
            
            const greetingNameEl = document.getElementById('greetingName');
            if (greetingNameEl) greetingNameEl.textContent = (student.name || username).split(' ')[0];
            
            const regNumberEl = document.getElementById('regNumber');
            if (regNumberEl) regNumberEl.textContent = student.registration_number || student.reg_number || student.regNumber || '';
            
            const courseNameEl = document.getElementById('courseName');
            if (courseNameEl) courseNameEl.textContent = student.course || '';
            
            const levelOfStudyEl = document.getElementById('levelOfStudy');
            if (levelOfStudyEl) levelOfStudyEl.textContent = student.level_of_study || student.year_semester || '';
            
            const studentStatusEl = document.getElementById('studentStatus');
            if (studentStatusEl) studentStatusEl.textContent = student.status || 'Unknown';
            
            const nationalIdEl = document.getElementById('nationalId');
            if (nationalIdEl) nationalIdEl.textContent = student.national_id || 'Not provided';
            
            const dateOfBirthEl = document.getElementById('dateOfBirth');
            if (dateOfBirthEl) {
                if (student.date_of_birth) {
                    const dateObj = new Date(student.date_of_birth);
                    dateOfBirthEl.textContent = dateObj.toLocaleDateString();
                } else {
                    dateOfBirthEl.textContent = 'Not provided';
                }
            }
            
            const studentEmailEl = document.getElementById('studentEmail');
            if (studentEmailEl) studentEmailEl.textContent = student.email || 'Not provided';
            
            const studentImageEl = document.getElementById('studentImage');
            if (studentImageEl && student.photo_url) {
                studentImageEl.src = student.photo_url;
                studentImageEl.style.display = 'block';
                // Hide avatar if image is available
                const avatarEl = document.getElementById('studentAvatar');
                if (avatarEl) avatarEl.style.display = 'none';
            }

            // Populate dashboard-specific elements with null checks
            const dashboardName = document.getElementById('dashboardName');
            if (dashboardName) dashboardName.textContent = student.name || student.username || username;
            
            const dashboardRegNumber = document.getElementById('dashboardRegNumber');
            if (dashboardRegNumber) dashboardRegNumber.textContent = student.registration_number || student.reg_number || student.regNumber || '';
            
            const dashboardLevelOfStudy = document.getElementById('dashboardLevelOfStudy');
            if (dashboardLevelOfStudy) dashboardLevelOfStudy.textContent = student.level_of_study || student.year_semester || '';
            
            const dashboardCourse = document.getElementById('dashboardCourse');
            if (dashboardCourse) dashboardCourse.textContent = student.course || '';
            
            const dashboardStatus = document.getElementById('dashboardStatus');
            if (dashboardStatus) {
                dashboardStatus.textContent = student.status || 'Unknown';
                // Add status styling
                if (student.status === 'active') {
                    dashboardStatus.style.color = '#04b613';
                } else if (student.status === 'inactive' || student.deregistered) {
                    dashboardStatus.style.color = '#ff3333';
                } else {
                    dashboardStatus.style.color = '#ff8c00';
                }
            }
            
            const dashboardNationalId = document.getElementById('dashboardNationalId');
            if (dashboardNationalId) dashboardNationalId.textContent = student.national_id || 'Not provided';
            
            const dashboardDateOfBirth = document.getElementById('dashboardDateOfBirth');
            if (dashboardDateOfBirth) {
                if (student.date_of_birth) {
                    const dateObj = new Date(student.date_of_birth);
                    dashboardDateOfBirth.textContent = dateObj.toLocaleDateString();
                } else {
                    dashboardDateOfBirth.textContent = 'Not provided';
                }
            }
            
            const dashboardEmail = document.getElementById('dashboardEmail');
            if (dashboardEmail) dashboardEmail.textContent = student.email || 'Not provided';
            
            const dashboardAcademicStatus = document.getElementById('dashboardAcademicStatus');
            if (dashboardAcademicStatus) {
                if (student.academic_leave) {
                    dashboardAcademicStatus.textContent = `On Academic Leave${student.academic_leave_reason ? ' - ' + student.academic_leave_reason : ''}`;
                    dashboardAcademicStatus.style.color = '#ff8c00';
                } else if (student.deregistered) {
                    dashboardAcademicStatus.textContent = `Deregistered${student.deregistration_reason ? ' - ' + student.deregistration_reason : ''}`;
                    dashboardAcademicStatus.style.color = '#ff3333';
                } else {
                    dashboardAcademicStatus.textContent = 'Active';
                    dashboardAcademicStatus.style.color = '#04b613';
                }
            }

            // Use Supabase Storage for student images (future implementation)
            // Example: Fetch image from Supabase Storage
            // const { data, error } = await supabase.storage.from('student-images').download('studentId.jpg');
            // if (data) { document.getElementById('studentImage').src = URL.createObjectURL(data); }

            // Populate fee details from DB with null checks
            const feeBalanceEl = document.getElementById('feeBalance');
            if (feeBalanceEl) feeBalanceEl.textContent = fees.fee_balance ? `KSH ${fees.fee_balance}` : 'KSH 0';
            
            const totalPaidEl = document.getElementById('totalPaid');
            if (totalPaidEl) totalPaidEl.textContent = fees.total_paid ? `KSH ${fees.total_paid}` : 'KSH 0';
            
            const semesterFeeEl = document.getElementById('semesterFee');
            if (semesterFeeEl) semesterFeeEl.textContent = fees.semester_fee ? `KSH ${fees.semester_fee}` : 'KSH 0';
            
            const sessionProgressEl = document.getElementById('sessionProgress');
            if (sessionProgressEl) sessionProgressEl.textContent = fees.session_progress ? `${fees.session_progress}%` : '0%';

            // Populate registered units from DB with null checks
            const unitsList = document.getElementById('registeredUnits');
            if (unitsList) {
                unitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong><strong>Action</strong></li>';
                if (units && units.length > 0) {
                    units.forEach(unit => {
                        const unitItem = document.createElement('li');
                        unitItem.innerHTML = `
                            <span>${unit.name || unit.unit_name || 'Unknown'}</span>
                            <span>${unit.code || unit.unit_code || 'N/A'}</span>
                            <span>${unit.status || 'registered'}</span>
                            <span><button onclick="dropUnit('${unit.id || unit.unit_id}', '${unit.name || unit.unit_name || 'this unit'}')" class="drop-unit-btn">Drop</button></span>
                        `;
                        unitsList.appendChild(unitItem);
                    });
                } else {
                    const noUnitsItem = document.createElement('li');
                    noUnitsItem.innerHTML = '<span colspan="4">No units registered yet</span>';
                    unitsList.appendChild(noUnitsItem);
                }
            }            // Fetch and display available units with better error handling
            try {
                const availableUnitsRes = await fetch(baseUrl + '/available-units', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (availableUnitsRes.ok) {
                    const availableUnits = await availableUnitsRes.json();
                    console.log('Available units loaded:', availableUnits);
                    
                    const availableUnitsList = document.getElementById('availableUnits');
                    if (availableUnitsList) {
                        availableUnitsList.innerHTML = ''; // Clear existing content
                        if (availableUnits && availableUnits.length > 0) {
                            availableUnits.forEach((unit, index) => {
                                console.log(`Creating button for unit ${index}:`, unit);
                                const unitItem = document.createElement('li');
                                unitItem.innerHTML = `
                                    <span>${unit.name || unit.unit_name || 'Unknown'}</span>
                                    <span>${unit.code || unit.unit_code || 'N/A'}</span>
                                    <button onclick="registerUnit('${unit.id}')" data-unit-id="${unit.id}" class="register-unit-btn">Register</button>
                                `;
                                availableUnitsList.appendChild(unitItem);
                                
                                // Also add event listener as backup
                                const button = unitItem.querySelector('button');
                                if (button) {
                                    button.addEventListener('click', function() {
                                        console.log('Button clicked for unit:', unit.id);
                                        window.registerUnit(unit.id);
                                    });
                                }
                            });
                            
                            console.log('All unit buttons created successfully');
                            
                            // Also populate the select dropdown
                            const availableUnitsSelect = document.getElementById('availableUnitsSelect');
                            if (availableUnitsSelect) {
                                availableUnitsSelect.innerHTML = '<option value="">Select a unit to register...</option>';
                                availableUnits.forEach(unit => {
                                    const option = document.createElement('option');
                                    option.value = unit.id;
                                    option.textContent = `${unit.name || unit.unit_name} (${unit.code || unit.unit_code})`;
                                    availableUnitsSelect.appendChild(option);
                                });
                                console.log('Select dropdown populated with', availableUnits.length, 'units');
                            }
                        } else {
                            availableUnitsList.innerHTML = '<li><span colspan="3">No available units to register</span></li>';
                        }
                    }

                    // Registration status message
                    const registrationStatus = document.getElementById('unitRegisterStatus');
                    if (registrationStatus) {
                        registrationStatus.textContent = 'You can register for additional units from the available units list.';
                    }
                } else {
                    console.warn(`Available units API returned ${availableUnitsRes.status}: ${availableUnitsRes.statusText}`);
                    const availableUnitsList = document.getElementById('availableUnits');
                    if (availableUnitsList) {
                        availableUnitsList.innerHTML = '<li><span colspan="3" style="color: #ff3333;">Unable to load available units</span></li>';
                    }
                }
            } catch (error) {
                console.error('Error fetching available units:', error);
                const availableUnitsList = document.getElementById('availableUnits');
                if (availableUnitsList) {
                    availableUnitsList.innerHTML = '<li><span colspan="3" style="color: #ff3333;">Error loading available units</span></li>';
                }
            }        } catch (error) {
            console.error('Error fetching student data:', error);
            console.log('Attempting to use stored student data as fallback...');
            
            // Try to use stored student data as fallback
            const storedStudentData = localStorage.getItem('studentData');
            if (storedStudentData) {
                try {
                    const student = JSON.parse(storedStudentData);
                    console.log('Using stored student data:', student);
                    
                    // Populate with stored data and show warning
                    const studentNameEl = document.getElementById('studentName');
                    if (studentNameEl) studentNameEl.textContent = student.name || username;
                    
                    const dashboardName = document.getElementById('dashboardName');
                    if (dashboardName) dashboardName.textContent = student.name || username;
                    
                    const regNumberEl = document.getElementById('regNumber');
                    if (regNumberEl) regNumberEl.textContent = student.registration_number || student.reg_number || '';
                    
                    const dashboardRegNumber = document.getElementById('dashboardRegNumber');
                    if (dashboardRegNumber) dashboardRegNumber.textContent = student.registration_number || student.reg_number || '';
                    
                    const courseNameEl = document.getElementById('courseName');
                    if (courseNameEl) courseNameEl.textContent = student.course || '';
                    
                    const dashboardCourse = document.getElementById('dashboardCourse');
                    if (dashboardCourse) dashboardCourse.textContent = student.course || '';
                    
                    const levelOfStudyEl = document.getElementById('levelOfStudy');
                    if (levelOfStudyEl) levelOfStudyEl.textContent = student.level_of_study || student.year_semester || '';
                    
                    const dashboardLevelOfStudy = document.getElementById('dashboardLevelOfStudy');
                    if (dashboardLevelOfStudy) dashboardLevelOfStudy.textContent = student.level_of_study || student.year_semester || '';
                    
                    // Set other fields to indicate connection issue
                    const errorFields = [
                        'studentStatus', 'dashboardStatus', 'nationalId', 'dashboardNationalId',
                        'dateOfBirth', 'dashboardDateOfBirth', 'studentEmail', 'dashboardEmail',
                        'dashboardAcademicStatus'
                    ];
                    
                    errorFields.forEach(fieldId => {
                        const element = document.getElementById(fieldId);
                        if (element) element.textContent = 'Connection Error';
                    });
                    
                    // Show connection error message
                    const userInfo = document.querySelector('.user-info');
                    if (userInfo) {
                        userInfo.textContent = `Welcome back, ${username} (Backend Connection Issue)`;
                        userInfo.style.color = '#ff8c00';
                    }
                    
                    // Show error in fee elements
                    const feeElements = ['feeBalance', 'totalPaid', 'semesterFee', 'sessionProgress'];
                    feeElements.forEach(elementId => {
                        const element = document.getElementById(elementId);
                        if (element) element.textContent = 'Connection Error';
                    });
                    
                    // Show error in units list
                    const unitsList = document.getElementById('registeredUnits');
                    if (unitsList) {
                        unitsList.innerHTML = `
                            <li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong><strong>Action</strong></li>
                            <li><span colspan="4" style="color: #ff8c00;">Backend connection issue. Please try refreshing the page.</span></li>
                        `;
                    }
                    
                    return; // Exit early since we used fallback data
                } catch (parseError) {
                    console.error('Error parsing stored student data:', parseError);
                }
            }
            
            // If no stored data available, show error message
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.textContent = `Welcome back, ${username} (Connection Error)`;
                userInfo.style.color = '#ff3333';
            }
            
            // Show error message in dashboard elements
            const errorMessage = 'Unable to load data. Please check your connection and try again.';
            
            const elements = [
                'studentName', 'regNumber', 'courseName', 'levelOfStudy', 'studentStatus', 
                'nationalId', 'dateOfBirth', 'studentEmail',
                'dashboardName', 'dashboardRegNumber', 'dashboardLevelOfStudy', 'dashboardCourse',
                'dashboardStatus', 'dashboardNationalId', 'dashboardDateOfBirth', 'dashboardEmail',
                'dashboardAcademicStatus', 'feeBalance', 'totalPaid', 'semesterFee', 'sessionProgress'
            ];
            
            elements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) element.textContent = 'Error loading data';
            });
            
            // Show error in units list
            const unitsList = document.getElementById('registeredUnits');
            if (unitsList) {
                unitsList.innerHTML = `
                    <li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong><strong>Action</strong></li>
                    <li><span colspan="4" style="color: #ff3333;">${errorMessage}</span></li>
                `;
            }
        }
    }

    // Call fetchStudentData
    fetchStudentData(studentId);    // Fetch available units from backend
    async function fetchAvailableUnits() {
        try {
            const res = await fetch(window.BACKEND_URL + '/units');
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const units = await res.json();
            const availableUnitsList = document.getElementById('availableUnits');
            if (availableUnitsList) {
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
            }
        } catch (error) {
            console.error('Error fetching available units:', error);
            const availableUnitsList = document.getElementById('availableUnits');
            if (availableUnitsList) {
                availableUnitsList.innerHTML = '<li colspan="3"><span style="color: #ff3333;">Error loading available units</span></li>';
            }
        }
    }

    // Make registerUnit function available globally
    window.registerUnit = async function(unitId) {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        console.log('Attempting to register unit:', {
            unitId,
            studentId,
            tokenAvailable: !!token,
            backendUrl: window.BACKEND_URL
        });
        
        if (!studentId || !token) {
            alert('You must be logged in.');
            return;
        }
        
        // Ensure BACKEND_URL is available
        if (!window.BACKEND_URL && window.APP_CONFIG) {
            window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
        }
        
        if (!window.BACKEND_URL) {
            console.error('BACKEND_URL not available');
            const statusElement = document.getElementById('unitRegisterStatus');
            if (statusElement) {
                statusElement.textContent = 'Configuration error: Backend URL not found';
                statusElement.style.color = '#ff3333';
            }
            return;
        }
        
        const statusElement = document.getElementById('unitRegisterStatus');
        if (statusElement) {
            statusElement.textContent = 'Registering unit...';
            statusElement.style.color = '#ff8c00';
        }
        
        try {
            // Try the primary endpoint first
            let url = `${window.BACKEND_URL}/students/${studentId}/units`;
            console.log('Trying primary unit registration endpoint:', url);
            
            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ unit_id: unitId })
            });
            
            console.log('Primary endpoint response status:', res.status);
            
            // If that fails, try fallback endpoint
            if (!res.ok && res.status === 404) {
                url = `${window.BACKEND_URL}/students/${studentId}/register-unit`;
                console.log('Falling back to alternative endpoint:', url);
                
                res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ unit_id: unitId })
                });
                
                console.log('Fallback endpoint response status:', res.status);
            }
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Unit registration failed:', res.status, errorText);
                
                if (statusElement) {
                    statusElement.textContent = `Registration failed: ${res.status} ${res.statusText}`;
                    statusElement.style.color = '#ff3333';
                }
                return;
            }
            
            const data = await res.json();
            console.log('Unit registration response:', data);
            
            if (statusElement) {
                statusElement.textContent = data.message || 'Unit registered successfully!';
                statusElement.style.color = '#04b613';
            }
            
            // Refresh registered units
            fetchStudentData(studentId);
            
        } catch (error) {
            console.error('Error registering unit:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            if (statusElement) {
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    statusElement.textContent = 'Network error. Please check your connection and try again.';
                } else {
                    statusElement.textContent = 'Error registering unit. Please try again.';
                }
                statusElement.style.color = '#ff3333';
            }
        }
    };

    // Make dropUnit function available globally
    window.dropUnit = async function(unitId, unitName) {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        console.log('Attempting to drop unit:', {
            unitId,
            unitName,
            studentId,
            tokenAvailable: !!token,
            backendUrl: window.BACKEND_URL
        });
        
        if (!studentId || !token) {
            const statusElement = document.getElementById('unitDropStatus');
            if (statusElement) {
                statusElement.textContent = 'You must be logged in to drop units.';
                statusElement.style.color = '#ff3333';
            }
            return;
        }
        
        // Confirm unit drop
        const confirmDrop = confirm(`Are you sure you want to drop the unit "${unitName}"? This action cannot be undone.`);
        if (!confirmDrop) {
            return;
        }
        
        // Ensure BACKEND_URL is available
        if (!window.BACKEND_URL && window.APP_CONFIG) {
            window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
        }
        
        if (!window.BACKEND_URL) {
            console.error('BACKEND_URL not available');
            const statusElement = document.getElementById('unitDropStatus');
            if (statusElement) {
                statusElement.textContent = 'Configuration error: Backend URL not found';
                statusElement.style.color = '#ff3333';
            }
            return;
        }
        
        const statusElement = document.getElementById('unitDropStatus');
        if (statusElement) {
            statusElement.textContent = `Dropping unit "${unitName}"...`;
            statusElement.style.color = '#ff8c00';
        }
        
        try {
            // Try the primary endpoint first
            let url = `${window.BACKEND_URL}/students/${studentId}/units/${unitId}`;
            console.log('Trying unit drop endpoint:', url);
            
            let res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Drop unit response:', res.status, res.statusText);
            
            if (res.ok) {
                const result = await res.json();
                console.log('Unit dropped successfully:', result);
                
                if (statusElement) {
                    statusElement.textContent = `Unit "${unitName}" has been dropped successfully!`;
                    statusElement.style.color = '#28a745';
                }
                
                // Refresh the page or reload data after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                // Try alternative endpoint
                url = `${window.BACKEND_URL}/drop-unit`;
                console.log('Trying alternative drop unit endpoint:', url);
                
                res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        student_id: studentId,
                        unit_id: unitId 
                    })
                });
                
                if (res.ok) {
                    const result = await res.json();
                    console.log('Unit dropped successfully (alternative endpoint):', result);
                    
                    if (statusElement) {
                        statusElement.textContent = `Unit "${unitName}" has been dropped successfully!`;
                        statusElement.style.color = '#28a745';
                    }
                    
                    // Refresh the page or reload data after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                    console.error('Failed to drop unit:', errorData);
                    
                    if (statusElement) {
                        statusElement.textContent = `Failed to drop unit: ${errorData.message || 'Unknown error'}`;
                        statusElement.style.color = '#ff3333';
                    }
                }
            }
        } catch (error) {
            console.error('Error dropping unit:', error);
            
            if (statusElement) {
                statusElement.textContent = 'An error occurred while dropping the unit. Please try again.';
                statusElement.style.color = '#ff3333';
            }
        }
    };

    // Download exam card with error handling
    const downloadExamCardBtn = document.getElementById('downloadExamCardBtn');
    if (downloadExamCardBtn) {
        downloadExamCardBtn.onclick = async function() {
            const studentId = localStorage.getItem('studentId');
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${window.BACKEND_URL}/students/${studentId}/exam-card`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const examCardStatus = document.getElementById('examCardStatus');
                if (res.status === 403) {
                    if (examCardStatus) examCardStatus.textContent = data.error;
                } else if (res.status === 404) {
                    if (examCardStatus) examCardStatus.textContent = 'No exam card available yet.';
                } else if (data.file_url) {
                    if (examCardStatus) examCardStatus.textContent = '';
                    window.open(data.file_url, '_blank');
                }
            } catch (error) {
                console.error('Error downloading exam card:', error);
                const examCardStatus = document.getElementById('examCardStatus');
                if (examCardStatus) examCardStatus.textContent = 'Error loading exam card.';
            }
        };
    }

    // Download fee statement and receipt with error handling
    const downloadFeeStatementBtn = document.getElementById('downloadFeeStatementBtn');
    if (downloadFeeStatementBtn) {
        downloadFeeStatementBtn.onclick = async function() {
            const studentId = localStorage.getItem('studentId');
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${window.BACKEND_URL}/students/${studentId}/fee-statement`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const financeStatus = document.getElementById('financeStatus');
                if (res.status === 404) {
                    if (financeStatus) financeStatus.textContent = 'No fee statement available yet.';
                } else if (data.statement_url) {
                    if (financeStatus) financeStatus.textContent = '';
                    window.open(data.statement_url, '_blank');
                }
            } catch (error) {
                console.error('Error downloading fee statement:', error);
                const financeStatus = document.getElementById('financeStatus');
                if (financeStatus) financeStatus.textContent = 'Error loading fee statement.';
            }
        };
    }
    
    const downloadFeeReceiptBtn = document.getElementById('downloadFeeReceiptBtn');
    if (downloadFeeReceiptBtn) {
        downloadFeeReceiptBtn.onclick = async function() {
            const studentId = localStorage.getItem('studentId');
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${window.BACKEND_URL}/students/${studentId}/fee-receipt`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const financeStatus = document.getElementById('financeStatus');
                if (res.status === 404) {
                    if (financeStatus) financeStatus.textContent = 'No fee receipt available yet.';
                } else if (data.receipt_url) {
                    if (financeStatus) financeStatus.textContent = '';
                    window.open(data.receipt_url, '_blank');
                }
            } catch (error) {
                console.error('Error downloading fee receipt:', error);
                const financeStatus = document.getElementById('financeStatus');
                if (financeStatus) financeStatus.textContent = 'Error loading fee receipt.';
            }
        };
    }

    fetchAvailableUnits();
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            console.log('Logout button clicked via event listener'); // Debug log
            
            // Call the global logout function
            window.logout();
        });
    } else {
        console.error('Logout button not found!');
    }

    // Photo upload functionality
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const photoInput = document.getElementById('photoInput');
    
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', function() {
            if (photoInput) {
                photoInput.click();
            }
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                uploadStudentPhoto(file);
            }
        });
    }

}); // End DOMContentLoaded event listener

// Navigation functions for the menu items
window.downloadFeeStatement = function() {
    const downloadFeeStatementBtn = document.getElementById('downloadFeeStatementBtn');
    if (downloadFeeStatementBtn) {
        downloadFeeStatementBtn.click();
    }
};

window.downloadFeeReceipt = function() {
    const downloadFeeReceiptBtn = document.getElementById('downloadFeeReceiptBtn');
    if (downloadFeeReceiptBtn) {
        downloadFeeReceiptBtn.click();
    }
};

window.showResults = function() {
    alert('Results feature coming soon!');
};

window.showTimetable = function() {
    alert('Timetable feature coming soon!');
};

window.showSem1Timetable = function() {
    alert('Semester 1 timetable feature coming soon!');
};

window.showSem2Timetable = function() {
    alert('Semester 2 timetable feature coming soon!');
};

window.showEvaluation = function() {
    alert('Evaluation feature coming soon!');
};

window.showCourseEvaluation = function() {
    alert('Course evaluation feature coming soon!');
};

window.showSemesterEvaluation = function() {
    alert('Semester evaluation feature coming soon!');
};

window.showSocials = function() {
    alert('Socials feature coming soon!');
};

window.showNews = function() {
    alert('News feature coming soon!');
};

window.showEvents = function() {
    alert('Events feature coming soon!');
};

window.showSettings = function() {
    alert('Settings feature coming soon!');
};

window.showChangePassword = function() {
    alert('Change password feature coming soon!');
};

window.registerSelectedUnit = function() {
    const select = document.getElementById('availableUnitsSelect');
    if (select && select.value) {
        registerUnit(select.value);
    } else {
        const statusElement = document.getElementById('unitRegisterStatus');
        if (statusElement) statusElement.textContent = 'Please select a unit first.';
    }
};

// Student Information Editing Functions
window.toggleEditMode = function() {
    const editBtn = document.getElementById('editInfoBtn');
    const editActions = document.getElementById('editActions');
    const emailDisplay = document.getElementById('dashboardEmail');
    const emailInput = document.getElementById('editDashboardEmail');
    const studentEmailDisplay = document.getElementById('studentEmail');
    const studentEmailInput = document.getElementById('editStudentEmail');
    
    if (editBtn.textContent === 'Edit Info') {
        // Enter edit mode
        editBtn.textContent = 'Cancel Edit';
        editActions.style.display = 'block';
        
        // Show input fields and hide display fields for email
        if (emailDisplay && emailInput) {
            emailInput.value = emailDisplay.textContent !== 'Not provided' ? emailDisplay.textContent : '';
            emailDisplay.style.display = 'none';
            emailInput.style.display = 'inline-block';
        }
        
        if (studentEmailDisplay && studentEmailInput) {
            studentEmailInput.value = studentEmailDisplay.textContent !== 'Not provided' ? studentEmailDisplay.textContent : '';
            studentEmailDisplay.style.display = 'none';
            studentEmailInput.style.display = 'inline-block';
        }
    } else {
        // Cancel edit mode
        cancelEdit();
    }
};

window.cancelEdit = function() {
    const editBtn = document.getElementById('editInfoBtn');
    const editActions = document.getElementById('editActions');
    const emailDisplay = document.getElementById('dashboardEmail');
    const emailInput = document.getElementById('editDashboardEmail');
    const studentEmailDisplay = document.getElementById('studentEmail');
    const studentEmailInput = document.getElementById('editStudentEmail');
    const editStatus = document.getElementById('editStatus');
    
    // Exit edit mode
    editBtn.textContent = 'Edit Info';
    editActions.style.display = 'none';
    
    // Hide input fields and show display fields
    if (emailDisplay && emailInput) {
        emailDisplay.style.display = 'inline';
        emailInput.style.display = 'none';
    }
    
    if (studentEmailDisplay && studentEmailInput) {
        studentEmailDisplay.style.display = 'inline';
        studentEmailInput.style.display = 'none';
    }
    
    // Clear status message
    if (editStatus) editStatus.textContent = '';
};

window.saveStudentInfo = function() {
    const studentId = localStorage.getItem('studentId');
    const token = localStorage.getItem('token');
    const editStatus = document.getElementById('editStatus');
    
    console.log('Save student info called with:', {
        studentId,
        tokenAvailable: !!token,
        backendUrl: window.BACKEND_URL
    });
    
    if (!studentId || !token) {
        if (editStatus) {
            editStatus.textContent = 'Authentication error. Please login again.';
            editStatus.style.color = '#ff3333';
        }
        return;
    }
    
    // Check if BACKEND_URL is available
    if (!window.BACKEND_URL) {
        console.error('BACKEND_URL not found. Checking APP_CONFIG...');
        if (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL) {
            window.BACKEND_URL = window.APP_CONFIG.BACKEND_URL;
            console.log('Set BACKEND_URL from APP_CONFIG:', window.BACKEND_URL);
        } else {
            if (editStatus) {
                editStatus.textContent = 'Configuration error. Backend URL not found.';
                editStatus.style.color = '#ff3333';
            }
            return;
        }
    }
    
    // Get updated values
    const emailInput = document.getElementById('editDashboardEmail');
    const studentEmailInput = document.getElementById('editStudentEmail');
    
    const updatedInfo = {};
    
    // Check if email was changed
    if (emailInput && emailInput.style.display !== 'none') {
        updatedInfo.email = emailInput.value.trim();
    } else if (studentEmailInput && studentEmailInput.style.display !== 'none') {
        updatedInfo.email = studentEmailInput.value.trim();
    }
    
    // Validate email if provided
    if (updatedInfo.email && !isValidEmail(updatedInfo.email)) {
        if (editStatus) {
            editStatus.textContent = 'Please enter a valid email address.';
            editStatus.style.color = '#ff3333';
        }
        return;
    }
    
    // Check if any changes were made
    if (Object.keys(updatedInfo).length === 0) {
        if (editStatus) {
            editStatus.textContent = 'No changes to save.';
            editStatus.style.color = '#ff8c00';
        }
        return;
    }
    
    // Show saving status
    if (editStatus) {
        editStatus.textContent = 'Saving changes...';
        editStatus.style.color = '#ff8c00';
    }
    
    // Send update request to backend
    updateStudentInfo(studentId, updatedInfo, token);
};

async function updateStudentInfo(studentId, updatedInfo, token) {
    const editStatus = document.getElementById('editStatus');
    
    console.log('Attempting to update student info:', {
        studentId,
        updatedInfo,
        backendUrl: window.BACKEND_URL,
        tokenAvailable: !!token
    });
    
    try {
        // Try using the student ID endpoint first: PUT /students/:id
        const url1 = `${window.BACKEND_URL}/students/${studentId}`;
        console.log('Trying primary endpoint:', url1);
        
        let response = await fetch(url1, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedInfo)
        });
        
        console.log('Primary endpoint response status:', response.status);
        
        // If that fails, try using registration number endpoint as fallback
        if (!response.ok && response.status === 404) {
            const registrationNumber = localStorage.getItem('registrationNumber');
            if (registrationNumber) {
                const url2 = `${window.BACKEND_URL}/students/registration/${registrationNumber}`;
                console.log('Falling back to registration number endpoint:', url2);
                
                response = await fetch(url2, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedInfo)
                });
                
                console.log('Fallback endpoint response status:', response.status);
            }
        }
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            console.error('HTTP Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            
            if (editStatus) {
                editStatus.textContent = `Server error: ${response.status} ${response.statusText}`;
                editStatus.style.color = '#ff3333';
            }
            return;
        }
        
        const result = await response.json();
        console.log('Update response:', result);
        
        // Update display fields with new values
        if (updatedInfo.email) {
            const emailDisplay = document.getElementById('dashboardEmail');
            const studentEmailDisplay = document.getElementById('studentEmail');
            
            if (emailDisplay) emailDisplay.textContent = updatedInfo.email;
            if (studentEmailDisplay) studentEmailDisplay.textContent = updatedInfo.email;
            
            // Update stored student data
            const storedData = localStorage.getItem('studentData');
            if (storedData) {
                const studentData = JSON.parse(storedData);
                studentData.email = updatedInfo.email;
                localStorage.setItem('studentData', JSON.stringify(studentData));
            }
        }
        
        if (editStatus) {
            editStatus.textContent = 'Changes saved successfully!';
            editStatus.style.color = '#04b613';
        }
        
        // Exit edit mode after a short delay
        setTimeout(() => {
            cancelEdit();
        }, 2000);
        
    } catch (error) {
        console.error('Error updating student info:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Try a different approach for CORS issues
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.log('Attempting alternative update method...');
            
            // Show specific error message
            if (editStatus) {
                editStatus.textContent = 'Network error detected. This may be due to CORS or connectivity issues.';
                editStatus.style.color = '#ff3333';
            }
            
            // Log debugging information
            console.log('Debugging information:');
            console.log('- Backend URL:', window.BACKEND_URL);
            console.log('- Student ID:', studentId);
            console.log('- Update data:', updatedInfo);
            console.log('- Token length:', token ? token.length : 'No token');
            
            // You can call the test function from the console
            console.log('Run testBackendConnection() in the console to debug further');
            
        } else {
            if (editStatus) {
                editStatus.textContent = 'Network error. Please try again.';
                editStatus.style.color = '#ff3333';
            }
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Photo Upload Functionality
window.uploadPhoto = function() {
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.click();
    }
};

async function uploadStudentPhoto(file) {
    const studentId = localStorage.getItem('studentId');
    const token = localStorage.getItem('token');
    const photoUploadStatus = document.getElementById('photoUploadStatus');
    
    if (!studentId || !token) {
        if (photoUploadStatus) {
            photoUploadStatus.textContent = 'Authentication error. Please login again.';
            photoUploadStatus.style.color = '#ff3333';
        }
        return;
    }
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        if (photoUploadStatus) {
            photoUploadStatus.textContent = 'Please select a valid image file.';
            photoUploadStatus.style.color = '#ff3333';
        }
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) // 5MB limit
    {
        if (photoUploadStatus) {
            photoUploadStatus.textContent = 'File size must be less than 5MB.';
            photoUploadStatus.style.color = '#ff3333';
        }
        return;
    }
    
    // Show uploading status
    if (photoUploadStatus) {
        photoUploadStatus.textContent = 'Uploading photo...';
        photoUploadStatus.style.color = '#ff8c00';
    }
    
    try {
        const formData = new FormData();
        formData.append('photo', file);
        
        // Try using the student ID endpoint first
        let response = await fetch(`${window.BACKEND_URL}/students/${studentId}/photo`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        // If that fails, try alternative endpoint
        if (!response.ok && response.status === 404) {
            const registrationNumber = localStorage.getItem('registrationNumber');
            if (registrationNumber) {
                console.log('Falling back to registration number endpoint for photo...');
                response = await fetch(`${window.BACKEND_URL}/students/registration/${registrationNumber}/photo`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            }
        }
        
        const result = await response.json();
        
        if (response.ok) {
            // Update the photo display
            const studentImage = document.getElementById('studentImage');
            const studentAvatar = document.getElementById('studentAvatar');
            
            if (studentImage && result.photo_url) {
                studentImage.src = result.photo_url;
                studentImage.style.display = 'block';
                if (studentAvatar) studentAvatar.style.display = 'none';
            }
            
            if (photoUploadStatus) {
                photoUploadStatus.textContent = 'Photo uploaded successfully!';
                photoUploadStatus.style.color = '#04b613';
            }
            
            // Update stored student data
            const storedData = localStorage.getItem('studentData');
            if (storedData) {
                const studentData = JSON.parse(storedData);
                studentData.photo_url = result.photo_url;
                localStorage.setItem('studentData', JSON.stringify(studentData));
            }
            
            // Clear status after delay
            setTimeout(() => {
                if (photoUploadStatus) photoUploadStatus.textContent = '';
            }, 3000);
            
        } else {
            if (photoUploadStatus) {
                photoUploadStatus.textContent = result.error || 'Failed to upload photo.';
                photoUploadStatus.style.color = '#ff3333';
            }
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        if (photoUploadStatus) {
            photoUploadStatus.textContent = 'Network error. Please try again.';
            photoUploadStatus.style.color = '#ff3333';
        }
    }
}

// Debug function to test backend connectivity
window.testBackendConnection = async function() {
    console.log('Testing backend connection...');
    const token = localStorage.getItem('token');
    const studentId = localStorage.getItem('studentId');
    
    console.log('Test parameters:', {
        backendUrl: window.BACKEND_URL,
        tokenAvailable: !!token,
        studentId: studentId
    });
    
    if (!window.BACKEND_URL) {
        console.error('BACKEND_URL not available');
        return;
    }
    
    try {
        // Test a simple GET request first
        const testUrl = `${window.BACKEND_URL}/students/${studentId}`;
        console.log('Testing GET request to:', testUrl);
        
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Test response status:', response.status);
        console.log('Test response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Test response data:', data);
            console.log('✅ Backend connection successful');
        } else {
            const errorText = await response.text();
            console.log('❌ Backend responded with error:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Additional CORS/Network debugging
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.log('This is likely a CORS or network connectivity issue:');
            console.log('1. Check if the backend URL is correct:', window.BACKEND_URL);
            console.log('2. Check if the backend is running and accessible');
            console.log('3. Check if CORS is properly configured on the backend');
            console.log('4. Check browser network tab for more details');
        }
    }
};

// Debug function to test unit registration buttons
window.testUnitRegistration = function() {
    console.log('Testing unit registration functionality...');
    
    // Check if registerUnit function exists
    console.log('registerUnit function exists:', typeof window.registerUnit);
    
    // Check available units
    const availableUnits = document.getElementById('availableUnits');
    if (availableUnits) {
        console.log('Available units container found');
        const buttons = availableUnits.querySelectorAll('button');
        console.log('Number of register buttons found:', buttons.length);
        
        buttons.forEach((button, index) => {
            console.log(`Button ${index}:`, button.outerHTML);
            console.log(`Button ${index} onclick:`, button.onclick);
        });
    } else {
        console.log('Available units container not found');
    }
    
    // Check select dropdown
    const select = document.getElementById('availableUnitsSelect');
    if (select) {
        console.log('Unit select dropdown found');
        console.log('Select options:', select.options.length);
        for (let i = 0; i < select.options.length; i++) {
            console.log(`Option ${i}:`, select.options[i].value, select.options[i].text);
        }
    } else {
        console.log('Unit select dropdown not found');
    }
    
    // Check if backend URL is available
    console.log('Backend URL:', window.BACKEND_URL);
    console.log('Student ID:', localStorage.getItem('studentId'));
    console.log('Token available:', !!localStorage.getItem('token'));
};

// Also create a simple test register function
window.testRegisterUnit = function(unitId) {
    console.log('Test registering unit:', unitId);
    if (window.registerUnit) {
        window.registerUnit(unitId);
    } else {
        console.error('registerUnit function not found');
    }
};