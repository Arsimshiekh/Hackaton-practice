const app = {
    // 1. STATE MANAGEMENT
    state: {
        currentUser: null,
        currentView: 'home',
        resume: {
            personal: { name: '', title: '', email: '', phone: '', location: '' },
            summary: '',
            skills: [],
            education: [],
            experience: []
        }
    },
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderView();
        console.log("ARSIM Engine Initialized");
    },
    cacheDOM() {
        this.dom = {
            views: document.querySelectorAll('.view'),
            authButtons: document.getElementById('auth-buttons-out'),
            userMenu: document.getElementById('user-menu'),
            displayUser: document.getElementById('display-user'),
            loginForm: document.getElementById('form-login'),
            signupForm: document.getElementById('form-signup'),
            resumePreview: document.getElementById('resume-preview'),
            skillInput: document.getElementById('skill-input'),
            eduList: document.getElementById('education-list'),
            expList: document.getElementById('experience-list'),
            // Preview Elements
            prevSkills: document.getElementById('prev-skills'),
            prevEdu: document.getElementById('prev-education'),
            prevExp: document.getElementById('prev-experience')
        };
    },
    // 2. ROUTING & NAVIGATION
    navigateTo(viewId) {
        this.state.currentView = viewId;
        this.renderView();
        window.scrollTo(0, 0);
    },
    renderView() {
        // Switch View
        this.dom.views.forEach(view => {
            view.classList.add('hidden');
            view.classList.remove('active');
            if (view.id === `view-${this.state.currentView}`) {
                view.classList.remove('hidden');
                view.classList.add('active');
            }
        });
        // Update Auth UI
        if (this.state.currentUser) {
            this.dom.authButtons.classList.add('hidden');
            this.dom.userMenu.classList.remove('hidden');
            this.dom.displayUser.textContent = this.state.currentUser.name;
        } else {
            this.dom.authButtons.classList.remove('hidden');
            this.dom.userMenu.classList.add('hidden');
        }
    },
    // 3. AUTHENTICATION
    handleStart() {
        if (this.state.currentUser) {
            this.navigateTo('builder');
        } else {
            this.showAuth('login');
        }
    },
    showAuth(mode) {
        this.navigateTo('auth');
        this.toggleAuthMode(mode);
    },
    toggleAuthMode(mode) {
        if (mode === 'login') {
            this.dom.loginForm.classList.remove('hidden');
            this.dom.signupForm.classList.add('hidden');
        } else {
            this.dom.loginForm.classList.add('hidden');
            this.dom.signupForm.classList.remove('hidden');
        }
    },
    login(email, name = "User") {
        // Simulator login
        this.state.currentUser = { name, email };
        this.navigateTo('builder');
    },
    logout() {
        this.state.currentUser = null;
        this.navigateTo('home');
        this.resetForm();
    },
    // 4. RESUME BUILDER LOGIC
    bindEvents() {
        // Navigation
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(e.target.dataset.link);
            });
        });
        // Auth Forms
        this.dom.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login(e.target.email.value);
        });
        this.dom.signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login(e.target.email.value, e.target.name.value);
        });
        // Builder Inputs (Real-time update)
        document.querySelectorAll('input[data-model], textarea[data-model]').forEach(input => {
            input.addEventListener('input', (e) => {
                const path = e.target.dataset.model.split('.');
                if (path.length === 2) {
                    this.state.resume[path[0]][path[1]] = e.target.value;
                } else {
                    this.state.resume[path[0]] = e.target.value;
                }
                this.updatePreview();
            });
        });
    },
    updatePreview() {
        const r = this.state.resume;
        // Text Fields
        document.getElementById('prev-name').textContent = r.personal.name || 'Your Name';
        document.getElementById('prev-title').textContent = r.personal.title || 'Job Title';
        document.getElementById('prev-email').innerHTML = `<i class="fa-solid fa-envelope"></i> ${r.personal.email || 'email@example.com'}`;
        document.getElementById('prev-phone').innerHTML = `<i class="fa-solid fa-phone"></i> ${r.personal.phone || 'Phone'}`;
        document.getElementById('prev-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${r.personal.location || 'Location'}`;
        document.getElementById('prev-summary').textContent = r.summary || 'Your professional summary...';
    },
    // Skills
    addSkill() {
        const val = this.dom.skillInput.value.trim();
        if (val) {
            this.state.resume.skills.push(val);
            this.dom.skillInput.value = '';
            this.renderSkills();
        }
    },
    removeSkill(index) {
        this.state.resume.skills.splice(index, 1);
        this.renderSkills();
    },
    renderSkills() {
        const tagContainer = document.getElementById('skills-tags');
        const prevContainer = this.dom.prevSkills;

        // Editor Tags
        tagContainer.innerHTML = this.state.resume.skills.map((s, i) => `
            <div class="tag">${s} <i class="fa-solid fa-xmark" onclick="app.removeSkill(${i})"></i></div>
        `).join('');
        // Preview Tags
        prevContainer.innerHTML = this.state.resume.skills.map(s => `
            <span class="prev-tag">${s}</span>
        `).join('');
    },
    // Education
    addEducation() {
        this.state.resume.education.push({ degree: '', school: '', year: '' });
        this.renderEducation();
    },
    removeEducation(index) {
        this.state.resume.education.splice(index, 1);
        this.renderEducation();
    },
    renderEducation() {
        this.dom.eduList.innerHTML = this.state.resume.education.map((edu, i) => `
            <div class="list-item">
                <button class="remove-btn" onclick="app.removeEducation(${i})"><i class="fa-solid fa-trash"></i></button>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Degree</label>
                        <input type="text" value="${edu.degree}" oninput="app.updateListItem('education', ${i}, 'degree', this.value)">
                    </div>
                    <div class="form-group">
                        <label>School</label>
                        <input type="text" value="${edu.school}" oninput="app.updateListItem('education', ${i}, 'school', this.value)">
                    </div>
                    <div class="form-group full">
                        <label>Year</label>
                        <input type="text" value="${edu.year}" oninput="app.updateListItem('education', ${i}, 'year', this.value)">
                    </div>
                </div>
            </div>
        `).join('');
        this.renderPreviewLists();
    },
    // Experience
    addExperience() {
        this.state.resume.experience.push({ title: '', company: '', date: '', desc: '' });
        this.renderExperience();
    },
    removeExperience(index) {
        this.state.resume.experience.splice(index, 1);
        this.renderExperience();
    },
    renderExperience() {
        this.dom.expList.innerHTML = this.state.resume.experience.map((exp, i) => `
            <div class="list-item">
                <button class="remove-btn" onclick="app.removeExperience(${i})"><i class="fa-solid fa-trash"></i></button>
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" value="${exp.title}" oninput="app.updateListItem('experience', ${i}, 'title', this.value)">
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" value="${exp.company}" oninput="app.updateListItem('experience', ${i}, 'company', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <input type="text" value="${exp.date}" oninput="app.updateListItem('experience', ${i}, 'date', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea rows="2" oninput="app.updateListItem('experience', ${i}, 'desc', this.value)">${exp.desc}</textarea>
                </div>
            </div>
        `).join('');
        this.renderPreviewLists();
    },
    updateListItem(type, index, key, value) {
        this.state.resume[type][index][key] = value;
        this.renderPreviewLists();
    },
    renderPreviewLists() {
        // Education Preview
        this.dom.prevEdu.innerHTML = this.state.resume.education.map(e => `
            <div class="edu-entry">
                <div class="entry-head">
                    <span class="entry-title">${e.degree || 'Degree'}</span>
                    <span class="entry-date">${e.year || 'Year'}</span>
                </div>
                <div class="entry-sub">${e.school || 'University'}</div>
            </div>
        `).join('');
        // Experience Preview
        this.dom.prevExp.innerHTML = this.state.resume.experience.map(e => `
            <div class="job-entry">
                <div class="entry-head">
                    <span class="entry-title">${e.title || 'Job Title'}</span>
                    <span class="entry-date">${e.date || 'Dates'}</span>
                </div>
                <div class="entry-sub">${e.company || 'Company'}</div>
                <div class="entry-desc">${e.desc || 'Responsibilities...'}</div>
            </div>
        `).join('');
    },
    resetForm() {
        this.state.resume = {
            personal: { name: '', title: '', email: '', phone: '', location: '' },
            summary: '',
            skills: [],
            education: [],
            experience: []
        };
        // Clear Inputs
        document.querySelectorAll('input, textarea').forEach(i => i.value = '');
        this.renderSkills();
        this.renderEducation();
        this.renderExperience();
        this.updatePreview();
    },
    // 5. EXPORT
    generatePDF() {
        const element = this.dom.resumePreview;
        const opt = {
            margin: 0,
            filename: `Resume_${this.state.resume.personal.name || 'Arsim'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    }
};
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
