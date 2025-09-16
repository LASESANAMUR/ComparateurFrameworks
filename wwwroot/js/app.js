/**
 * @fileoverview Évaluateur de Frameworks - Application pour comparer et évaluer des frameworks selon des critères personnalisés
 * @author Lazare Assie
 * @version 1.0.0
 */

// Variables globales
/** @type {Array<Object>} Liste des critères d'évaluation */
let criteria = [];

/** @type {Array<Object>} Liste des frameworks à évaluer */
let frameworks = [];

/** @type {Object} Objet contenant les évaluations des frameworks */
let evaluations = {};

/**
 * Met à jour la barre de progression visuelle
 * @param {number} activeStep - Numéro de l'étape active (1-4)
 * @example
 * updateProgressBar(2); // Active l'étape 2
 */
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

/**
 * Ajoute un nouveau critère d'évaluation à la liste
 * Récupère les valeurs des champs du formulaire et crée un objet critère
 * @throws {Error} Alert si le nom du critère est vide
 * @example
 * // L'utilisateur remplit les champs et clique sur "Ajouter"
 * addCriterion();
 */
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

/**
 * Affiche la liste des critères dans l'interface utilisateur
 * Génère dynamiquement le HTML pour chaque critère avec bouton de suppression
 */
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

/**
 * Supprime un critère de la liste
 * @param {number} id - Identifiant unique du critère à supprimer
 * @example
 * removeCriterion(1640995200000); // Supprime le critère avec cet ID
 */
function removeCriterion(id) {
    criteria = criteria.filter(c => c.id !== id);
    displayCriteria();
    
    if (criteria.length === 0) {
        document.getElementById('proceed-frameworks').style.display = 'none';
    }
}

/**
 * Passe à l'étape de configuration des frameworks
 * Vérifie qu'au moins un critère a été ajouté avant de continuer
 * @throws {Error} Alert si aucun critère n'a été défini
 */
function proceedToFrameworks() {
    if (criteria.length === 0) {
        alert('Veuillez ajouter au moins un critère');
        return;
    }
    
    document.getElementById('criteria-setup').classList.add('hidden');
    document.getElementById('frameworks-setup').classList.remove('hidden');
    updateProgressBar(2);
}

/**
 * Retourne à l'étape de définition des critères
 */
function goBackToCriteria() {
    document.getElementById('frameworks-setup').classList.add('hidden');
    document.getElementById('criteria-setup').classList.remove('hidden');
    updateProgressBar(1);
}

/**
 * Retourne à l'étape de configuration des frameworks depuis l'évaluation
 */
function goBackToFrameworks() {
    document.getElementById('evaluation-section').classList.add('hidden');
    document.getElementById('frameworks-setup').classList.remove('hidden');
    updateProgressBar(2);
}

/**
 * Retourne à l'étape d'évaluation depuis les résultats
 */
function goBackToEvaluation() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('evaluation-section').classList.remove('hidden');
    updateProgressBar(3);
}

/**
 * Génère les formulaires d'évaluation pour chaque framework
 * Crée la structure de données des frameworks et passe à l'étape d'évaluation
 * @throws {Error} Alert si moins de 2 frameworks sont spécifiés
 */
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

/**
 * Affiche les formulaires d'évaluation pour tous les frameworks
 * Génère dynamiquement les champs de saisie pour chaque critère et sous-critère
 */
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

/**
 * Met à jour le nom d'un framework
 * @param {number} id - Identifiant du framework
 * @param {string} name - Nouveau nom du framework
 * @example
 * updateFrameworkName(1, "React"); // Renomme le framework 1 en "React"
 */
function updateFrameworkName(id, name) {
    const framework = frameworks.find(f => f.id === id);
    if (framework) {
        framework.name = name;
    }
}

/**
 * Met à jour le score d'un framework pour un critère donné
 * @param {number} frameworkId - Identifiant du framework
 * @param {string} criterionId - Identifiant du critère
 * @param {string} subcriterion - Nom du sous-critère (ou 'main' si pas de sous-critères)
 * @param {string|number} score - Score attribué (0-10)
 * @example
 * updateScore(1, "123456789", "performance", "8"); // Attribue 8/10 en performance au framework 1
 */
function updateScore(frameworkId, criterionId, subcriterion, score) {
    const framework = frameworks.find(f => f.id === frameworkId);
    if (!framework.scores[criterionId]) {
        framework.scores[criterionId] = {};
    }
    framework.scores[criterionId][subcriterion] = parseFloat(score) || 0;
}

/**
 * Calcule les résultats finaux de l'évaluation
 * Applique la pondération des critères et trie les frameworks par score décroissant
 * Affiche ensuite les résultats et passe à l'étape finale
 * @returns {void}
 */
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

/**
 * Affiche les résultats de l'évaluation dans un tableau
 * Génère un classement avec médailles et détails par critère
 * @param {Array<Object>} results - Tableau des résultats triés par score décroissant
 * @param {number} results[].totalScore - Score total pondéré
 * @param {string} results[].percentage - Pourcentage de réussite
 * @param {string} results[].name - Nom du framework
 * @param {Object} results[].scores - Détail des scores par critère
 */
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

/**
 * Remet à zéro l'application et retourne à la première étape
 * Vide toutes les données et réinitialise l'interface
 */
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

/**
 * Initialise l'application au chargement de la page
 * Configure l'état initial et affiche un message dans la console
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Évaluateur de Frameworks - Application chargée');
    updateProgressBar(1);
});