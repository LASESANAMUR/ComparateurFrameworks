// Variables globales
let criteria = [];
let frameworks = [];
let evaluations = {};

// Gestion de la barre de progression
function updateProgressBar(activeStep) {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed');
        if (i < activeStep) {
            step.classList.add('completed');
        } else if (i === activeStep) {
            step.classList.add('active');
        }
    }
}

// Gestion des critères
function addCriterion() {
    const name = document.getElementById('criterion-name').value.trim();
    const weight = parseInt(document.getElementById('criterion-weight').value);
    const subcriteriaText = document.getElementById('subcriteria').value.trim();
    
    if (!name) {
        alert('Veuillez saisir un nom de critère');
        return;
    }
    
    const subcriteria = subcriteriaText ? 
        subcriteriaText.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const criterion = {
        id: Date.now(),
        name: name,
        weight: weight,
        subcriteria: subcriteria
    };
    
    criteria.push(criterion);
    displayCriteria();
    
    // Vider les champs
    document.getElementById('criterion-name').value = '';
    document.getElementById('criterion-weight').value = '5';
    document.getElementById('subcriteria').value = '';
    
    document.getElementById('proceed-frameworks').style.display = 'inline-block';
}

function displayCriteria() {
    const list = document.getElementById('criteria-list');
    list.innerHTML = '';
    
    criteria.forEach(criterion => {
        const div = document.createElement('div');
        div.className = 'criterion-item';
        div.innerHTML = `
            <div>
                <strong>${criterion.name}</strong> (Poids: ${criterion.weight}/10)
                ${criterion.subcriteria.length > 0 ? 
                    `<div class="subcriteria">Sous-critères: ${criterion.subcriteria.join(', ')}</div>` : ''}
            </div>
            <button class="button danger" onclick="removeCriterion(${criterion.id})">🗑️</button>
        `;
        list.appendChild(div);
    });
}

function removeCriterion(id) {
    criteria = criteria.filter(c => c.id !== id);
    displayCriteria();
    
    if (criteria.length === 0) {
        document.getElementById('proceed-frameworks').style.display = 'none';
    }
}

// Navigation entre étapes
function proceedToFrameworks() {
    if (criteria.length === 0) {
        alert('Veuillez ajouter au moins un critère');
        return;
    }
    
    document.getElementById('criteria-setup').classList.add('hidden');
    document.getElementById('frameworks-setup').classList.remove('hidden');
    updateProgressBar(2);
}

function goBackToCriteria() {
    document.getElementById('frameworks-setup').classList.add('hidden');
    document.getElementById('criteria-setup').classList.remove('hidden');
    updateProgressBar(1);
}

function goBackToFrameworks() {
    document.getElementById('evaluation-section').classList.add('hidden');
    document.getElementById('frameworks-setup').classList.remove('hidden');
    updateProgressBar(2);
}

function goBackToEvaluation() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('evaluation-section').classList.remove('hidden');
    updateProgressBar(3);
}

// Génération des formulaires
function generateFrameworkForms() {
    const count = parseInt(document.getElementById('frameworks-count').value);
    
    if (count < 2) {
        alert('Vous devez évaluer au moins 2 frameworks');
        return;
    }
    
    frameworks = [];
    for (let i = 1; i <= count; i++) {
        frameworks.push({
            id: i,
            name: `Framework ${i}`,
            scores: {}
        });
    }
    
    displayFrameworkForms();
    document.getElementById('frameworks-setup').classList.add('hidden');
    document.getElementById('evaluation-section').classList.remove('hidden');
    updateProgressBar(3);
}

function displayFrameworkForms() {
    const container = document.getElementById('framework-forms');
    container.innerHTML = '';
    
    frameworks.forEach((framework, index) => {
        const div = document.createElement('div');
        div.className = 'framework-form';
        
        let formHTML = `
            <h3>📦 ${framework.name}</h3>
            <div class="input-group">
                <label>Nom du framework :</label>
                <input type="text" id="framework-name-${framework.id}" value="${framework.name}" 
                       onchange="updateFrameworkName(${framework.id}, this.value)">
            </div>
        `;
        
        criteria.forEach(criterion => {
            if (criterion.subcriteria.length > 0) {
                formHTML += `<h4>${criterion.name} (Poids: ${criterion.weight})</h4>`;
                criterion.subcriteria.forEach(subcrit => {
                    formHTML += `
                        <div class="score-input">
                            <label>${subcrit}:</label>
                            <input type="number" min="0" max="10" value="5" 
                                   onchange="updateScore(${framework.id}, '${criterion.id}', '${subcrit}', this.value)">
                            <span class="weight-display">/10</span>
                        </div>
                    `;
                });
            } else {
                formHTML += `
                    <div class="score-input">
                        <label>${criterion.name}:</label>
                        <input type="number" min="0" max="10" value="5" 
                               onchange="updateScore(${framework.id}, '${criterion.id}', 'main', this.value)">
                        <span class="weight-display">/10 (Poids: ${criterion.weight})</span>
                    </div>
                `;
            }
        });
        
        div.innerHTML = formHTML;
        container.appendChild(div);
    });
    
    document.getElementById('compare-button').style.display = 'inline-block';
}

// Gestion des scores
function updateFrameworkName(id, name) {
    const framework = frameworks.find(f => f.id === id);
    if (framework) {
        framework.name = name;
    }
}

function updateScore(frameworkId, criterionId, subcriterion, score) {
    const framework = frameworks.find(f => f.id === frameworkId);
    if (!framework.scores[criterionId]) {
        framework.scores[criterionId] = {};
    }
    framework.scores[criterionId][subcriterion] = parseFloat(score) || 0;
}

// Calcul des résultats
function calculateResults() {
    const results = frameworks.map(framework => {
        let totalScore = 0;
        let maxPossibleScore = 0;
        
        criteria.forEach(criterion => {
            const criterionScores = framework.scores[criterion.id] || {};
            let criterionAverage = 0;
            
            if (criterion.subcriteria.length > 0) {
                let sum = 0;
                let count = 0;
                criterion.subcriteria.forEach(subcrit => {
                    sum += criterionScores[subcrit] || 5;
                    count++;
                });
                criterionAverage = count > 0 ? sum / count : 5;
            } else {
                criterionAverage = criterionScores['main'] || 5;
            }
            
            totalScore += criterionAverage * criterion.weight;
            maxPossibleScore += 10 * criterion.weight;
        });
        
        return {
            ...framework,
            totalScore: totalScore,
            percentage: maxPossibleScore > 0 ? (totalScore / maxPossibleScore * 100).toFixed(1) : 0
        };
    });
    
    results.sort((a, b) => b.totalScore - a.totalScore);
    displayResults(results);
    
    document.getElementById('evaluation-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    updateProgressBar(4);
}

function displayResults(results) {
    const container = document.getElementById('results-content');
    
    let html = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Framework</th>
                    <th>Score Total</th>
                    <th>Pourcentage</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach((result, index) => {
        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        html += `
            <tr class="${rankClass}">
                <td>${medal} ${index + 1}</td>
                <td>${result.name}</td>
                <td>${result.totalScore.toFixed(2)}</td>
                <td>${result.percentage}%</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    // Ajouter les détails par critère
    html += '<h3>📊 Détail par Critère</h3>';
    
    results.forEach((result, index) => {
        html += `<h4>${index + 1}. ${result.name}</h4>`;
        html += '<div style="margin-left: 20px;">';
        
        criteria.forEach(criterion => {
            const scores = result.scores[criterion.id] || {};
            let displayScore;
            
            if (criterion.subcriteria.length > 0) {
                let sum = 0;
                let count = 0;
                criterion.subcriteria.forEach(subcrit => {
                    sum += scores[subcrit] || 5;
                    count++;
                });
                displayScore = count > 0 ? (sum / count).toFixed(1) : '5.0';
            } else {
                displayScore = (scores['main'] || 5).toFixed(1);
            }
            
            html += `<p><strong>${criterion.name}:</strong> ${displayScore}/10 (Poids: ${criterion.weight})</p>`;
        });
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Redémarrage
function restartEvaluation() {
    criteria = [];
    frameworks = [];
    evaluations = {};
    
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('criteria-setup').classList.remove('hidden');
    
    document.getElementById('criteria-list').innerHTML = '';
    document.getElementById('proceed-frameworks').style.display = 'none';
    
    updateProgressBar(1);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Évaluateur de Frameworks - Application chargée');
    updateProgressBar(1);
});