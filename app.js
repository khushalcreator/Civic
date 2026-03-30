// app.js – Civic Issue Tracker with Excel storage

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const twilio = require("twilio");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const XLSXStyle = require("xlsx-style");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// ---------------- Excel "Database" ----------------
const EXCEL_FILE = path.join(__dirname, "civic.xlsx");
const SHEET_NAME = "Reports";

function initExcel() {
  if (!fs.existsSync(EXCEL_FILE)) {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);

    // Style header row
    const header = ["id", "text", "category", "urgency", "phone", "latitude", "longitude", "status", "media", "upvotes", "createdAt"];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: "A1" });
    header.forEach((key, idx) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "C6EFCE" } },
          font: { bold: true, color: { rgb: "006100" } },
          alignment: { horizontal: "center" },
        };
      }
    });

    XLSXStyle.writeFile(wb, EXCEL_FILE);
    console.log("📘 Created new civic.xlsx database");
  } else {
    console.log("✅ Database ready (civic.xlsx)");
  }
}
initExcel();

function readReports() {
  const wb = XLSX.readFile(EXCEL_FILE);
  const ws = wb.Sheets[SHEET_NAME];
  const rows = XLSX.utils.sheet_to_json(ws);
  return rows;
}

function writeReports(rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
  XLSXStyle.writeFile(wb, EXCEL_FILE);
}

// ---------------- Classification ----------------
function classifyIssue(text) {
  text = (text || "").toLowerCase();
  if (text.includes("pothole") || text.includes("road")) return "Road";
  if (text.includes("garbage") || text.includes("trash") || text.includes("waste")) return "Sanitation";
  if (text.includes("light") || text.includes("lamp") || text.includes("streetlight")) return "Streetlight";
  if (text.includes("water") || text.includes("drain") || text.includes("sewage")) return "Water/Drainage";
  if (text.includes("tree") || text.includes("park") || text.includes("green")) return "Environment";
  if (text.includes("electric") || text.includes("wire") || text.includes("power")) return "Electricity";
  return "General";
}

// ---------------- Helpers ----------------
function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function computeUrgency(category, latitude, longitude, reports) {
  const RADIUS_KM = 50;
  const nearby = reports.filter(
    (r) =>
      r.category === category &&
      r.latitude &&
      r.longitude &&
      haversine(latitude, longitude, parseFloat(r.latitude), parseFloat(r.longitude)) <= RADIUS_KM
  );
  const count = nearby.length + 1;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  return 1;
}

// ---------------- Twilio ----------------
const TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxx"; // replace
const TWILIO_AUTH_TOKEN = "xxxxxxxxxxxx"; // replace
const TWILIO_NUMBER = "+1xxxxxxxxxx"; // replace
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// ---------------- Routes ----------------
app.get("/", (req, res) => res.redirect("/citizen.html"));

app.post("/report", upload.single("media"), async (req, res) => {
  try {
    const { text, category, phone, latitude, longitude, urgency } = req.body;
    const lat = parseFloat(latitude) || null;
    const lon = parseFloat(longitude) || null;
    const reports = readReports();
    const newCat = category || classifyIssue(text);
    const newUrg = urgency || computeUrgency(newCat, lat, lon, reports);
    const mediaFile = req.file ? "/uploads/" + req.file.filename : null;
    const newReport = {
      id: reports.length + 1,
      text,
      category: newCat,
      urgency: newUrg,
      phone,
      latitude: lat,
      longitude: lon,
      status: "open",
      media: mediaFile,
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };
    reports.push(newReport);
    writeReports(reports);
    res.json({ message: "Report saved", ...newReport });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/reports", (req, res) => {
  res.json(readReports());
});

app.post("/report/:id/upvote", (req, res) => {
  const reports = readReports();
  const id = parseInt(req.params.id);
  const report = reports.find((r) => r.id === id);
  if (!report) return res.status(404).json({ error: "Not found" });
  report.upvotes++;
  writeReports(reports);
  res.json({ message: "👍 Upvoted", upvotes: report.upvotes });
});

app.post("/report/:id/status", (req, res) => {
  const reports = readReports();
  const id = parseInt(req.params.id);
  const report = reports.find((r) => r.id === id);
  if (!report) return res.status(404).json({ error: "Not found" });
  report.status = req.body.status || "updated";
  writeReports(reports);
  res.json({ message: `Status updated to ${report.status}` });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Civic App running at http://localhost:${PORT}`));
