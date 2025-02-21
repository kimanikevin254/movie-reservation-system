Entities:
    - User(Owner)
    - Theatre
    - Auditorium(Screen)
    - Show(Movie)
    - Schedule - links a show to an Auditorium at a specific time

Relationships: 
    - User -> multiple Theatres
    - Theatre -> multiple Auditoriums
    - Theatre -> multiple Shows
    - Auditorium -> one SeatMap
    - Auditorium -> multiple Schedules
    - Schedule -> one Auditorium, one Show

Endpoints grouped by resource type:

- User:

- Theatre:
    - POST /theatres - Create new theatre
    - PATCH /theatres/:id - Update a theatres
    - DELETE /theatres/:id - Delete a theatre
    - GET /theatre/:id - Get theatre details
    - GET /users/me/theatres - Get user theatres

- Auditorium:
    - POST /theatres/auditoriums - Create
    - GET /theatres/auditoriums - Get all theatre auditoriums
    - GET /theatres/auditoriums/:id - Get auditorium details
    - PATCH /theatres/auditoriums/:id - Update auditorium
    - DELETE /theatres/auditoriums/:id - Delete

- Show:
    - POST /shows - Create
    - GET /shows/:id - Show details
    - PATCH /shows/:id - Update
    - DELETE /shows/:id - DELETE
    - GET /users/me/shows - Get user shows

- Schedule:
    - POST /schedules - Create
    - GET /schedules/:id - Details
    - PATCH /schedules/:id - Update
    - DELETE /schedules/:id - Delete
    - GET /theatres/:id/auditoriums/:id/schedules - Auditorium schedules
    - GET /shows/:id/schedules - Shows schedules

- Ticket
    - POST /schedules/:scheduleId/tickets - Create
    - GET /schedules/:id/tickets - Schedule tickets
    - GET /schedules/:scheduleId/tickets/:ticketId - Details
    - DELETE /schedules/:scheduleId/tickets/:ticketId - Delete ticket
    - PATCH /schedules/:scheduleId/tickets/:ticketId - Update

Maybe feats:
    - recommend upcoming shows to users based on their recent purchases. Use redpanda connect to improve the whole flow.