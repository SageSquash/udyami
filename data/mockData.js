// Mock data for demonstration
const mockJobs = [
    {
        id: 1,
        title: "Plumber needed urgently",
        description: "Fix leaking pipe in bathroom. Must be available today.",
        skillRequired: "plumbing",
        budget: 500,
        location: "Andheri, Mumbai",
        urgent: true,
        createdAt: "2024-01-15T10:30:00Z",
        employer: "Sharma Residence",
        applications: 3
    },
    {
        id: 2,
        title: "Electrical wiring for new office",
        description: "Complete electrical setup for 1000 sq ft office space.",
        skillRequired: "electrical",
        budget: 15000,
        location: "Bandra, Mumbai",
        urgent: false,
        createdAt: "2024-01-14T14:20:00Z",
        employer: "Tech Solutions Pvt Ltd",
        applications: 7
    },
    {
        id: 3,
        title: "Furniture assembly required",
        description: "Assemble IKEA furniture for new apartment.",
        skillRequired: "carpentry",
        budget: 800,
        location: "Powai, Mumbai",
        urgent: false,
        createdAt: "2024-01-13T09:15:00Z",
        employer: "Agarwal Family",
        applications: 2
    },
    {
        id: 4,
        title: "Food delivery partner needed",
        description: "Deliver food orders in Gurgaon area. Own vehicle required.",
        skillRequired: "delivery",
        budget: 300,
        location: "Gurgaon, Delhi",
        urgent: true,
        createdAt: "2024-01-15T16:45:00Z",
        employer: "QuickEats",
        applications: 12
    },
    {
        id: 5,
        title: "House cleaning service",
        description: "Deep cleaning for 3BHK apartment.",
        skillRequired: "cleaning",
        budget: 1200,
        location: "Koramangala, Bangalore",
        urgent: false,
        createdAt: "2024-01-12T11:00:00Z",
        employer: "Reddy Family",
        applications: 5
    }
];

const mockUsers = [
    {
        id: 1,
        name: "Ramesh Kumar",
        phone: "+919876543210",
        userType: "worker",
        skills: ["plumbing", "electrical"],
        experience: "intermediate",
        location: "Mumbai",
        rating: 4.5,
        completedJobs: 23,
        verified: true
    },
    {
        id: 2,
        name: "Priya Sharma",
        phone: "+919876543211",
        userType: "worker",
        skills: ["cleaning", "cooking"],
        experience: "expert",
        location: "Delhi",
        rating: 4.8,
        completedJobs: 45,
        verified: true
    }
];

const mockCertificates = [
    {
        id: 1,
        userId: 1,
        skill: "plumbing",
        issueDate: "2024-01-10",
        blockchainHash: "0x1234567890abcdef",
        verified: true,
        verifierName: "Mumbai Plumbers Association"
    },
    {
        id: 2,
        userId: 1,
        skill: "electrical",
        issueDate: "2024-01-05",
        blockchainHash: "0xabcdef1234567890",
        verified: true,
        verifierName: "Electrical Workers Union"
    }
];

// Store in localStorage for persistence
if (!localStorage.getItem('udyami_jobs')) {
    localStorage.setItem('udyami_jobs', JSON.stringify(mockJobs));
}

if (!localStorage.getItem('udyami_users')) {
    localStorage.setItem('udyami_users', JSON.stringify(mockUsers));
}

if (!localStorage.getItem('udyami_certificates')) {
    localStorage.setItem('udyami_certificates', JSON.stringify(mockCertificates));
}