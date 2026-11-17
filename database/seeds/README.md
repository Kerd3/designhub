# Seed data

The seed data lives in one place: [`shared/demo-data.json`](../../shared/demo-data.json).

- The frontend mock API imports it directly.
- The backend's memory driver loads it at start-up.
- `npm run db:seed` (in `backend/`) truncates the PostgreSQL tables and inserts it.

Because every data source reads the same file, dashboard statistics are identical
whichever source the app uses: 10 projects (4 active, 3 completed), 7 clients,
18 tasks (14 pending), 6 team members and 9 inquiries (3 new).

All people, companies, emails and phone numbers are fictional. Emails use the
reserved `.example` domain; phone numbers use the 555 fictional range.
