// Static mock data for Experiment 1 (UI only).
// From Experiment 4 onward this will be replaced by real REST API calls
// to the Express + MongoDB backend.

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const stats = {
  activeRequests: 7,
  registeredDonors: 342,
  livesSaved: 128,
};

export const emergencyRequests = [
  {
    id: "REQ-1042",
    patientName: "Rahul Deshmukh",
    bloodGroup: "O-",
    unitsNeeded: 3,
    hospital: "Sion Hospital, Mumbai",
    urgency: "critical",
    postedAgo: "12 min ago",
    contact: "Requester: Family member",
  },
  {
    id: "REQ-1041",
    patientName: "Ayesha Khan",
    bloodGroup: "B+",
    unitsNeeded: 2,
    hospital: "KEM Hospital, Mumbai",
    urgency: "urgent",
    postedAgo: "40 min ago",
    contact: "Requester: Hospital blood bank",
  },
  {
    id: "REQ-1039",
    patientName: "Vikram Nair",
    bloodGroup: "AB+",
    unitsNeeded: 1,
    hospital: "Lilavati Hospital, Mumbai",
    urgency: "stable",
    postedAgo: "2 hr ago",
    contact: "Requester: Family member",
  },
  {
    id: "REQ-1036",
    patientName: "Sneha Kulkarni",
    bloodGroup: "A-",
    unitsNeeded: 4,
    hospital: "Tata Memorial Hospital, Mumbai",
    urgency: "critical",
    postedAgo: "3 hr ago",
    contact: "Requester: Hospital blood bank",
  },
];

export const donors = [
  { id: "DNR-201", name: "Aditya Rao", bloodGroup: "O-", area: "Andheri East", lastDonation: "3 months ago", available: true },
  { id: "DNR-198", name: "Meera Iyer", bloodGroup: "B+", area: "Powai", lastDonation: "5 months ago", available: true },
  { id: "DNR-176", name: "Farhan Sheikh", bloodGroup: "A-", area: "Bandra West", lastDonation: "1 month ago", available: false },
  { id: "DNR-160", name: "Priya Menon", bloodGroup: "AB+", area: "Ghatkopar", lastDonation: "7 months ago", available: true },
];

export const currentDonor = {
  name: "Sahil Verma",
  bloodGroup: "O+",
  area: "Kandivali West, Mumbai",
  totalDonations: 6,
  lastDonation: "14 Apr 2026",
  eligibleFrom: "14 Jul 2026",
  badges: ["3+ donor", "Rapid responder"],
};

export const donationHistory = [
  { id: "DON-330", date: "14 Apr 2026", hospital: "Sion Hospital, Mumbai", units: 1, status: "completed" },
  { id: "DON-298", date: "02 Dec 2025", hospital: "KEM Hospital, Mumbai", units: 1, status: "completed" },
  { id: "DON-271", date: "19 Aug 2025", hospital: "Lilavati Hospital, Mumbai", units: 1, status: "completed" },
];

// Requests posted by the currently logged-in requester. Once Experiment 4's
// backend exists, this becomes GET /api/requests?requesterId=me instead.
export const myRequests = [
  {
    id: "REQ-0987",
    patientName: "Ramesh Verma (Father)",
    bloodGroup: "B+",
    unitsNeeded: 2,
    hospital: "Kokilaben Hospital, Mumbai",
    urgency: "stable",
    postedAgo: "1 day ago",
    status: "open",
  },
  {
    id: "REQ-0954",
    patientName: "Ramesh Verma (Father)",
    bloodGroup: "B+",
    unitsNeeded: 1,
    hospital: "Kokilaben Hospital, Mumbai",
    urgency: "urgent",
    postedAgo: "3 weeks ago",
    status: "fulfilled",
  },
];
