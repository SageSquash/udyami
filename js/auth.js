// Authentication and user management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.loadUsersFromStorage();
        this.loadCurrentUser();
    }
    
    loadUsersFromStorage() {
        const usersData = localStorage.getItem('udyami_users');
        if (usersData) {
            this.users = JSON.parse(usersData);
        }
    }
    
    saveUsersToStorage() {
        localStorage.setItem('udyami_users', JSON.stringify(this.users));
    }
    
    loadCurrentUser() {
        const userData = localStorage.getItem('udyami_current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }
    
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('udyami_current_user', JSON.stringify(this.currentUser));
        }
    }
    
    register(userData) {
        // Validate user data
        if (!this.validateUserData(userData)) {
            throw new Error('Invalid user data');
        }
        
        // Check if user already exists
        const existingUser = this.findUserByPhone(userData.phone);
        if (existingUser) {
            throw new Error('User with this phone number already exists');
        }
        
        // Create user object
        const user = {
            id: this.generateUserId(),
            ...userData,
            registrationDate: new Date().toISOString(),
            isActive: true,
            appliedJobs: [],
            postedJobs: [],
            certificates: [],
            ratings: {
                average: 0,
                count: 0,
                reviews: []
            },
            earnings: {
                total: 0,
                thisMonth: 0,
                completedJobs: 0
            },
            profile: {
                bio: '',
                experience: userData.experienceLevel || 'beginner',
                availability: 'available',
                profilePicture: null
            }
        };
        
        // Add to users array
        this.users.push(user);
        this.saveUsersToStorage();
        
        // Set as current user
        this.currentUser = user;
        this.saveCurrentUser();
        
        return user;
    }
    
    validateUserData(userData) {
        const requiredFields = ['name', 'phone', 'location', 'type'];
        
        for (let field of requiredFields) {
            if (!userData[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Phone validation
        if (!/^\d{10}$/.test(userData.phone)) {
            console.error('Invalid phone number format');
            return false;
        }
        
        // User type validation
        if (!['worker', 'employer'].includes(userData.type)) {
            console.error('Invalid user type');
            return false;
        }
        
        // Skills validation for workers
        if (userData.type === 'worker' && (!userData.skills || userData.skills.length === 0)) {
            console.error('Workers must have at least one skill');
            return false;
        }
        
        return true;
    }
    
    generateUserId() {
        return 'USR_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    login(phone, otp) {
        // For demo purposes, accept any 10-digit phone with OTP 123456
        if (!/^\d{10}$/.test(phone)) {
            throw new Error('Invalid phone number');
        }
        
        if (otp !== '123456') {
            throw new Error('Invalid OTP. Use 123456 for demo');
        }
        
        // Check if user exists
        const existingUser = this.findUserByPhone(phone);
        if (existingUser) {
            this.currentUser = existingUser;
            this.saveCurrentUser();
            return existingUser;
        }
        
        throw new Error('User not found. Please register first.');
    }
    
    findUserByPhone(phone) {
        return this.users.find(user => user.phone === phone);
    }
    
    findUserById(userId) {
        return this.users.find(user => user.id === userId);
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('udyami_current_user');
        
        // Reload page to reset UI
        window.location.reload();
    }
    
    updateUserProfile(updates) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        // Update current user
        Object.assign(this.currentUser, updates);
        
        // Update in users array
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsersToStorage();
        }
        
        this.saveCurrentUser();
        return this.currentUser;
    }
    
    addCertificate(certificate) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (!this.currentUser.certificates) {
            this.currentUser.certificates = [];
        }
        
        this.currentUser.certificates.push(certificate);
        this.updateUserProfile({});
        
        return certificate;
    }
    
    applyForJob(jobId) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (this.currentUser.type !== 'worker') {
            throw new Error('Only workers can apply for jobs');
        }
        
        if (!this.currentUser.appliedJobs) {
            this.currentUser.appliedJobs = [];
        }
        
        // Check if already applied
        if (this.currentUser.appliedJobs.includes(jobId)) {
            throw new Error('You have already applied for this job');
        }
        
        this.currentUser.appliedJobs.push(jobId);
        this.updateUserProfile({});
        
        return true;
    }
    
    postJob(jobData) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (this.currentUser.type !== 'employer') {
            throw new Error('Only employers can post jobs');
        }
        
        const job = {
            id: this.generateJobId(),
            ...jobData,
            employerId: this.currentUser.id,
            employerName: this.currentUser.name,
            postedDate: new Date().toISOString(),
            status: 'active',
            applications: []
        };
        
        if (!this.currentUser.postedJobs) {
            this.currentUser.postedJobs = [];
        }
        
        this.currentUser.postedJobs.push(job.id);
        this.updateUserProfile({});
        
        return job;
    }
    
    generateJobId() {
        return 'JOB_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    addRating(rating, review = '') {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        
        const newReview = {
            id: Date.now().toString(),
            rating: rating,
            review: review,
            date: new Date().toISOString()
        };
        
        if (!this.currentUser.ratings.reviews) {
            this.currentUser.ratings.reviews = [];
        }
        
        this.currentUser.ratings.reviews.push(newReview);
        
        // Recalculate average
        const totalRatings = this.currentUser.ratings.reviews.length;
        const sumRatings = this.currentUser.ratings.reviews.reduce((sum, r) => sum + r.rating, 0);
        
        this.currentUser.ratings.average = (sumRatings / totalRatings).toFixed(1);
        this.currentUser.ratings.count = totalRatings;
        
        this.updateUserProfile({});
        
        return newReview;
    }
    
    updateEarnings(amount, jobCompleted = false) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        if (!this.currentUser.earnings) {
            this.currentUser.earnings = {
                total: 0,
                thisMonth: 0,
                completedJobs: 0
            };
        }
        
        this.currentUser.earnings.total += amount;
        this.currentUser.earnings.thisMonth += amount;
        
        if (jobCompleted) {
            this.currentUser.earnings.completedJobs++;
        }
        
        this.updateUserProfile({});
        
        return this.currentUser.earnings;
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserStats() {
        if (!this.currentUser) {
            return null;
        }
        
        const stats = {
            totalJobs: this.currentUser.appliedJobs ? this.currentUser.appliedJobs.length : 0,
            completedJobs: this.currentUser.earnings ? this.currentUser.earnings.completedJobs : 0,
            totalEarnings: this.currentUser.earnings ? this.currentUser.earnings.total : 0,
            averageRating: this.currentUser.ratings ? this.currentUser.ratings.average : 0,
            totalCertificates: this.currentUser.certificates ? this.currentUser.certificates.length : 0,
            memberSince: this.currentUser.registrationDate ? 
                new Date(this.currentUser.registrationDate).toLocaleDateString() : 'Unknown'
        };
        
        return stats;
    }
    
    searchUsers(query, userType = null) {
        return this.users.filter(user => {
            const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) ||
                               user.location.toLowerCase().includes(query.toLowerCase()) ||
                               (user.skills && user.skills.some(skill => 
                                   skill.toLowerCase().includes(query.toLowerCase())));
            
            const matchesType = userType ? user.type === userType : true;
            
            return matchesQuery && matchesType && user.isActive;
        });
    }
    
    getTopRatedWorkers(limit = 10) {
        return this.users
            .filter(user => user.type === 'worker' && user.isActive)
            .sort((a, b) => (b.ratings.average || 0) - (a.ratings.average || 0))
            .slice(0, limit);
    }
    
    // Demo data creation
    createDemoUsers() {
        const demoUsers = [
            {
                name: 'Rajesh Kumar',
                phone: '9876543210',
                location: 'Mumbai',
                type: 'worker',
                skills: ['plumbing', 'electrical'],
                experienceLevel: 'intermediate'
            },
            {
                name: 'Priya Sharma',
                phone: '9876543211',
                location: 'Delhi',
                type: 'worker',
                skills: ['cleaning', 'cooking'],
                experienceLevel: 'expert'
            },
            {
                name: 'Amit Patel',
                phone: '9876543212',
                location: 'Bangalore',
                type: 'employer',
                skills: []
            }
        ];
        
        demoUsers.forEach(userData => {
            try {
                if (!this.findUserByPhone(userData.phone)) {
                    this.register(userData);
                }
            } catch (error) {
                console.log('Demo user already exists:', userData.name);
            }
        });
    }
    
    // Initialize demo data if no users exist
    initializeDemoData() {
        if (this.users.length === 0) {
            this.createDemoUsers();
        }
    }
}

// OTP Management
class OTPManager {
    constructor() {
        this.otps = new Map();
        this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    }
    
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    sendOTP(phoneNumber) {
        // For demo purposes, we'll always use 123456
        const otp = '123456';
        
        this.otps.set(phoneNumber, {
            otp: otp,
            timestamp: Date.now(),
            attempts: 0
        });
        
        // In real implementation, this would send SMS
        console.log(`OTP for ${phoneNumber}: ${otp}`);
        
        return {
            success: true,
            message: 'OTP sent successfully'
        };
    }
    
    verifyOTP(phoneNumber, otp) {
        const otpData = this.otps.get(phoneNumber);
        
        if (!otpData) {
            return {
                success: false,
                message: 'OTP not found. Please request a new OTP.'
            };
        }
        
        // Check expiry
        if (Date.now() - otpData.timestamp > this.otpExpiry) {
            this.otps.delete(phoneNumber);
            return {
                success: false,
                message: 'OTP expired. Please request a new OTP.'
            };
        }
        
        // Check attempts
        if (otpData.attempts >= 3) {
            this.otps.delete(phoneNumber);
            return {
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.'
            };
        }
        
        // Verify OTP
        if (otpData.otp === otp) {
            this.otps.delete(phoneNumber);
            return {
                success: true,
                message: 'OTP verified successfully'
            };
        } else {
            otpData.attempts++;
            return {
                success: false,
                message: 'Invalid OTP. Please try again.'
            };
        }
    }
    
    resendOTP(phoneNumber) {
        this.otps.delete(phoneNumber);
        return this.sendOTP(phoneNumber);
    }
}

// Session Management
class SessionManager {
    constructor() {
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.checkSession();
    }
    
    checkSession() {
        const sessionData = localStorage.getItem('udyami_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            
            if (Date.now() - session.timestamp > this.sessionTimeout) {
                this.clearSession();
                return false;
            }
            
            return true;
        }
        
        return false;
    }
    
    createSession(userId) {
        const session = {
            userId: userId,
            timestamp: Date.now()
        };
        
        localStorage.setItem('udyami_session', JSON.stringify(session));
    }
    
    clearSession() {
        localStorage.removeItem('udyami_session');
        localStorage.removeItem('udyami_current_user');
    }
    
    extendSession() {
        const sessionData = localStorage.getItem('udyami_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.timestamp = Date.now();
            localStorage.setItem('udyami_session', JSON.stringify(session));
        }
    }
}

// Initialize auth managers
const authManager = new AuthManager();
const otpManager = new OTPManager();
const sessionManager = new SessionManager();

// Initialize demo data
authManager.initializeDemoData();

// Export for use in other files
window.authManager = authManager;
window.otpManager = otpManager;
window.sessionManager = sessionManager;