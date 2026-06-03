# AFSNOC Project - Aviation Fuel Station Network Operations Center

## Project Name
AFS NOC Platform Technical Upgradation (AFSNOC Project)

## Purpose
The primary purpose of the AFSNOC Project is to modernize the digital platform used by Jio-bp's Aviation Fuel Station Network Operations Center. It replaces legacy manual workflows with an automated, metadata-driven system for station audits, security checks, quality logs, and compliance inspections.

## Architecture
The system utilizes a modern, robust, and scalable architecture:
- **Backend Architecture**: Built with Java Spring Boot following a clean layered architecture (Controller, Service, Repository) to enforce separation of concerns. The Data Transfer Object (DTO) pattern is used for secure and structured payload exchange.
- **Database Engine**: Relational database (MySQL and Microsoft SQL Server) designed to handle dynamic relational structures. Utilizes complex SQL relationships, transactional boundary management, and indexes.
- **Client API Integration**: RESTful APIs optimized for both web frontend and cross-platform Flutter mobile applications.

## Responsibilities
- Engineered a metadata-driven dynamic form engine from scratch.
- Designed database schemas in SSMS (SQL Server Management Studio) and MySQL.
- Built layered Spring Boot REST APIs using the DTO pattern.
- Optimized database query performance using Spring Data JPA.
- Implemented transaction boundaries for multi-table forms.

## Modules
The AFSNOC platform consists of three core operational modules:
1. **QC (Quality Control)**: Manages aviation fuel quality tests, density checks, contamination reports, and laboratory log sheets.
2. **HSE (Health, Safety, and Environment)**: Controls hazard reporting, safety audits, fire safety checks, incident logging, and compliance checklists.
3. **OFS (Operations & Fueling Services)**: Handles daily operational checklists, fueling records, equipment logs, and refueler fleet metrics.

## Dynamic Forms
A key highlight of the upgradation was the creation of the Dynamic Form Engine. It allows administrators to create nested forms dynamically without writing new code:
- Forms are defined in metadata (JSON layout) indicating sections, fields, types (textbox, dropdown, checkbox, radio), validation rules, and dependency relations.
- The backend parses this metadata and automatically renders the form UI and maps submissions to normalized database records.

## Database Design
To handle dynamic forms in a relational database, Mihir designed a schema involving parent/child relationships:
- **Templates Table**: Stores the high-level form layout configuration.
- **Sections Table**: Represents form pages or groups.
- **Fields Table**: Stores field parameters (name, type, options, validation).
- **Submissions Table**: Tracks the metadata of a submission (who, when, status).
- **Values Table**: Stores actual field values mapped to submission IDs and field IDs, ensuring maximum flexibility.

## API Development
- Developed `/api/templates` to register and fetch form layouts.
- Engineered `/api/submissions` to process transaction-based form submissions.
- Built `/api/render` to generate structured JSON schemas for Flutter clients.
- Used validation frameworks to validate inputs server-side.

## Deployment
Deployed on enterprise cloud infrastructure using CI/CD pipelines, integrated with active directory security, and built for high availability under Vercel/Cloud parameters.

## Challenges
1. **Dynamic Schema Mapping**: Mapping highly variable UI forms to a SQL database. Solved by using an Entity-Attribute-Value (EAV) design pattern variant combined with JSON-based metadata mappings.
2. **Transactional Integrity**: Multi-table inserts during nested form submission could fail midway, leaving orphaned rows. Solved by configuring strict Spring Data JPA `@Transactional` boundaries.
3. **SSMS Query Development**: High query latency during multi-table joins. Solved by indexing lookup columns and optimizing fetch joins in Spring Boot.

## Achievements
- Upgraded AFS NOC platform resulting in 40% faster inspection reporting.
- Eliminated database schema changes for new forms, saving days of developer work.
- Built a system capable of rendering forms dynamically on Android/iOS via Flutter.
