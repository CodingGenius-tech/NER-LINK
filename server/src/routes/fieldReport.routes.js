const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getFieldReports,
  getFieldReport,
  createFieldReportReport,
} = require("../controllers/fieldReport.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

// ========================================
// MULTER PHOTO STORAGE
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, "../../uploads")
    );
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const filename =
      `field-report-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  },
});

// ========================================
// PHOTO FILTER
// ========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ========================================
// GET ALL
// ========================================

router.get(
  "/",
  authenticateToken,
  getFieldReports
);

// ========================================
// GET BY ID
// ========================================

router.get(
  "/:id",
  authenticateToken,
  getFieldReport
);

// ========================================
// CREATE FIELD REPORT
// ========================================

router.post(
  "/",
  authenticateToken,
  upload.single("photo"),
  createFieldReportReport
);

module.exports = router;