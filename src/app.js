const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const promClient = require('prom-client');

// Initialisation
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_app';

// Initialisation Prometheus 
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Compteur pour les requêtes HTTP
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Histogramme pour les temps de réponse
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Middlewares
app.use(express.json());
app.use(morgan('combined'));

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, '../public')));


// Middleware pour compter les requêtes - ajouter avant les routes
app.use((req, res, next) => {
  // Capture le temps de début
  const start = Date.now();
  
  // Intercepte la méthode res.end pour capturer les métriques avant la fin
  const originalEnd = res.end;
  res.end = function() {
    // Calcule la durée
    const duration = (Date.now() - start) / 1000;
    
    // Capture la route (si c'est une route dynamique, simplifie-la)
    let route = req.originalUrl || req.url;
    // Simplifie les routes avec IDs (ex: /api/tasks/123 → /api/tasks/:id)
    route = route.replace(/\/api\/tasks\/[^/]+/, '/api/tasks/:id');
    
    // Incrémente le compteur de requêtes
    httpRequestCounter.labels(req.method, route, res.statusCode).inc();
    
    // Observe le temps de réponse
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    
    // Appelle la méthode originale
    return originalEnd.apply(this, arguments);
  };
  
  next();
});

// Modèle de données
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', TaskSchema);

// Routes API
// Accueil API
app.get('/api', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de gestion de tâches!' });
});

// Santé de l'application
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Obtenir toutes les tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une tâche
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une tâche
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Endpoint pour les métriques - ajouter avec les autres routes
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Démarrage
const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Interface utilisateur disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Pour les tests