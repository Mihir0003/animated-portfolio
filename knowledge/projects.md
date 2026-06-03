# Projects - Mihir Amodwala

## 1. MicroStore - E-Commerce Microservices
- **Project Name**: MicroStore
- **Description**: An enterprise-grade, scalable e-commerce system that segregates product management and order processing into independent services. Features a futuristic HTML5 shopping cart dashboard that manages state securely on the client side before dispatching transactions.
- **Technology Stack**: Java Spring Boot, Microservices Architecture, Spring Data JPA, REST Communication (RestTemplate), H2/MySQL database, HTML5, CSS3, JavaScript.
- **Responsibilities**:
  - Engineered the separation of inventory (Product Service) from sales processing (Order Service) using independent Spring Boot JVM instances.
  - Implemented synchronous communication between services using RestTemplates to automatically verify inventory during checkout.
  - Designed an immersive storefront dashboard featuring Indian Rupee (INR) formatting, async mock payment gateways, and custom CSS animations.
- **Outcome**: Successfully demonstrated service decoupling in a distributed system, enabling services to run on separate ports and communicate over REST, mitigating cascade failures.

## 2. TaskFlow - Agile Kanban Board
- **Project Name**: TaskFlow Kanban
- **Description**: A full-stack, real-time Agile task management Kanban board. Features persistent columns (To Do, In Progress, Done) with smooth drag-and-drop mechanics and instant database synchronization.
- **Technology Stack**: Java Spring Boot, Spring Data JPA, H2 Database, JavaScript (Vanilla), Tailwind/Glassmorphism CSS, HTML5 Drag and Drop API, Docker, Hugging Face Spaces.
- **Responsibilities**:
  - Developed backend REST endpoints to CRUD tasks and update task statuses using Spring Data JPA.
  - Built an interactive frontend using Vanilla JavaScript and HTML5 Drag-and-Drop API to handle drag events and trigger API requests.
  - Configured Docker containerization (multi-stage Dockerfile) and deployed the project to Hugging Face Spaces.
- **Outcome**: A fully functional, persistent Kanban application. Live deployment running at: [https://erc003-taskflow.hf.space](https://erc003-taskflow.hf.space).

## 3. EchoChat - Real-Time Communication Platform
- **Project Name**: EchoChat Private HQ
- **Description**: A professional-grade real-time chat matrix supporting multiple rooms. Offers secure, isolated communication through temporary rooms that are generated automatically.
- **Technology Stack**: Python, FastAPI, WebSockets, HTML5, Vanilla JavaScript, CSS Glassmorphism, Docker, Hugging Face Spaces.
- **Responsibilities**:
  - Implemented real-time WebSocket connection handlers in FastAPI.
  - Designed an auto-generated secure URL session mechanic allowing users to share room links for instant isolated group chats.
  - Engineered the client-side UI with a Discord-inspired layout, incorporating live debounced typing indicators, private whispers, and markdown message rendering.
- **Outcome**: Deployed a scalable, real-time chatting backend via Docker. Live deployment running at: [https://erc003-echochat.hf.space](https://erc003-echochat.hf.space).
