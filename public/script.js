// Éléments DOM
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const tasksList = document.getElementById('tasks-list');
const apiStatus = document.getElementById('api-status');

// URL de base pour l'API
const API_URL = '/api/tasks';

// Fonction pour charger les tâches depuis l'API
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const tasks = await response.json();
        renderTasks(tasks);
        
        // Mise à jour du statut API
        updateApiStatus('Connecté', true);
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        tasksList.innerHTML = `<li class="error">Erreur lors du chargement des tâches: ${error.message}</li>`;
        
        // Mise à jour du statut API
        updateApiStatus(`Erreur: ${error.message}`, false);
    }
}

// Fonction pour ajouter une nouvelle tâche
async function addTask(title) {
    if (!title.trim()) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const newTask = await response.json();
        taskInput.value = '';
        
        // Recharger la liste des tâches
        loadTasks();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la tâche:', error);
        alert(`Erreur lors de l'ajout de la tâche: ${error.message}`);
    }
}

// Fonction pour marquer une tâche comme terminée/non terminée
async function toggleTaskStatus(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !completed })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des tâches
        loadTasks();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        alert(`Erreur lors de la mise à jour de la tâche: ${error.message}`);
    }
}

// Fonction pour supprimer une tâche
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des tâches
        loadTasks();
        
    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        alert(`Erreur lors de la suppression de la tâche: ${error.message}`);
    }
}

// Fonction pour afficher les tâches dans la liste
function renderTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<li class="empty-list">Aucune tâche pour le moment. Ajoutez-en une!</li>';
        return;
    }
    
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskItem.innerHTML = `
            <span class="task-text">${task.title}</span>
            <div class="task-actions">
                <button class="btn btn-complete">${task.completed ? 'Annuler' : 'Terminer'}</button>
                <button class="btn btn-delete">Supprimer</button>
            </div>
        `;
        
        // Ajouter les gestionnaires d'événements
        const completeButton = taskItem.querySelector('.btn-complete');
        const deleteButton = taskItem.querySelector('.btn-delete');
        
        completeButton.addEventListener('click', () => toggleTaskStatus(task._id, task.completed));
        deleteButton.addEventListener('click', () => deleteTask(task._id));
        
        tasksList.appendChild(taskItem);
    });
}

// Fonction pour mettre à jour le statut de l'API
function updateApiStatus(message, isConnected) {
    apiStatus.textContent = `Statut: ${message}`;
    apiStatus.style.color = isConnected ? '#2ecc71' : '#e74c3c';
}

// Vérifier l'état de santé de l'API
async function checkApiHealth() {
    try {
        const response = await fetch('/health');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const health = await response.json();
        updateApiStatus(`Connecté (v${health.version})`, true);
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'état:', error);
        updateApiStatus(`Déconnecté: ${error.message}`, false);
    }
}

// Gestionnaires d'événements
addTaskButton.addEventListener('click', () => addTask(taskInput.value));
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

// Charger les tâches au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    checkApiHealth();
    loadTasks();
});