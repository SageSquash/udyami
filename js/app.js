// Global variables
let currentUser = null;
let selectedSkills = [];
let currentStep = 1;
let registrationData = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadJobs();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('udyami_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    
    // Load certificates if user is logged in
    if (currentUser) {
        loadCertificates();
    }
}

function setupEventListeners() {
    // Navigation
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // File upload
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Form submissions
    document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);
    document.getElementById('job-form').addEventListener('submit', handleJobSubmit);
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Job Management
function loadJobs() {
    const jobsGrid = document.getElementById('jobs-grid');
    jobsGrid.innerHTML = '';
    
    mockJobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsGrid.appendChild(jobCard);
    });
}

function createJobCard(job) {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.setAttribute('data-skill', job.skill);
    
    div.innerHTML = `
        <div class="job-header">
            <h3>${job.title}</h3>
            ${job.urgent ? '<span class="urgent-badge"><i class="fas fa-exclamation-triangle"></i> Urgent</span>' : ''}
        </div>
        
        <p class="job-description">${job.description}</p>
        
        <div class="job-details">
            <div class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${job.location}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-rupee-sign"></i>
                <span>₹${job.budget}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-tools"></i>
                <span>${job.skill}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>${job.timePosted}</span>
            </div>
        </div>
        
        <button class="apply-btn" onclick="applyForJob('${job.id}')">
            <i class="fas fa-paper-plane"></i> Apply Now
        </button>
    `;
    
    return div;
}

function filterJobs() {
    const searchTerm = document.getElementById('job-search').value.toLowerCase();
    const skillFilter = document.getElementById('skill-filter').value;
    const jobCards = document.querySelectorAll('.job-card');
    
    jobCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.job-description').textContent.toLowerCase();
        const skill = card.getAttribute('data-skill');
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesSkill = skillFilter === '' || skill === skillFilter;
        
        if (matchesSearch && matchesSkill) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyForJob(jobId) {
    if (!currentUser) {
        showNotification('Please register first to apply for jobs!', 'warning');
        showRegister();
        return;
    }
    
    if (currentUser.type !== 'worker') {
        showNotification('Only workers can apply for jobs!', 'error');
        return;
    }
    
    // Simulate application process
    showNotification('Application submitted successfully!', 'success');
    
    // Add to user's applied jobs
    if (!currentUser.appliedJobs) {
        currentUser.appliedJobs = [];
    }
    currentUser.appliedJobs.push(jobId);
    
    // Save to localStorage
    localStorage.setItem('udyami_user', JSON.stringify(currentUser));
}

// Registration Modal Management
function showRegister() {
    document.getElementById('register-modal').style.display = 'block';
    resetRegistrationForm();
}

function closeModal() {
    document.getElementById('register-modal').style.display = 'none';
}

function resetRegistrationForm() {
    currentStep = 1;
    registrationData = {};
    selectedSkills = [];
    
    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show first step
    document.getElementById('step1').classList.add('active');
    
    // Clear form fields
    document.getElementById('phone-number').value = '';
    document.getElementById('otp-code').value = '';
    document.getElementById('full-name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('otp-section').style.display = 'none';
}

function selectUserType(type) {
    registrationData.type = type;
    nextStep();
}

function nextStep() {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    // Show appropriate fields based on user type
    if (currentStep === 3) {
        if (registrationData.type === 'worker') {
            document.getElementById('worker-fields').style.display = 'block';
        } else {
            document.getElementById('worker-fields').style.display = 'none';
        }
    }
}

function sendOTP() {
    const phoneNumber = document.getElementById('phone-number').value;
    
    if (!phoneNumber || phoneNumber.length !== 10) {
        showNotification('Please enter a valid 10-digit phone number!', 'error');
        return;
    }
    
    registrationData.phone = phoneNumber;
    
    // Simulate OTP sending
    document.getElementById('otp-section').style.display = 'block';
    showNotification('OTP sent to your phone!', 'success');
    
    // For demo purposes, show the OTP in console
    console.log('Demo OTP: 123456');
}

function verifyOTP() {
    const otpCode = document.getElementById('otp-code').value;
    
    if (!otpCode || otpCode.length !== 6) {
        showNotification('Please enter a valid 6-digit OTP!', 'error');
        return;
    }
    
    // For demo purposes, accept 123456 as valid OTP
    if (otpCode === '123456') {
        registrationData.verified = true;
        nextStep();
        showNotification('Phone verified successfully!', 'success');
    } else {
        showNotification('Invalid OTP! Try 123456 for demo.', 'error');
    }
}

function toggleSkill(element) {
    const skill = element.getAttribute('data-skill');
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedSkills = selectedSkills.filter(s => s !== skill);
    } else {
        element.classList.add('selected');
        selectedSkills.push(skill);
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('full-name').value;
    const location = document.getElementById('location').value;
    const experienceLevel = document.getElementById('experience-level').value;
    
    if (!fullName || !location) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    if (registrationData.type === 'worker' && selectedSkills.length === 0) {
        showNotification('Please select at least one skill!', 'error');
        return;
    }
    
    // Create user object
    const user = {
        id: Date.now().toString(),
        name: fullName,
        phone: registrationData.phone,
        location: location,
        type: registrationData.type,
        skills: selectedSkills,
        experienceLevel: experienceLevel,
        verified: registrationData.verified,
        registrationDate: new Date().toISOString(),
        appliedJobs: [],
        certificates: []
    };
    
    // Save user
    currentUser = user;
    localStorage.setItem('udyami_user', JSON.stringify(user));
    
    // Close modal and update UI
    closeModal();
    updateUIForLoggedInUser();
    showNotification('Registration completed successfully!', 'success');
}

function updateUIForLoggedInUser() {
    // Update navigation
    const registerBtn = document.querySelector('.register-btn');
    registerBtn.textContent = currentUser.name;
    registerBtn.onclick = () => showUserProfile();
    
    // Load user-specific content
    loadCertificates();
}

function showUserProfile() {
    // Simple profile display
    const profileInfo = `
        Name: ${currentUser.name}
        Phone: ${currentUser.phone}
        Location: ${currentUser.location}
        Type: ${currentUser.type}
        ${currentUser.skills ? 'Skills: ' + currentUser.skills.join(', ') : ''}
    `;
    
    alert(profileInfo);
}

// Job Posting
function showJobPost() {
    if (!currentUser) {
        showNotification('Please register first to post jobs!', 'warning');
        showRegister();
        return;
    }
    
    if (currentUser.type !== 'employer') {
        showNotification('Only employers can post jobs!', 'error');
        return;
    }
    
    document.getElementById('job-post-modal').style.display = 'block';
}

function closeJobModal() {
    document.getElementById('job-post-modal').style.display = 'none';
}

function handleJobSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('job-title').value;
    const description = document.getElementById('job-description').value;
    const skill = document.getElementById('job-skill').value;
    const budget = document.getElementById('job-budget').value;
    const location = document.getElementById('job-location').value;
    const urgent = document.getElementById('job-urgent').checked;
    
    if (!title || !description || !skill || !budget || !location) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    const newJob = {
        id: Date.now().toString(),
        title: title,
        description: description,
        skill: skill,
        budget: budget,
        location: location,
        urgent: urgent,
        timePosted: 'Just now',
        employerId: currentUser.id,
        employerName: currentUser.name
    };
    
    // Add to mock data (in real app, this would be sent to server)
    mockJobs.unshift(newJob);
    
    // Reload jobs display
    loadJobs();
    
    // Close modal and show success
    closeJobModal();
    showNotification('Job posted successfully!', 'success');
    
    // Clear form
    document.getElementById('job-form').reset();
}

// File Upload and Skill Verification
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.backgroundColor = '#f0f0f0';
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.style.backgroundColor = '';
    
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const uploadArea = document.getElementById('upload-area');
    const fileNames = Array.from(files).map(file => file.name);
    
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="color: #27ae60;"></i>
        <p>Files selected: ${fileNames.join(', ')}</p>
        <p style="font-size: 0.9rem; color: #666;">Click "Verify on Blockchain" to continue</p>
    `;
}

function verifySkill() {
    if (!currentUser) {
        showNotification('Please register first to verify skills!', 'warning');
        showRegister();
        return;
    }
    
    const uploadArea = document.getElementById('upload-area');
    const hasFiles = uploadArea.innerHTML.includes('Files selected');
    
    if (!hasFiles) {
        showNotification('Please upload work samples first!', 'error');
        return;
    }
    
    // Simulate blockchain verification
    showNotification('Verifying skill on blockchain...', 'info');
    
    setTimeout(() => {
        const certificate = {
            id: Date.now().toString(),
            skill: 'General Work Sample',
            verifiedDate: new Date().toISOString(),
            blockchainHash: generateBlockchainHash(),
            status: 'verified'
        };
        
        // Add to user's certificates
        if (!currentUser.certificates) {
            currentUser.certificates = [];
        }
        currentUser.certificates.push(certificate);
        
        // Save to localStorage
        localStorage.setItem('udyami_user', JSON.stringify(currentUser));
        
        // Reload certificates display
        loadCertificates();
        
        showNotification('Skill verified successfully on blockchain!', 'success');
        
        // Reset upload area
        document.getElementById('upload-area').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop your work photos/videos here</p>
        `;
    }, 2000);
}

function generateBlockchainHash() {
    return '0x' + Math.random().toString(16).substr(2, 8).toUpperCase();
}

function loadCertificates() {
    const certificatesList = document.getElementById('certificates-list');
    
    if (!currentUser || !currentUser.certificates || currentUser.certificates.length === 0) {
        certificatesList.innerHTML = '<p>No certificates yet. Upload work samples to get verified!</p>';
        return;
    }
    
    certificatesList.innerHTML = '';
    
    currentUser.certificates.forEach(cert => {
        const certDiv = document.createElement('div');
        certDiv.className = 'certificate-item';
        certDiv.innerHTML = `
            <div class="certificate-header">
                <i class="fas fa-certificate"></i>
                <h4>${cert.skill}</h4>
                <span class="verified-badge">Verified</span>
            </div>
            <div class="certificate-details">
                <p><strong>Verified:</strong> ${new Date(cert.verifiedDate).toLocaleDateString()}</p>
                <p><strong>Blockchain Hash:</strong> ${cert.blockchainHash}</p>
            </div>
        `;
        certificatesList.appendChild(certDiv);
    });
}

// Notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const registerModal = document.getElementById('register-modal');
    const jobModal = document.getElementById('job-post-modal');
    
    if (event.target === registerModal) {
        closeModal();
    }
    
    if (event.target === jobModal) {
        closeJobModal();
    }
}