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
                level_of_study: 'Year 2, Semester 1',
                photo_url: 'https://via.placeholder.com/150x150?text=Demo+Student'
            };
            const demoUnits = [
                { id: 'demo1', unit_name: 'Advanced Programming', unit_code: 'CS202', status: 'registered' },
                { id: 'demo2', unit_name: 'Database Management', unit_code: 'CS203', status: 'registered' }
            ];
            populateStudentData(demoStudent, demoUnits, { fee_balance: 15000, total_paid: 35000, semester_fee: 50000, session_progress: 65 });
            fetchStudentDocuments();
            fetchAvailableUnits();
            return;
        }
        
        const regNumber = registrationNumber || username;
        if (!regNumber) {
            console.error('No registration number found');
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            
            // Fetch student profile data
            const studentRes = await fetch(`${backendUrl}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!studentRes.ok) {
                throw new Error(`Failed to fetch students: ${studentRes.status}`);
            }
            
            const students = await studentRes.json();
            const student = students.find(s => s.registration_number === regNumber);
            
            if (!student) {
                throw new Error('Student not found');
            }
            
            // Fetch registered units for the student
            const unitsRes = await fetch(`${backendUrl}/students/${student.id}/registered-units`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let registeredUnits = [];
            if (unitsRes.ok) {
                registeredUnits = await unitsRes.json();
            }
            
            // Fetch fees for the student
            const feesRes = await fetch(`${backendUrl}/students/${student.id}/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            let fees = { fee_balance: 0, total_paid: 0, semester_fee: 0, session_progress: 0 };
            if (feesRes.ok) {
                fees = await feesRes.json();
            }
            
            console.log('Student data received:', student);
            populateStudentData(student, registeredUnits, fees);
            fetchStudentDocuments();
            fetchAvailableUnits();
            
        } catch (error) {
            console.error('Error fetching student data:', error);
            const basicStudent = {
                name: regNumber,
                registration_number: regNumber,
                course: 'N/A',
                level_of_study: 'N/A'
            };
            populateStudentData(basicStudent, [], { fee_balance: 0, total_paid: 0, semester_fee: 0, session_progress: 0 });
            fetchStudentDocuments();
            fetchAvailableUnits();
        }
    }
    
    // Helper function to populate student data in the UI
    function populateStudentData(student, units, fees) {
        // Student profile in sidebar with photo
        document.getElementById('studentName').textContent = student.name || 'N/A';
        document.getElementById('regNumber').textContent = student.registration_number || 'N/A';
        document.getElementById('courseName').textContent = student.course || 'N/A';
        document.getElementById('yearSemester').textContent = student.level_of_study || 'N/A';
        
        // Update student photo
        const studentImage = document.getElementById('studentImage');
        const photoStatus = document.getElementById('photoStatus');
        if (student.photo_url && student.photo_url !== '') {
            studentImage.src = student.photo_url;
            studentImage.onerror = function() {
                this.src = 'https://via.placeholder.com/150x150?text=No+Photo';
                photoStatus.textContent = 'Photo not available';
            };
            photoStatus.textContent = 'Photo loaded';
        } else {
            studentImage.src = 'https://via.placeholder.com/150x150?text=No+Photo';
            photoStatus.textContent = 'No photo uploaded';
        }
        
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
        document.getElementById('feeBalance').textContent = fees.fee_balance ? `KSH ${fees.fee_balance.toLocaleString()}` : 'KSH 0';
        document.getElementById('totalPaid').textContent = fees.total_paid ? `KSH ${fees.total_paid.toLocaleString()}` : 'KSH 0';
        document.getElementById('semesterFee').textContent = fees.semester_fee ? `KSH ${fees.semester_fee.toLocaleString()}` : 'KSH 0';
        document.getElementById('sessionProgress').textContent = fees.session_progress ? `${fees.session_progress}%` : '0%';
        
        // Registered units
        const unitsList = document.getElementById('registeredUnits');
        unitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Status</strong></li>';
        
        if (units && units.length > 0) {
            units.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.unit_name || unit.name}</span>
                    <span>${unit.unit_code || unit.code}</span>
                    <span class="status-${(unit.status || 'registered').toLowerCase()}">${unit.status || 'registered'}</span>
                `;
                unitsList.appendChild(unitItem);
            });
        } else {
            const noUnits = document.createElement('li');
            noUnits.innerHTML = '<span colspan="3">No registered units found</span>';
            unitsList.appendChild(noUnits);
        }
    }
    
    // Set basic student info immediately
    const basicStudent = {
        name: username || 'Student',
        registration_number: registrationNumber || username || 'N/A',
        course: 'N/A',
        level_of_study: 'N/A'
    };
    populateStudentData(basicStudent, [], { fee_balance: 0, total_paid: 0, semester_fee: 0, session_progress: 0 });
    
    // Fetch available units from backend
    async function fetchAvailableUnits() {
        const availableUnitsSelect = document.getElementById('availableUnitsSelect');
        const availableUnitsList = document.getElementById('availableUnits');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            const demoUnits = [
                { id: 'demo1', unit_name: 'Advanced Programming', unit_code: 'CS202' },
                { id: 'demo2', unit_name: 'Computer Networks', unit_code: 'CS304' },
                { id: 'demo3', unit_name: 'Data Structures', unit_code: 'CS201' },
                { id: 'demo4', unit_name: 'Web Development', unit_code: 'CS305' }
            ];
            
            // Populate select dropdown
            availableUnitsSelect.innerHTML = '<option value="">Select a unit to register</option>';
            demoUnits.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = `${unit.unit_code} - ${unit.unit_name}`;
                availableUnitsSelect.appendChild(option);
            });
            
            // Populate available units list
            availableUnitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Action</strong></li>';
            demoUnits.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.unit_name}</span>
                    <span>${unit.unit_code}</span>
                    <span><button onclick="registerUnit('${unit.id}')" class="register-btn-small">Register</button></span>
                `;
                availableUnitsList.appendChild(unitItem);
            });
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/units`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch units: ${res.status}`);
            }
            
            const units = await res.json();
            console.log('Available units:', units);
            
            // Populate select dropdown
            availableUnitsSelect.innerHTML = '<option value="">Select a unit to register</option>';
            units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = `${unit.unit_code} - ${unit.unit_name}`;
                availableUnitsSelect.appendChild(option);
            });
            
            // Populate available units list
            availableUnitsList.innerHTML = '<li><strong>Unit Name</strong><strong>Unit Code</strong><strong>Action</strong></li>';
            units.forEach(unit => {
                const unitItem = document.createElement('li');
                unitItem.innerHTML = `
                    <span>${unit.unit_name}</span>
                    <span>${unit.unit_code}</span>
                    <span><button onclick="registerUnit('${unit.id}')" class="register-btn-small">Register</button></span>
                `;
                availableUnitsList.appendChild(unitItem);
            });
            
        } catch (error) {
            console.error('Error fetching available units:', error);
            availableUnitsSelect.innerHTML = '<option value="">Error loading units</option>';
            availableUnitsList.innerHTML = '<li><span>Error loading units</span></li>';
        }
    }
    
    // Function to fetch student documents
    async function fetchStudentDocuments() {
        const documentsGrid = document.getElementById('documentsGrid');
        const documentsCount = document.getElementById('documentsCount');
        const regNumber = registrationNumber || username;
        
        if (!regNumber) {
            documentsGrid.innerHTML = '<div class="error-message">No registration number found</div>';
            return;
        }
        
        // For demo mode
        if (token === 'demo-token-12345') {
            const demoDocuments = [
                {
                    id: 'demo1',
                    document_type: 'exam-card',
                    file_name: 'exam_card_2023.pdf',
                    file_url: '#',
                    uploaded_at: '2023-01-15T10:30:00Z'
                },
                {
                    id: 'demo2',
                    document_type: 'fees-statement',
                    file_name: 'fee_statement_sem1.pdf',
                    file_url: '#',
                    uploaded_at: '2023-02-01T14:20:00Z'
                },
                {
                    id: 'demo3',
                    document_type: 'timetable',
                    file_name: 'timetable_2023.pdf',
                    file_url: '#',
                    uploaded_at: '2023-01-10T09:15:00Z'
                }
            ];
            
            displayDocuments(demoDocuments);
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/documents/${regNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                if (res.status === 404) {
                    documentsGrid.innerHTML = '<div class="no-documents">No documents found</div>';
                    documentsCount.textContent = '0';
                    return;
                }
                throw new Error(`Failed to fetch documents: ${res.status}`);
            }
            
            const response = await res.json();
            const documents = response.data || [];
            
            displayDocuments(documents);
            
        } catch (error) {
            console.error('Error fetching documents:', error);
            documentsGrid.innerHTML = '<div class="error-message">Error loading documents</div>';
            documentsCount.textContent = '0';
        }
    }
    
    // Function to display documents in the grid
    function displayDocuments(documents) {
        const documentsGrid = document.getElementById('documentsGrid');
        const documentsCount = document.getElementById('documentsCount');
        
        documentsCount.textContent = documents.length;
        
        if (documents.length === 0) {
            documentsGrid.innerHTML = '<div class="no-documents">No documents uploaded yet</div>';
            return;
        }
        
        documentsGrid.innerHTML = '';
        
        documents.forEach(doc => {
            const docCard = document.createElement('div');
            docCard.className = 'document-card';
            
            const docType = doc.document_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const uploadDate = new Date(doc.uploaded_at).toLocaleDateString();
            
            docCard.innerHTML = `
                <div class="document-icon">
                    <i class="doc-icon">${getDocumentIcon(doc.document_type)}</i>
                </div>
                <div class="document-info">
                    <h4>${docType}</h4>
                    <p class="document-name">${doc.file_name}</p>
                    <p class="document-date">Uploaded: ${uploadDate}</p>
                </div>
                <div class="document-actions">
                    <button onclick="downloadDocument('${doc.file_url}', '${doc.file_name}')" class="download-btn">
                        Download
                    </button>
                </div>
            `;
            
            documentsGrid.appendChild(docCard);
        });
    }
    
    // Function to get document icon based on type
    function getDocumentIcon(docType) {
        const icons = {
            'exam-card': '🎓',
            'fees-statement': '💰',
            'fees-receipt': '🧾',
            'results': '📊',
            'timetable': '📅',
            'fees-structure': '📋'
        };
        return icons[docType] || '📄';
    }

    // Make registerUnit function available globally for select dropdown
    window.registerSelectedUnit = async function() {
        const selectedUnitId = document.getElementById('availableUnitsSelect').value;
        if (!selectedUnitId) {
            document.getElementById('unitRegisterStatus').innerHTML = '<div class="error-message">Please select a unit to register</div>';
            return;
        }
        await registerUnit(selectedUnitId);
    };

    // Make registerUnit function available globally
    window.registerUnit = async function(unitId) {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        const statusElement = document.getElementById('unitRegisterStatus');
        
        if (!studentId || !token) {
            statusElement.innerHTML = '<div class="error-message">Authentication required</div>';
            return;
        }
        
        // For demo mode
        if (token === 'demo-token-12345') {
            statusElement.innerHTML = '<div class="success-message">Demo: Unit registered successfully!</div>';
            setTimeout(() => {
                statusElement.innerHTML = '';
            }, 3000);
            return;
        }
        
        // Real API call
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/register-unit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ unit_id: unitId })
            });
            
            if (!res.ok) {
                throw new Error(`Failed to register unit: ${res.status}`);
            }
            
            const result = await res.json();
            console.log('Unit registered:', result);
            
            statusElement.innerHTML = '<div class="success-message">Unit registered successfully!</div>';
            
            // Refresh the data
            fetchStudentData();
            
            setTimeout(() => {
                statusElement.innerHTML = '';
            }, 3000);
            
        } catch (error) {
            console.error('Error registering unit:', error);
            statusElement.innerHTML = '<div class="error-message">Failed to register unit. Please try again.</div>';
        }
    };

    // Function to download documents
    window.downloadDocument = function(fileUrl, fileName) {
        if (fileUrl === '#') {
            alert('Demo document - download not available');
            return;
        }
        
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download exam card
    document.getElementById('downloadExamCardBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('examCardStatus').innerHTML = '<div class="info-message">Demo: Exam card download would be available here</div>';
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/exam-card`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch exam card: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.file_url) {
                window.open(data.file_url, '_blank');
            } else {
                document.getElementById('examCardStatus').innerHTML = '<div class="error-message">No exam card available</div>';
            }
            
        } catch (error) {
            console.error('Error downloading exam card:', error);
            document.getElementById('examCardStatus').innerHTML = '<div class="error-message">Error downloading exam card</div>';
        }
    };

    // Download fee statement and receipt
    document.getElementById('downloadFeeStatementBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('financeStatus').innerHTML = '<div class="info-message">Demo: Fee statement download would be available here</div>';
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/fee-statement`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch fee statement: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.statement_url) {
                window.open(data.statement_url, '_blank');
            } else {
                document.getElementById('financeStatus').innerHTML = '<div class="error-message">No fee statement available</div>';
            }
            
        } catch (error) {
            console.error('Error downloading fee statement:', error);
            document.getElementById('financeStatus').innerHTML = '<div class="error-message">Error downloading fee statement</div>';
        }
    };
    
    document.getElementById('downloadFeeReceiptBtn').onclick = async function() {
        const studentId = localStorage.getItem('studentId');
        const token = localStorage.getItem('token');
        
        // For demo mode
        if (token === 'demo-token-12345') {
            document.getElementById('financeStatus').innerHTML = '<div class="info-message">Demo: Fee receipt download would be available here</div>';
            return;
        }
        
        try {
            const backendUrl = window.BACKEND_URL;
            const res = await fetch(`${backendUrl}/students/${studentId}/fee-receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch fee receipt: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.receipt_url) {
                window.open(data.receipt_url, '_blank');
            } else {
                document.getElementById('financeStatus').innerHTML = '<div class="error-message">No fee receipt available</div>';
            }
            
        } catch (error) {
            console.error('Error downloading fee receipt:', error);
            document.getElementById('financeStatus').innerHTML = '<div class="error-message">Error downloading fee receipt</div>';
        }
    };

    // Initialize data fetching
    fetchStudentData();

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('studentId');
        localStorage.removeItem('registrationNumber');
        localStorage.removeItem('studentData');
        window.location.href = 'index.html';
    });

    // Helper function to highlight the active nav item
    function setActiveNavItem(itemSelector) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(itemSelector);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Function to scroll to a section smoothly
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Highlight sections based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.card[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });
        
        if (current) {
            setActiveNavItem(`[href="#${current}"]`);
        }
    });

    // Document download functions
    function downloadFeeStatement() {
        const financeStatus = document.getElementById('financeStatus');
        if (financeStatus) {
            financeStatus.innerHTML = '<div class="info-message">Redirecting to fee statement download...</div>';
        }
        
        // Scroll to finance section
        scrollToSection('finance');
    }

    function downloadFeeReceipt() {
        const financeStatus = document.getElementById('financeStatus');
        if (financeStatus) {
            financeStatus.innerHTML = '<div class="info-message">Redirecting to fee receipt download...</div>';
        }
        
        // Scroll to finance section
        scrollToSection('finance');
    }

    // Make these functions globally available
    window.downloadFeeStatement = downloadFeeStatement;
    window.downloadFeeReceipt = downloadFeeReceipt;

    // Placeholder functions for other features
    function showResults() {
        alert("Results will be available after the end of the semester.");
    }

    function showTimetable() {
        alert("Timetable feature is coming soon!");
    }

    function showSem1Timetable() {
        alert("Semester 1 timetable will be available soon.");
    }

    function showSem2Timetable() {
        alert("Semester 2 timetable will be available soon.");
    }

    function showEvaluation() {
        alert("Course evaluation will be available at the end of the semester.");
    }

    function showCourseEvaluation() {
        alert("Course evaluation will be available at the end of the semester.");
    }

    function showSemesterEvaluation() {
        alert("Semester evaluation will be available at the end of the semester.");
    }

    function showSocials() {
        alert("Social features coming soon!");
    }

    function showNews() {
        alert("College news feed coming soon!");
    }

    function showEvents() {
        alert("College events calendar coming soon!");
    }

    function showSettings() {
        alert("Settings page coming soon!");
    }

    function showChangePassword() {
        alert("Password change feature coming soon!");
    }

    // Make all these functions globally available
    window.showResults = showResults;
    window.showTimetable = showTimetable;
    window.showSem1Timetable = showSem1Timetable;
    window.showSem2Timetable = showSem2Timetable;
    window.showEvaluation = showEvaluation;
    window.showCourseEvaluation = showCourseEvaluation;
    window.showSemesterEvaluation = showSemesterEvaluation;
    window.showSocials = showSocials;
    window.showNews = showNews;
    window.showEvents = showEvents;
    window.showSettings = showSettings;
    window.showChangePassword = showChangePassword;
});
