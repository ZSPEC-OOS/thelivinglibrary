// Create Page Logic

let currentStep = 1;
let formData = {
    concept: '',
    genre: '',
    tone: '',
    length: '',
    pov: '',
    elements: '',
    structure: '',
    requirements: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateReviewPanel();
});

function setupEventListeners() {
    // Character count
    const conceptInput = document.getElementById('conceptInput');
    const charCount = document.querySelector('.char-count');
    
    conceptInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = `${count} / 500`;
        if (count > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = '500 / 500';
        }
        formData.concept = this.value;
    });

    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            conceptInput.value = this.dataset.prompt;
            formData.concept = this.dataset.prompt;
            charCount.textContent = `${this.dataset.prompt.length} / 500`;
        });
    });

    // Detail selects
    document.getElementById('genreSelect').addEventListener('change', function() {
        formData.genre = this.value;
    });
    
    document.getElementById('toneSelect').addEventListener('change', function() {
        formData.tone = this.value;
    });
    
    document.getElementById('lengthSelect').addEventListener('change', function() {
        formData.length = this.value;
    });
    
    document.getElementById('povSelect').addEventListener('change', function() {
        formData.pov = this.value;
    });

    document.getElementById('elementsInput').addEventListener('input', function() {
        formData.elements = this.value;
    });

    // Structure cards
    document.querySelectorAll('.structure-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.structure-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            formData.structure = this.dataset.structure;
            formData.structureLabel = this.querySelector('h3').textContent;
        });
    });

    document.getElementById('requirementsInput').addEventListener('input', function() {
        formData.requirements = this.value;
    });
}

function nextStep(step) {
    // Validation
    if (step === 2 && !formData.concept.trim()) {
        alert('Please enter a concept for your book.');
        return;
    }
    
    if (step === 4) {
        if (!formData.genre || !formData.tone || !formData.length || !formData.pov) {
            alert('Please fill in all details.');
            return;
        }
        updateReviewPanel();
        generatePrompt();
    }

    if (step === 4 && !formData.structure) {
        alert('Please select a structure.');
        return;
    }

    // Update UI
    document.querySelectorAll('.prompt-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    
    // Mark previous as completed
    for (let i = 1; i < step; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
    }

    currentStep = step;
}

function prevStep(step) {
    document.querySelectorAll('.prompt-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    
    for (let i = 1; i <= step; i++) {
        const stepEl = document.querySelector(`.step[data-step="${i}"]`);
        if (i === step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.add('completed');
        }
    }

    currentStep = step;
}

function updateReviewPanel() {
    document.getElementById('reviewConcept').textContent = formData.concept || '-';
    document.getElementById('reviewGenre').textContent = formData.genre || '-';
    document.getElementById('reviewTone').textContent = formData.tone || '-';
    document.getElementById('reviewLength').textContent = formData.length || '-';
    document.getElementById('reviewPOV').textContent = formData.pov || '-';
    document.getElementById('reviewStructure').textContent = formData.structureLabel || '-';
}

function generatePrompt() {
    const prompt = `Create a ${formData.length} ${formData.genre} story written in ${formData.pov} point of view.

CONCEPT: ${formData.concept}

TONE: ${formData.tone}

${formData.elements ? `KEY ELEMENTS: Include ${formData.elements}.` : ''}

STRUCTURE: Use a ${formData.structureLabel} narrative structure.

${formData.requirements ? `SPECIAL REQUIREMENTS: ${formData.requirements}` : ''}

Please provide:
1. A compelling title
2. Chapter-by-chapter outline
3. Opening scene (1000 words)
4. Character profiles for main characters`;

    document.getElementById('generatedPrompt').textContent = prompt;
}

function generateBook() {
    // Hide step 4, show result
    document.getElementById('step4').classList.remove('active');
    document.getElementById('stepResult').classList.add('active');
    
    // Simulate generation
    setTimeout(() => {
        document.querySelector('.generation-status').style.display = 'none';
        document.querySelector('.result-panel').style.display = 'block';
        
        // Generate title from concept
        const words = formData.concept.split(' ').slice(0, 5);
        document.getElementById('resultTitle').textContent = words.join(' ') + '...';
    }, 3000);
}

function resetForm() {
    currentStep = 1;
    formData = {
        concept: '',
        genre: '',
        tone: '',
        length: '',
        pov: '',
        elements: '',
        structure: '',
        requirements: ''
    };
    
    // Reset UI
    document.querySelectorAll('.prompt-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
    });
    document.querySelector('.step[data-step="1"]').classList.add('active');
    
    document.querySelector('.generation-status').style.display = 'block';
    document.querySelector('.result-panel').style.display = 'none';
    
    // Clear inputs
    document.getElementById('conceptInput').value = '';
    document.querySelector('.char-count').textContent = '0 / 500';
    document.getElementById('genreSelect').value = '';
    document.getElementById('toneSelect').value = '';
    document.getElementById('lengthSelect').value = '';
    document.getElementById('povSelect').value = '';
    document.getElementById('elementsInput').value = '';
    document.querySelectorAll('.structure-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('requirementsInput').value = '';
}

function saveBook() {
    alert('Book saved to your library!');
    // Add actual save logic here
}
