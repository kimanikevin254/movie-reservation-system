Entities:
    - User(Owner)
    - Theatre
    - Auditorium(Screen)
    - SeatMap
    - Show(Movie)
    - Schedule - links a show to an Auditorium at a specific time

Relationships: 
    - User -> multiple Theatres
    - Theatre -> multiple Auditoriums
    - Theatre -> multiple Shows
    - Auditorium -> one SeatMap
    - Auditorium -> multiple Schedules
    - Schedule -> one Auditorium, one Show