// blockchain.js - Complete Blockchain Implementation for Udyami

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.data) + 
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        
        console.log(`Block mined: ${this.hash}`);
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount, type = 'payment', metadata = {}) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.type = type; // 'payment', 'certificate', 'contract'
        this.metadata = metadata;
        this.timestamp = new Date().toISOString();
        this.signature = null;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.fromAddress + 
            this.toAddress + 
            this.amount + 
            this.type + 
            JSON.stringify(this.metadata) + 
            this.timestamp
        ).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class UdyamiBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.certificates = new Map();
        this.contracts = new Map();
        this.wallets = new Map();
        this.skillVerifications = new Map();
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2024", {
            type: "genesis",
            message: "Udyami Genesis Block - Empowering India's Gig Workers"
        }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTransaction = new Transaction(
            null, 
            miningRewardAddress, 
            this.miningReward,
            'mining_reward'
        );
        this.pendingTransactions.push(rewardTransaction);

        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        
        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    createTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalance(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.data) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    // Skill Verification System
    async verifySkill(userId, skillName, workSample) {
        console.log(`Verifying skill: ${skillName} for user: ${userId}`);
        
        // Simulate AI-powered skill verification
        const aiScore = await this.simulateAIVerification(skillName, workSample);
        
        const verification = {
            userId,
            skillName,
            score: aiScore,
            timestamp: new Date().toISOString(),
            verified: aiScore >= 70,
            evidence: workSample
        };

        this.skillVerifications.set(`${userId}_${skillName}`, verification);
        
        if (verification.verified) {
            await this.issueCertificate(userId, skillName, aiScore);
        }
        
        return verification;
    }

    async simulateAIVerification(skillName, workSample) {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate AI scoring (70-95 for valid samples)
        const baseScore = Math.floor(Math.random() * 25) + 70;
        
        // Bonus for certain skills
        const bonusSkills = ['web development', 'data analysis', 'digital marketing'];
        const bonus = bonusSkills.includes(skillName.toLowerCase()) ? 5 : 0;
        
        return Math.min(baseScore + bonus, 95);
    }

    async issueCertificate(userId, skillName, score) {
        const certificateId = `CERT_${userId}_${skillName}_${Date.now()}`;
        
        const certificate = {
            id: certificateId,
            userId,
            skillName,
            score,
            issueDate: new Date().toISOString(),
            issuer: 'Udyami Platform',
            blockchainHash: null
        };

        // Create blockchain transaction for certificate
        const certTransaction = new Transaction(
            'udyami_system',
            userId,
            0,
            'certificate',
            certificate
        );

        this.pendingTransactions.push(certTransaction);
        
        // Mine the block to add certificate to blockchain
        this.minePendingTransactions('udyami_system');
        
        // Store certificate reference
        this.certificates.set(certificateId, certificate);
        
        console.log(`Certificate issued: ${certificateId}`);
        return certificate;
    }

    // Smart Contract System
    createJobContract(jobId, employerId, workerId, amount, terms) {
        const contractId = `CONTRACT_${jobId}_${Date.now()}`;
        
        const contract = {
            id: contractId,
            jobId,
            employerId,
            workerId,
            amount,
            terms,
            status: 'active',
            createdAt: new Date().toISOString(),
            milestones: [],
            escrowAmount: amount
        };

        // Create escrow transaction
        const escrowTransaction = new Transaction(
            employerId,
            contractId,
            amount,
            'escrow',
            { contractId, type: 'job_escrow' }
        );

        this.pendingTransactions.push(escrowTransaction);
        this.contracts.set(contractId, contract);
        
        return contract;
    }

    submitWork(contractId, workerId, workSubmission) {
        const contract = this.contracts.get(contractId);
        
        if (!contract) {
            throw new Error('Contract not found');
        }

        if (contract.workerId !== workerId) {
            throw new Error('Unauthorized work submission');
        }

        contract.workSubmission = workSubmission;
        contract.status = 'pending_review';
        contract.submittedAt = new Date().toISOString();
        
        this.contracts.set(contractId, contract);
        
        console.log(`Work submitted for contract: ${contractId}`);
        return contract;
    }

    approveWork(contractId, employerId, rating = 5) {
        const contract = this.contracts.get(contractId);
        
        if (!contract) {
            throw new Error('Contract not found');
        }

        if (contract.employerId !== employerId) {
            throw new Error('Unauthorized approval');
        }

        // Release payment
        const paymentTransaction = new Transaction(
            contractId,
            contract.workerId,
            contract.amount,
            'payment',
            { 
                contractId, 
                type: 'work_payment',
                rating 
            }
        );

        this.pendingTransactions.push(paymentTransaction);
        
        contract.status = 'completed';
        contract.completedAt = new Date().toISOString();
        contract.rating = rating;
        
        this.contracts.set(contractId, contract);
        
        console.log(`Work approved and payment released for contract: ${contractId}`);
        return contract;
    }

    // Wallet Management
    createWallet(userId) {
        const wallet = {
            userId,
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString()
        };

        this.wallets.set(userId, wallet);
        return wallet;
    }

    getWallet(userId) {
        return this.wallets.get(userId) || this.createWallet(userId);
    }

    // Certificate Verification
    verifyCertificate(certificateId) {
        const certificate = this.certificates.get(certificateId);
        
        if (!certificate) {
            return { valid: false, message: 'Certificate not found' };
        }

        // Verify on blockchain
        for (const block of this.chain) {
            for (const transaction of block.data) {
                if (transaction.type === 'certificate' && 
                    transaction.metadata.id === certificateId) {
                    return { 
                        valid: true, 
                        certificate,
                        blockHash: block.hash,
                        blockIndex: block.index
                    };
                }
            }
        }

        return { valid: false, message: 'Certificate not found on blockchain' };
    }

    // Government Benefits Integration
    checkBenefitEligibility(userId) {
        const user = JSON.parse(localStorage.getItem('udyami_user') || '{}');
        const wallet = this.getWallet(userId);
        
        const eligibility = {
            ayushmanBharat: user.income < 200000, // Annual income < 2 lakh
            pmsby: user.age >= 18 && user.age <= 50,
            microCredit: wallet.balance < 10000,
            skillDevelopment: true
        };

        return eligibility;
    }

    // Analytics and Reporting
    getBlockchainStats() {
        const stats = {
            totalBlocks: this.chain.length,
            totalTransactions: this.chain.reduce((sum, block) => sum + block.data.length, 0),
            totalCertificates: this.certificates.size,
            totalContracts: this.contracts.size,
            totalWallets: this.wallets.size,
            pendingTransactions: this.pendingTransactions.length
        };

        return stats;
    }

    getUserStats(userId) {
        const wallet = this.getWallet(userId);
        const userCertificates = Array.from(this.certificates.values())
            .filter(cert => cert.userId === userId);
        const userContracts = Array.from(this.contracts.values())
            .filter(contract => contract.workerId === userId || contract.employerId === userId);

        return {
            balance: wallet.balance,
            certificatesEarned: userCertificates.length,
            contractsCompleted: userContracts.filter(c => c.status === 'completed').length,
            totalEarnings: userContracts
                .filter(c => c.status === 'completed' && c.workerId === userId)
                .reduce((sum, c) => sum + c.amount, 0)
        };
    }
}

// Initialize blockchain
const udyamiBlockchain = new UdyamiBlockchain();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UdyamiBlockchain, Block, Transaction };
}

// Global functions for UI integration
window.verifySkill = async function(skillName, workSample) {
    const user = JSON.parse(localStorage.getItem('udyami_user') || '{}');
    if (!user.phone) {
        alert('Please login first');
        return;
    }

    try {
        const verification = await udyamiBlockchain.verifySkill(user.phone, skillName, workSample);
        
        if (verification.verified) {
            showNotification(`Skill verified! Score: ${verification.score}%`, 'success');
            return verification;
        } else {
            showNotification(`Verification failed. Score: ${verification.score}%`, 'error');
            return verification;
        }
    } catch (error) {
        showNotification('Verification failed: ' + error.message, 'error');
        return null;
    }
};

window.createJobContract = function(jobId, employerId, workerId, amount, terms) {
    try {
        const contract = udyamiBlockchain.createJobContract(jobId, employerId, workerId, amount, terms);
        showNotification('Job contract created successfully!', 'success');
        return contract;
    } catch (error) {
        showNotification('Failed to create contract: ' + error.message, 'error');
        return null;
    }
};

window.verifyCertificate = function(certificateId) {
    const verification = udyamiBlockchain.verifyCertificate(certificateId);
    
    if (verification.valid) {
        showNotification('Certificate is valid and verified on blockchain!', 'success');
    } else {
        showNotification('Certificate verification failed: ' + verification.message, 'error');
    }
    
    return verification;
};

window.getBlockchainStats = function() {
    return udyamiBlockchain.getBlockchainStats();
};

window.getUserStats = function(userId) {
    return udyamiBlockchain.getUserStats(userId);
};

// Utility function for notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }

    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

console.log('🔗 Udyami Blockchain initialized successfully!');