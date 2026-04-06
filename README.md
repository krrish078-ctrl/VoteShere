# 🗳️ Online Voting System

A full-stack online voting system built with **React + Vite (frontend)** and **Spring Boot + MySQL (backend)**.

---

## ✅ Completed Features

### Admin Features
- ✅ Create elections with title, description, and end date/time
- ✅ Add multiple candidates (with duplicate prevention)
- ✅ Start voting (changes status from DRAFT → OPEN)
- ✅ Manually close voting (changes status OPEN → CLOSED)
- ✅ Auto-close elections when end time expires (checked every 10s)
- ✅ Generate and display QR codes for voter access
- ✅ Copy voter link to clipboard
- ✅ View real-time results with visual bar charts on the manage page
- ✅ Delete elections (also removes all related voters & votes)

### Voter Features
- ✅ Access election via QR code or direct URL
- ✅ Register with name and roll number (unique per election)
- ✅ Cast one vote per registered voter
- ✅ Countdown timer showing time remaining
- ✅ View results after voting closes

### Security & UX
- ✅ One roll number per election (duplicate prevention)
- ✅ One vote per voter (enforced in localStorage)
- ✅ Voter session management with tokens
- ✅ Anonymous votes (votes not linked to voter identity)
- ✅ Confirmation step before casting vote
- ✅ Form validation on all inputs

---

## 🚀 Installation & Running

```bash
npm install
npm run dev
```
Open your browser to `http://localhost:3000`

---

## 🗺️ URL Structure

| Path | Description |
|------|-------------|
| `/` | Redirects to `/admin` |
| `/admin` | Admin home — list all elections |
| `/admin/create` | Create a new election |
| `/admin/election/:id` | Manage a specific election |
| `/e/:code` | Voter landing page (QR destination) |
| `/e/:code/register` | Voter registration page |
| `/e/:code/vote` | Voting page |
| `/e/:code/results` | Results page |

---

## 👤 Admin Workflow

1. Go to `/admin`
2. Click **"Create New Election"** → fill in title, description, end time
3. On the manage page, add candidates one by one
4. Click **"Start Voting"** — a QR code appears
5. Share the QR code or copy the voter link
6. Voting auto-closes at the end time, or click **"Close Voting"** manually
7. View full results at `/e/{CODE}/results`

## 🗳️ Voter Workflow

1. Scan QR code or open the voter link `/e/{CODE}`
2. View election info and candidates
3. Click **"Register to Vote"** — enter name & roll number
4. Select one candidate and click **"Cast Vote"**
5. Confirm selection → vote is recorded
6. After voting closes, view results

---

## 🗄️ Data Models (Backend)

### Election Object
```json
{
  "id": "uuid",
  "code": "ABC12345",
  "title": "Student Council 2024",
  "description": "...",
  "status": "DRAFT | OPEN | CLOSED",
  "candidates": [{ "id": "uuid", "name": "John Doe" }],
  "startsAt": "ISO-string | null",
  "endsAt": "ISO-string",
  "createdAt": "ISO-string",
  "totalVotes": 0
}
```

### Voter Object
```json
{
  "id": "uuid",
  "electionId": "uuid",
  "name": "Jane Smith",
  "rollNo": "CS2021001",
  "token": "uuid",
  "registeredAt": "ISO-string"
}
```

### Vote Object
```json
{
  "id": "uuid",
  "electionId": "uuid",
  "voterId": "uuid",
  "candidateId": "uuid",
  "votedAt": "ISO-string"
}
```

### Browser Storage Keys
| Key | Content |
|-----|---------|
| `admin_jwt` | Admin JWT token for protected admin API calls |
| `voter_session_{electionId}` | Current voter session (per election) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Button.jsx          # Primary/Secondary/Danger/Outline variants
│   ├── Input.jsx           # Label, error, textarea support
│   ├── Card.jsx            # White card container with optional title
│   ├── StatusBadge.jsx     # DRAFT/OPEN/CLOSED pill badge
│   └── CountdownTimer.jsx  # Live countdown with color coding
├── pages/
│   ├── admin/
│   │   ├── AdminHome.jsx        # List all elections
│   │   ├── CreateElection.jsx   # Create election form
│   │   └── ManageElection.jsx   # Full management dashboard
│   └── voter/
│       ├── VoterLanding.jsx     # Election info + action
│       ├── VoterRegister.jsx    # Registration form
│       ├── VotingPage.jsx       # Candidate selection & vote
│       └── ResultsPage.jsx      # Results with bar charts
├── utils/
│   ├── storage.js          # All localStorage operations
│   └── helpers.js          # Date formatting, validation, sessions
├── styles/
│   └── App.css             # Complete stylesheet
├── App.jsx                 # Router setup
└── main.jsx                # React entry point
```

---

## 🔧 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.20.0 | Client-side routing |
| qrcode.react | ^3.1.0 | QR code generation |
| date-fns | ^3.0.0 | Date utilities (installed, available) |
| nanoid | ^5.0.0 | ID generation (installed, available) |
| vite | ^5.0.0 | Build tool & dev server |

---

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2563eb` | Buttons, links, focus states |
| Success Green | `#16a34a` | OPEN status, winner |
| Danger Red | `#dc2626` | CLOSED status, delete |
| Gray | `#6b7280` | DRAFT status, secondary text |
| Background | `#f3f4f6` | Page background |
| White | `#ffffff` | Cards, inputs |
| Text | `#1f2937` | Primary text |

---

## ⚠️ Limitations & Notes

- Election, voter, and vote data are stored in the backend database
- Browser localStorage is used only for client session tokens (`admin_jwt`, `voter_session_*`)
- Configure secure secrets and production CORS domains before deployment

---

## 🔮 Recommended Next Steps

- [ ] Add password protection for admin panel
- [ ] Add election editing (before it starts)
- [ ] Add voter count / participation rate to results
- [ ] Export results as CSV or PDF
- [ ] Add multiple election types (ranked choice, approval voting)
- [ ] Dark mode support
- [ ] Add backend (Node.js/Supabase) for real multi-device support

---

## 🛠️ Spring Boot Backend (New)

A production-ready Java backend is now available in the `backend` folder.

### Backend Stack

- Java 17 + Spring Boot 3
- Spring Data JPA + Hibernate
- MySQL 8 (`online_voting` database)
- Spring Security + JWT

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### Backend Docs

- Detailed setup and endpoint guide: `backend/README.md`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Core Backend APIs

- `POST /api/auth/login`
- `POST /api/admin/elections`
- `POST /api/admin/elections/{id}/candidates`
- `PUT /api/admin/elections/{id}/start`
- `PUT /api/admin/elections/{id}/close`
- `POST /api/voters/register`
- `POST /api/votes` (requires `X-Voter-Token`)
- `GET /api/elections/by-code/{code}`
- `GET /api/elections/{id}/results`

---

## 🌐 Production Deploy Checklist (Scanner + API)

Set these values before deploying so QR scanner and voting requests work end-to-end:

### Frontend Environment

- `VITE_API_BASE_URL=https://your-backend-domain.com`

### Backend Environment / Properties

- `app.cors.allowed-origins=https://your-frontend-domain.com`
- `app.voting-link-base=https://your-frontend-domain.com/e`

Notes:

- Keep HTTPS enabled in production for reliable scanner/browser behavior.
- If you allow multiple frontend domains, use comma-separated origins in `app.cors.allowed-origins`.
