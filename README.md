# Todo API DevOps Project

A simple Todo API application with complete DevOps setup including Docker containerization, CI/CD pipeline with GitHub Actions, and monitoring with Prometheus and Grafana.

## Features

- RESTful API for managing todo tasks
- Web interface for task management
- Containerized with Docker
- CI/CD pipeline with GitHub Actions
- Monitoring with Prometheus and Grafana
- Health check endpoint

## API Endpoints

| Method | Endpoint      | Description                   |
|--------|---------------|-------------------------------|
| GET    | /api          | Welcome message               |
| GET    | /api/tasks    | Get all tasks                 |
| POST   | /api/tasks    | Create a new task            |
| PUT    | /api/tasks/:id | Update a task by ID          |
| DELETE | /api/tasks/:id | Delete a task by ID          |
| GET    | /health       | Health check                  |
| GET    | /metrics      | Prometheus metrics            |

## Requirements

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB (provided via Docker Compose)

## Running the Application

### Option 1: Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose, which will set up the API, MongoDB, Prometheus, and Grafana services.

```bash
# Clone the repository
git clone https://github.com/yourusername/todo-api-devops.git
cd todo-api-devops

# Start all services
docker-compose up
```

Once started, you can access:
- Todo App: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (default credentials: admin/admin)

### Option 2: Development Mode

If you want to run the application in development mode:

```bash
# Clone the repository
git clone https://github.com/yourusername/todo-api-devops.git
cd todo-api-devops

# Install dependencies
npm install

# Make sure MongoDB is running
# You can start MongoDB separately or use:
docker-compose up mongo

# Start the development server with hot reload
npm run dev
```

The API will be available at http://localhost:3000.

## CI/CD Pipeline

This project utilizes GitHub Actions for continuous integration and continuous deployment:

1. **Test Stage**: Runs automated tests to ensure code quality
2. **Build Stage**: Builds the Docker image 
3. **Push Stage**: Pushes the Docker image to Docker Hub

The pipeline is triggered on:
- Push to main, develop, and feature/github-actions-pipeline branches
- Pull requests to main branch

### GitHub Actions Configuration

The CI/CD pipeline is defined in `.github/workflows/ci.yml`. It uses the following secrets:
- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_TOKEN`: Your Docker Hub access token

## Monitoring

### Prometheus

Prometheus is configured to scrape metrics from the API every 15 seconds. The configuration is stored in `prometheus/prometheus.yml`.

The API exposes the following metrics:
- Standard Node.js metrics
- HTTP request counter
- HTTP request duration

Prometheus is accessible at http://localhost:9090.

### Grafana

Grafana is preconfigured to use Prometheus as a data source. You can create dashboards to visualize:
- API performance metrics
- Request counts by endpoint
- Response times
- System metrics

Grafana is accessible at http://localhost:3001 with default credentials (admin/admin).

## Author

Ossama Zarani
