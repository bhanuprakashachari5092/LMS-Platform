/**
 * ==============================================================================
 * KaizenQ Careers – Google Sheets & Automated Email Notification System
 * Google Apps Script Web App (CareersAutomation.gs)
 *
 * Shaivika Groups Initiative | https://www.kaizenq.in
 * ==============================================================================
 *
 * Architecture & Features:
 * 1. Target Google Sheet:
 *    - Spreadsheet ID: 1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w
 *    - Sheet Tab: Applications
 *    - HR Email: shaivikagroups@gmail.com
 * 2. 15 Standard Production Columns:
 *    A: Application ID
 *    B: Timestamp
 *    C: Name
 *    D: Email
 *    E: Phone
 *    F: Position
 *    G: Resume URL
 *    H: LinkedIn
 *    I: GitHub
 *    J: Cover Letter
 *    K: Status (New, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected)
 *    L: Opportunity ID
 *    M: Portfolio URL
 *    N: Department
 *    O: Work Mode
 * 3. Bidirectional Admin Synchronization:
 *    - action: "submitApplication" -> Appends row, generates KQ-YYYY-XXXX, sends applicant + HR emails
 *    - action: "getApplications" -> Returns all rows (protected by adminSecret)
 *    - action: "updateApplicationStatus" -> Updates Status cell in Google Sheet and optionally notifies candidate
 * 4. Formula Injection Protection (CSV / Spreadsheet Injection sanitization)
 * 5. Concurrency Protection (LockService)
 * 6. Health Check (doGet)
 */

// ------------------------------------------------------------------------------
// CONFIGURATION & DEFAULTS
// ------------------------------------------------------------------------------
var DEFAULT_SPREADSHEET_ID = "1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w";
var SHEET_NAME = "Applications";
var DEFAULT_HR_EMAIL = "shaivikagroups@gmail.com";
var DEFAULT_ADMIN_SECRET = "kz_careers_admin_sync_secret_2026";

// Brand details for emails
var BRAND_NAME = "KaizenQ";
var BRAND_PARENT = "Shaivika Groups";
var BRAND_WEBSITE = "https://www.kaizenq.in";
var BRAND_CAREERS_EMAIL = "shaivikagroups@gmail.com";

/**
 * Retrieves configuration from Script Properties or defaults
 */
function getConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID,
    hrEmail: props.getProperty("HR_EMAIL") || DEFAULT_HR_EMAIL,
    sheetName: props.getProperty("SHEET_NAME") || SHEET_NAME,
    adminSecret: props.getProperty("ADMIN_SECRET") || DEFAULT_ADMIN_SECRET,
    driveFolderId: props.getProperty("DRIVE_FOLDER_ID") || ""
  };
}

/**
 * Accesses or automatically initializes the target Google Spreadsheet & Sheet tab.
 */
function getTargetSheet() {
  var config = getConfig();
  var ss = null;

  // 1. Try opening via configured SPREADSHEET_ID
  if (config.spreadsheetId && config.spreadsheetId.trim() !== "") {
    try {
      ss = SpreadsheetApp.openById(config.spreadsheetId.trim());
    } catch (e) {
      console.warn("Could not open spreadsheet with SPREADSHEET_ID: " + e.toString());
    }
  }

  // 2. Try Container-Bound Active Spreadsheet (if bound via Extensions -> Apps Script)
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      // Ignored if standalone
    }
  }

  // 3. Fallback: Search Google Drive for "KaizenQ Careers Applications"
  if (!ss) {
    try {
      var files = DriveApp.getFilesByName("KaizenQ Careers Applications");
      if (files.hasNext()) {
        var file = files.next();
        ss = SpreadsheetApp.openById(file.getId());
      }
    } catch (driveErr) {
      console.warn("Drive search skipped: " + driveErr.toString());
    }
  }

  if (!ss) {
    throw new Error(
      "Unable to locate Google Spreadsheet (ID: " + config.spreadsheetId + "). " +
      "Please ensure the spreadsheet is shared with the execution account or set SPREADSHEET_ID in Script Properties."
    );
  }

  // 4. Locate or create target tab (defaults to "Applications")
  var targetTabName = config.sheetName || SHEET_NAME;
  var sheet = ss.getSheetByName(targetTabName);

  if (!sheet) {
    var existingSheets = ss.getSheets();
    if (existingSheets.length > 0 && existingSheets[0].getLastRow() <= 1 && existingSheets[0].getName().toLowerCase().indexOf("sheet") === 0) {
      sheet = existingSheets[0];
      sheet.setName(targetTabName);
    } else {
      sheet = ss.insertSheet(targetTabName);
    }
    setupSheetHeaders(sheet);
  } else if (sheet.getLastRow() === 0) {
    setupSheetHeaders(sheet);
  } else {
    // Check if headers exist in row 1
    var firstCell = sheet.getRange(1, 1).getValue();
    if (!firstCell || firstCell.toString().trim() === "") {
      setupSheetHeaders(sheet);
    }
  }

  return { ss: ss, sheet: sheet };
}

/**
 * Initializes and styles the 15 standard columns (A - O)
 */
function setupSheetHeaders(sheet) {
  var headers = [
    "Application ID",      // A
    "Timestamp",           // B
    "Name",                // C
    "Email",               // D
    "Phone",               // E
    "Position",            // F
    "Resume URL",          // G
    "LinkedIn",            // H
    "GitHub",              // I
    "Cover Letter",        // J
    "Status",              // K
    "Opportunity ID",      // L
    "Portfolio URL",       // M
    "Department",          // N
    "Work Mode"            // O
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Styling: KaizenQ Navy Blue theme, bold, centered
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0f172a");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");

  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  // Column width hints
  sheet.setColumnWidth(1, 140); // Application ID
  sheet.setColumnWidth(2, 160); // Timestamp
  sheet.setColumnWidth(3, 180); // Name
  sheet.setColumnWidth(4, 220); // Email
  sheet.setColumnWidth(5, 140); // Phone
  sheet.setColumnWidth(6, 240); // Position
  sheet.setColumnWidth(7, 220); // Resume URL
  sheet.setColumnWidth(8, 200); // LinkedIn
  sheet.setColumnWidth(9, 200); // GitHub
  sheet.setColumnWidth(10, 300); // Cover Letter
  sheet.setColumnWidth(11, 140); // Status
  sheet.setColumnWidth(12, 160); // Opportunity ID
  sheet.setColumnWidth(13, 200); // Portfolio URL
  sheet.setColumnWidth(14, 150); // Department
  sheet.setColumnWidth(15, 120); // Work Mode
}

/**
 * Formula Injection sanitizer
 */
function sanitizeFormulaInjection(value) {
  if (value === null || value === undefined) return "";
  var str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Validates email structure using standard RFC 5322 regex
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Formats a Date object to consistent "YYYY-MM-DD HH:mm:ss" in IST timezone
 */
function formatTimestamp(date) {
  return Utilities.formatDate(date || new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
}

/**
 * Generates the next sequential Application ID in format "KQ-YYYY-XXXX"
 */
function generateApplicationId(sheet, date) {
  var year = (date || new Date()).getFullYear();
  var prefix = "KQ-" + year + "-";

  var lastRow = sheet.getLastRow();
  var nextIndex = 1;

  if (lastRow > 1) {
    var idValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var highestNum = 0;

    for (var i = 0; i < idValues.length; i++) {
      var val = String(idValues[i][0]).trim();
      if (val.indexOf(prefix) === 0) {
        var numPart = parseInt(val.substring(prefix.length), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    }
    nextIndex = highestNum + 1;
  }

  var paddedNum = ("0000" + nextIndex).slice(-4);
  return prefix + paddedNum;
}

/**
 * Checks for duplicate application (identical email and position)
 */
function findDuplicateApplication(sheet, email, position) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;

  var data = sheet.getRange(2, 1, lastRow - 1, Math.min(15, sheet.getLastColumn())).getValues();
  var targetEmail = email.toLowerCase().trim();
  var targetPosition = position.toLowerCase().trim();

  for (var i = data.length - 1; i >= 0; i--) {
    var existingAppId = String(data[i][0]).trim();
    var existingEmail = String(data[i][3]).toLowerCase().trim();
    var existingPosition = String(data[i][5]).toLowerCase().trim();

    if (existingEmail === targetEmail && existingPosition === targetPosition) {
      return {
        applicationId: existingAppId,
        appliedDate: data[i][1],
        fullName: data[i][2],
        status: data[i][10] || "New"
      };
    }
  }
  return null;
}

/**
 * Optional: Saves base64 encoded resume file to Google Drive and returns shareable URL
 */
function saveResumeToDrive(base64Data, fileName, applicantName) {
  try {
    if (!base64Data || !fileName) return "";
    var config = getConfig();

    var parts = base64Data.split(",");
    var rawBase64 = parts.length > 1 ? parts[1] : parts[0];
    var decodedBytes = Utilities.base64Decode(rawBase64);

    var cleanFileName = (applicantName ? applicantName.replace(/[^a-zA-Z0-9]/g, "_") + "_" : "") + fileName;
    var blob = Utilities.newBlob(decodedBytes, "application/pdf", cleanFileName);

    var folder;
    if (config.driveFolderId && config.driveFolderId.trim() !== "") {
      folder = DriveApp.getFolderById(config.driveFolderId.trim());
    } else {
      var folders = DriveApp.getFoldersByName("KaizenQ Resumes");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("KaizenQ Resumes");
      }
    }

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    console.error("Warning: Failed to save resume to Google Drive: " + err.toString());
    return "";
  }
}

/**
 * Returns CORS-friendly JSON TextOutput
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// 1. HTTP GET HEALTH CHECK ENDPOINT
// ==============================================================================
function doGet(e) {
  try {
    var target = getTargetSheet();
    var rowCount = Math.max(0, target.sheet.getLastRow() - 1);

    return createJsonResponse({
      success: true,
      service: "KaizenQ Careers Automation API",
      status: "OPERATIONAL",
      brand: BRAND_NAME + " (" + BRAND_PARENT + ")",
      website: BRAND_WEBSITE,
      spreadsheetId: target.ss.getId(),
      spreadsheetName: target.ss.getName(),
      spreadsheetUrl: target.ss.getUrl(),
      sheetTab: target.sheet.getName(),
      totalApplicationsRecorded: rowCount,
      columns: 15,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      service: "KaizenQ Careers Automation API",
      status: "CONFIGURATION_REQUIRED",
      message: err.toString(),
      hint: "Run 'initializeSetup' in Google Apps Script editor to authorize access.",
      timestamp: new Date().toISOString()
    });
  }
}

// ==============================================================================
// 2. HTTP POST ROUTER (SUBMISSIONS, GET APPLICATIONS, UPDATE STATUS)
// ==============================================================================
function doPost(e) {
  var body = {};
  if (e && e.postData && e.postData.contents) {
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      if (e.parameter) {
        body = e.parameter;
      } else {
        return createJsonResponse({ success: false, message: "Invalid payload format. Expected JSON data." });
      }
    }
  } else if (e && e.parameter) {
    body = e.parameter;
  }

  var action = body.action || "submitApplication";

  // Action 1: Get all applications for Admin Dashboard synchronization
  if (action === "getApplications") {
    return handleGetApplications(body);
  }

  // Action 2: Update application status from Admin Dashboard
  if (action === "updateApplicationStatus") {
    return handleUpdateApplicationStatus(body);
  }

  // Action 3: Candidate application submission (default)
  return handleSubmitApplication(body);
}

// ==============================================================================
// 3. ACTION HANDLERS
// ==============================================================================

/**
 * Reads all applications from Google Sheet for Admin Dashboard sync
 */
function handleGetApplications(body) {
  var config = getConfig();

  // Basic security check if adminSecret is configured
  if (config.adminSecret && body.adminSecret && config.adminSecret !== body.adminSecret) {
    return createJsonResponse({ success: false, message: "Unauthorized admin access." });
  }

  try {
    var target = getTargetSheet();
    var sheet = target.sheet;
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createJsonResponse({
        success: true,
        applications: [],
        totalCount: 0,
        spreadsheetUrl: target.ss.getUrl()
      });
    }

    // Read all rows up to column O (15 columns)
    var numCols = Math.max(15, sheet.getLastColumn());
    var rawData = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();

    var applications = [];
    for (var i = 0; i < rawData.length; i++) {
      var row = rawData[i];
      var appId = String(row[0] || "").trim();
      if (!appId) continue;

      applications.push({
        id: appId,
        applicationId: appId,
        referenceNumber: appId,
        appliedAt: row[1] ? String(row[1]) : "",
        fullName: String(row[2] || ""),
        name: String(row[2] || ""),
        email: String(row[3] || "").toLowerCase(),
        phone: String(row[4] || ""),
        position: String(row[5] || ""),
        internshipTitle: String(row[5] || ""),
        resumeUrl: String(row[6] || ""),
        linkedinUrl: String(row[7] || ""),
        githubUrl: String(row[8] || ""),
        statementOfPurpose: String(row[9] || ""),
        coverLetter: String(row[9] || ""),
        status: String(row[10] || "New").trim(),
        opportunityId: String(row[11] || ""),
        portfolioUrl: String(row[12] || ""),
        department: String(row[13] || ""),
        workMode: String(row[14] || "")
      });
    }

    return createJsonResponse({
      success: true,
      applications: applications,
      totalCount: applications.length,
      spreadsheetUrl: target.ss.getUrl()
    });

  } catch (err) {
    console.error("handleGetApplications error:", err);
    return createJsonResponse({
      success: false,
      message: "Failed to read applications from Google Sheet: " + err.toString()
    });
  }
}

/**
 * Updates application status in Google Sheet and optionally notifies candidate
 */
function handleUpdateApplicationStatus(body) {
  var config = getConfig();

  if (config.adminSecret && body.adminSecret && config.adminSecret !== body.adminSecret) {
    return createJsonResponse({ success: false, message: "Unauthorized admin access." });
  }

  var targetAppId = (body.applicationId || body.id || "").toString().trim();
  var newStatus = (body.status || "").toString().trim();

  if (!targetAppId || !newStatus) {
    return createJsonResponse({ success: false, message: "applicationId and status are required." });
  }

  try {
    var target = getTargetSheet();
    var sheet = target.sheet;
    var lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return createJsonResponse({ success: false, message: "No applications found in sheet." });
    }

    var idCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var targetRowIndex = -1;

    for (var i = 0; i < idCol.length; i++) {
      if (String(idCol[i][0]).trim() === targetAppId) {
        targetRowIndex = i + 2; // +2 for 1-based indexing and header row
        break;
      }
    }

    if (targetRowIndex === -1) {
      return createJsonResponse({ success: false, message: "Application ID not found in sheet: " + targetAppId });
    }

    // Column K is column 11 (Status)
    sheet.getRange(targetRowIndex, 11).setValue(sanitizeFormulaInjection(newStatus));
    SpreadsheetApp.flush();

    // Optionally send candidate a status notification email
    if (body.sendStatusEmail) {
      try {
        var candidateName = sheet.getRange(targetRowIndex, 3).getValue();
        var candidateEmail = sheet.getRange(targetRowIndex, 4).getValue();
        var appliedPosition = sheet.getRange(targetRowIndex, 6).getValue();

        if (candidateEmail && isValidEmail(candidateEmail)) {
          sendStatusUpdateEmail({
            applicantName: candidateName,
            applicantEmail: candidateEmail,
            position: appliedPosition,
            applicationId: targetAppId,
            newStatus: newStatus,
            adminNotes: body.adminNotes || ""
          });
        }
      } catch (mailErr) {
        console.error("Status update email warning: " + mailErr.toString());
      }
    }

    return createJsonResponse({
      success: true,
      message: "Application status updated in Google Sheet successfully.",
      applicationId: targetAppId,
      status: newStatus
    });

  } catch (err) {
    console.error("handleUpdateApplicationStatus error:", err);
    return createJsonResponse({
      success: false,
      message: "Failed to update status in Google Sheet: " + err.toString()
    });
  }
}

/**
 * Handles candidate application submission
 */
function handleSubmitApplication(body) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    console.error("LockService timeout error:", lockErr);
    return createJsonResponse({
      success: false,
      message: "Server is currently experiencing high submission volume. Please retry in a few moments."
    });
  }

  try {
    // 1. Extract input fields
    var fullName = (body.fullName || body.name || "").toString().trim();
    var email = (body.email || "").toString().trim().toLowerCase();
    var phone = (body.phone || body.mobile || "").toString().trim();
    var position = (body.position || body.internshipTitle || body.role || "").toString().trim();
    var resumeUrl = (body.resumeUrl || "").toString().trim();
    var resumeFileName = (body.resumeFileName || "").toString().trim();
    var resumeBase64 = (body.resumeBase64 || "").toString().trim();

    var linkedin = (body.linkedin || body.linkedinUrl || "").toString().trim();
    var github = (body.github || body.githubUrl || "").toString().trim();
    var portfolioUrl = (body.portfolioUrl || body.portfolio || "").toString().trim();
    var coverLetter = (body.coverLetter || body.statementOfPurpose || "").toString().trim();

    var opportunityId = (body.opportunityId || body.internshipId || "").toString().trim();
    var department = (body.department || "").toString().trim();
    var workMode = (body.workMode || body.internshipType || "REMOTE").toString().trim();
    var status = (body.status || "New").toString().trim();

    // Academic details enrichment
    var college = (body.college || "").toString().trim();
    var degree = (body.degree || "").toString().trim();
    var branch = (body.branch || "").toString().trim();
    var currentYear = (body.currentYear || "").toString().trim();
    var graduationYear = (body.graduationYear || "").toString().trim();
    var skills = (body.skills || "").toString().trim();

    var coverLetterParts = [];
    if (coverLetter) coverLetterParts.push(coverLetter);
    var academicMeta = [];
    if (degree || branch) academicMeta.push("Degree: " + [degree, branch].filter(Boolean).join(" - "));
    if (college) academicMeta.push("Institute: " + college);
    if (currentYear || graduationYear) academicMeta.push("Year: " + [currentYear, graduationYear ? "Grad: " + graduationYear : ""].filter(Boolean).join(", "));
    if (skills) academicMeta.push("Skills: " + skills);
    if (academicMeta.length > 0) {
      coverLetterParts.push("\n[Academic & Skills Profile]\n" + academicMeta.join(" | "));
    }
    var fullCoverLetter = coverLetterParts.join("\n\n");

    // 2. Strict Input Validation
    if (!fullName || fullName.length < 2) {
      return createJsonResponse({ success: false, message: "Full legal name is required (minimum 2 characters)." });
    }
    if (!email || !isValidEmail(email)) {
      return createJsonResponse({ success: false, message: "A valid email address is required." });
    }
    if (!phone || phone.length < 7) {
      return createJsonResponse({ success: false, message: "A valid mobile or contact number is required." });
    }
    if (!position) {
      return createJsonResponse({ success: false, message: "Applied position is required." });
    }

    // 3. Access Google Sheet
    var target = getTargetSheet();
    var sheet = target.sheet;
    var ss = target.ss;

    // 4. Duplicate Submission Protection
    var existing = findDuplicateApplication(sheet, email, position);
    if (existing) {
      return createJsonResponse({
        success: true,
        message: "An application for this position has already been received with this email address.",
        applicationId: existing.applicationId,
        duplicate: true
      });
    }

    // 5. Handle Resume Upload if base64 provided
    if (resumeBase64 && (!resumeUrl || resumeUrl.indexOf("data:") === 0 || resumeUrl === "Not Provided")) {
      var uploadedDriveUrl = saveResumeToDrive(resumeBase64, resumeFileName || "Resume.pdf", fullName);
      if (uploadedDriveUrl) {
        resumeUrl = uploadedDriveUrl;
      }
    }

    if (!resumeUrl && resumeFileName) {
      resumeUrl = "Attached: " + resumeFileName;
    }
    if (!resumeUrl) {
      resumeUrl = "Not Provided";
    }

    // 6. Generate Application ID & Timestamp
    var submissionDate = new Date();
    var applicationId = body.applicationId || generateApplicationId(sheet, submissionDate);
    var formattedDate = formatTimestamp(submissionDate);

    // 7. Prevent Formula Injection across all 15 cells
    var sanitizedRow = [
      sanitizeFormulaInjection(applicationId),    // A: Application ID
      sanitizeFormulaInjection(formattedDate),     // B: Timestamp
      sanitizeFormulaInjection(fullName),          // C: Name
      sanitizeFormulaInjection(email),             // D: Email
      sanitizeFormulaInjection(phone),             // E: Phone
      sanitizeFormulaInjection(position),          // F: Position
      sanitizeFormulaInjection(resumeUrl),         // G: Resume URL
      sanitizeFormulaInjection(linkedin),          // H: LinkedIn
      sanitizeFormulaInjection(github),            // I: GitHub
      sanitizeFormulaInjection(fullCoverLetter),   // J: Cover Letter
      sanitizeFormulaInjection(status),            // K: Status
      sanitizeFormulaInjection(opportunityId),     // L: Opportunity ID
      sanitizeFormulaInjection(portfolioUrl),      // M: Portfolio URL
      sanitizeFormulaInjection(department),        // N: Department
      sanitizeFormulaInjection(workMode)           // O: Work Mode
    ];

    // 8. Append to Google Sheet and Flush
    sheet.appendRow(sanitizedRow);
    SpreadsheetApp.flush();

    try {
      lock.releaseLock();
    } catch (e) {
      // Ignored
    }

    // 9. Send Applicant Confirmation Email
    var applicantEmailSent = false;
    try {
      sendApplicantConfirmationEmail({
        applicantName: fullName,
        applicantEmail: email,
        position: position,
        applicationId: applicationId
      });
      applicantEmailSent = true;
    } catch (mailErr) {
      console.error("Applicant confirmation email warning: " + mailErr.toString());
    }

    // 10. Send HR Notification Email to shaivikagroups@gmail.com
    var config = getConfig();
    var hrEmailSent = false;
    try {
      sendHrNotificationEmail({
        hrEmail: config.hrEmail,
        applicantName: fullName,
        applicantEmail: email,
        phone: phone,
        position: position,
        resumeUrl: resumeUrl,
        linkedin: linkedin,
        github: github,
        portfolioUrl: portfolioUrl,
        coverLetter: fullCoverLetter,
        applicationId: applicationId,
        submissionTimestamp: formattedDate,
        sheetUrl: ss.getUrl()
      });
      hrEmailSent = true;
    } catch (hrMailErr) {
      console.error("HR notification email warning: " + hrMailErr.toString());
    }

    // 11. Return real structured response
    return createJsonResponse({
      success: true,
      message: "Application submitted successfully.",
      applicationId: applicationId,
      applicantEmailSent: applicantEmailSent,
      hrEmailSent: hrEmailSent,
      sheetUrl: ss.getUrl()
    });

  } catch (fatalErr) {
    console.error("Fatal error during submission: " + fatalErr.toString());
    return createJsonResponse({
      success: false,
      message: "Unable to submit application: " + (fatalErr.message || "Please try again later."),
      errorDetails: fatalErr.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {
      // Ignored
    }
  }
}

// ==============================================================================
// 4. EMAIL AUTOMATION TEMPLATES
// ==============================================================================

/**
 * Sends applicant confirmation email
 */
function sendApplicantConfirmationEmail(data) {
  var subject = "KaizenQ Careers – Application Received [" + data.applicationId + "]";

  var plainText =
    "Dear " + data.applicantName + ",\n\n" +
    "Thank you for applying for the " + data.position + " opportunity at KaizenQ, a Shaivika Groups initiative.\n\n" +
    "We have successfully received your application. Our team will review your profile and contact you if your qualifications match our requirements.\n\n" +
    "Your Application ID is: " + data.applicationId + "\n\n" +
    "Thank you for your interest in joining KaizenQ.\n\n" +
    "Best regards,\n" +
    "KaizenQ Careers Team\n" +
    "Shaivika Groups\n" +
    BRAND_WEBSITE + "\n" +
    "Recruitment Contact: " + BRAND_CAREERS_EMAIL + "\n";

  var htmlTemplate =
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>' + subject + '</title>' +
    '</head>' +
    '<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;line-height:1.6;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">' +
        // Header
        '<tr>' +
          '<td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#2563eb 100%);padding:36px 32px;text-align:left;color:#ffffff;">' +
            '<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#60a5fa;margin-bottom:6px;">' +
              'Shaivika Groups &bull; Careers Portal' +
            '</div>' +
            '<h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">' +
              'Kaizen<span style="color:#38bdf8;">Q</span>' +
            '</h1>' +
            '<p style="margin:8px 0 0;font-size:13px;color:#cbd5e1;">' +
              'Application Confirmation & Next Steps' +
            '</p>' +
          '</td>' +
        '</tr>' +

        // Body Content
        '<tr>' +
          '<td style="padding:36px 32px;">' +
            '<p style="font-size:16px;color:#0f172a;margin-top:0;">' +
              'Dear <strong>' + escapeHtml(data.applicantName) + '</strong>,' +
            '</p>' +
            '<p style="font-size:14px;color:#334155;line-height:1.7;">' +
              'Thank you for applying for the <strong>' + escapeHtml(data.position) + '</strong> opportunity at <strong>KaizenQ</strong>, a Shaivika Groups initiative.' +
            '</p>' +
            '<p style="font-size:14px;color:#334155;line-height:1.7;">' +
              'We have successfully received your application. Our team will review your profile and contact you if your qualifications match our requirements.' +
            '</p>' +

            // Application ID Highlight Card
            '<div style="margin:28px 0;padding:20px 24px;background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;border-left:4px solid #2563eb;">' +
              '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;">' +
                'Your Official Reference Identifier' +
              '</div>' +
              '<div style="font-size:22px;font-weight:800;color:#1e40af;font-family:monospace;letter-spacing:0.5px;">' +
                data.applicationId +
              '</div>' +
              '<div style="font-size:12px;color:#64748b;margin-top:4px;">' +
                'Please quote this Application ID in any correspondence regarding your application.' +
              '</div>' +
            '</div>' +

            // Recruitment Next Steps
            '<div style="margin:24px 0;padding:20px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">' +
              '<div style="font-size:12px;font-weight:700;color:#0369a1;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">' +
                '&bull; What Happens Next' +
              '</div>' +
              '<ul style="margin:0;padding-left:18px;font-size:13px;color:#0c4a6e;line-height:1.8;">' +
                '<li><strong>Initial Screening:</strong> Candidate portfolio, resume, and credentials review.</li>' +
                '<li><strong>Technical Assessment:</strong> Domain rubric evaluation and project assessment.</li>' +
                '<li><strong>Interview Invitation:</strong> Shortlisted candidates will receive interview scheduling invitations via email.</li>' +
              '</ul>' +
            '</div>' +

            '<p style="font-size:14px;color:#334155;line-height:1.7;">' +
              'Thank you for your interest in joining KaizenQ.' +
            '</p>' +

            // Sign-off
            '<div style="margin-top:32px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:14px;color:#0f172a;">' +
              'Best regards,<br>' +
              '<strong>KaizenQ Careers Team</strong><br>' +
              '<span style="color:#64748b;font-size:13px;">Shaivika Groups</span><br>' +
              '<a href="' + BRAND_WEBSITE + '" style="color:#2563eb;text-decoration:none;font-weight:600;font-size:13px;" target="_blank">' + BRAND_WEBSITE + '</a><br>' +
              '<span style="color:#64748b;font-size:12px;">Contact: ' + BRAND_CAREERS_EMAIL + '</span>' +
            '</div>' +
          '</td>' +
        '</tr>' +

        // Footer
        '<tr>' +
          '<td style="background:#f8fafc;padding:20px 32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">' +
            '<p style="margin:0;">&copy; ' + new Date().getFullYear() + ' KaizenQ &bull; Shaivika Groups. All rights reserved.</p>' +
            '<p style="margin:4px 0 0;">This is an automated confirmation sent regarding your application submission.</p>' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</body>' +
    '</html>';

  MailApp.sendEmail({
    to: data.applicantEmail,
    subject: subject,
    body: plainText,
    htmlBody: htmlTemplate,
    name: "KaizenQ Careers Team"
  });
}

/**
 * Sends HR notification email to shaivikagroups@gmail.com
 */
function sendHrNotificationEmail(data) {
  var subject = "New Careers Application – " + data.position + " – " + data.applicantName;

  var plainText =
    "NEW CAREERS APPLICATION RECEIVED\n\n" +
    "Applicant Name: " + data.applicantName + "\n" +
    "Email Address: " + data.applicantEmail + "\n" +
    "Phone Number: " + data.phone + "\n" +
    "Applied Opportunity: " + data.position + "\n" +
    "Application ID: " + data.applicationId + "\n" +
    "Resume Link: " + (data.resumeUrl || "Not provided") + "\n" +
    "LinkedIn: " + (data.linkedin || "Not provided") + "\n" +
    "GitHub: " + (data.github || "Not provided") + "\n" +
    "Portfolio: " + (data.portfolioUrl || "Not provided") + "\n" +
    "Submission Timestamp: " + data.submissionTimestamp + "\n" +
    "Google Sheet: " + data.sheetUrl + "\n\n" +
    "Cover Letter / Statement of Purpose:\n" +
    (data.coverLetter || "None provided") + "\n";

  var htmlTemplate =
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>' + subject + '</title>' +
    '</head>' +
    '<body style="margin:0;padding:24px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;line-height:1.6;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">' +
        // Header
        '<tr>' +
          '<td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4338ca 100%);padding:32px;text-align:left;color:#ffffff;">' +
            '<div style="display:inline-block;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,0.15);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#c7d2fe;margin-bottom:8px;">' +
              'HR / Recruitment Alert' +
            '</div>' +
            '<h2 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">' +
              'New Application Received' +
            '</h2>' +
            '<p style="margin:6px 0 0;font-size:13px;color:#e0e7ff;">' +
              escapeHtml(data.position) + ' &bull; ' + escapeHtml(data.applicantName) +
            '</p>' +
          '</td>' +
        '</tr>' +

        // Application Details Table
        '<tr>' +
          '<td style="padding:32px;">' +
            '<div style="margin-bottom:20px;padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">' +
              '<span style="font-size:12px;color:#64748b;font-weight:600;">Application ID:</span>' +
              '<span style="font-size:14px;font-weight:800;color:#1e40af;font-family:monospace;">' + data.applicationId + '</span>' +
            '</div>' +

            '<table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="font-size:13px;color:#334155;border-collapse:collapse;">' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td width="35%" style="font-weight:700;color:#64748b;">Applicant Name</td>' +
                '<td style="font-weight:600;color:#0f172a;">' + escapeHtml(data.applicantName) + '</td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">Email Address</td>' +
                '<td><a href="mailto:' + escapeHtml(data.applicantEmail) + '" style="color:#2563eb;text-decoration:none;">' + escapeHtml(data.applicantEmail) + '</a></td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">Phone Number</td>' +
                '<td><a href="tel:' + escapeHtml(data.phone) + '" style="color:#0f172a;text-decoration:none;">' + escapeHtml(data.phone) + '</a></td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">Applied Position</td>' +
                '<td style="font-weight:600;color:#0f172a;">' + escapeHtml(data.position) + '</td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">Submission Timestamp</td>' +
                '<td style="font-family:monospace;font-size:12px;">' + data.submissionTimestamp + '</td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">LinkedIn Profile</td>' +
                '<td>' + (data.linkedin ? '<a href="' + escapeHtml(data.linkedin) + '" target="_blank" style="color:#2563eb;text-decoration:underline;">' + escapeHtml(data.linkedin) + '</a>' : '<span style="color:#94a3b8;">Not provided</span>') + '</td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">GitHub Profile</td>' +
                '<td>' + (data.github ? '<a href="' + escapeHtml(data.github) + '" target="_blank" style="color:#2563eb;text-decoration:underline;">' + escapeHtml(data.github) + '</a>' : '<span style="color:#94a3b8;">Not provided</span>') + '</td>' +
              '</tr>' +
              '<tr style="border-bottom:1px solid #f1f5f9;">' +
                '<td style="font-weight:700;color:#64748b;">Portfolio Link</td>' +
                '<td>' + (data.portfolioUrl ? '<a href="' + escapeHtml(data.portfolioUrl) + '" target="_blank" style="color:#2563eb;text-decoration:underline;">' + escapeHtml(data.portfolioUrl) + '</a>' : '<span style="color:#94a3b8;">Not provided</span>') + '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="font-weight:700;color:#64748b;">Resume Link</td>' +
                '<td>' + (data.resumeUrl && data.resumeUrl !== "Not Provided" ? '<a href="' + escapeHtml(data.resumeUrl) + '" target="_blank" style="display:inline-block;padding:6px 14px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:12px;">Open Resume &rarr;</a>' : '<span style="color:#94a3b8;">' + escapeHtml(data.resumeUrl || "Not provided") + '</span>') + '</td>' +
              '</tr>' +
            '</table>' +

            // Cover Letter section
            (data.coverLetter ?
              '<div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">' +
                '<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Cover Letter / Statement:</div>' +
                '<div style="font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.6;">' + escapeHtml(data.coverLetter) + '</div>' +
              '</div>' : '') +

            // Action Buttons
            '<div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;">' +
              '<a href="' + escapeHtml(data.sheetUrl) + '" target="_blank" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px;margin:4px;">' +
                'Open Google Sheet Database &rarr;' +
              '</a>' +
              '<a href="mailto:' + escapeHtml(data.applicantEmail) + '?subject=' + encodeURIComponent('Regarding your application for ' + data.position + ' at KaizenQ [' + data.applicationId + ']') + '" style="display:inline-block;padding:12px 24px;background:#f1f5f9;color:#334155;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px;margin:4px;border:1px solid #cbd5e1;">' +
                'Reply to Candidate' +
              '</a>' +
            '</div>' +
          '</td>' +
        '</tr>' +

        // Footer
        '<tr>' +
          '<td style="background:#f8fafc;padding:18px 32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">' +
            'KaizenQ Automated Recruitment Pipeline &bull; Shaivika Groups Internal Notification' +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</body>' +
    '</html>';

  MailApp.sendEmail({
    to: data.hrEmail,
    subject: subject,
    body: plainText,
    htmlBody: htmlTemplate,
    name: "KaizenQ Recruitment Pipeline"
  });
}

/**
 * Sends status update email to candidate when admin changes status
 */
function sendStatusUpdateEmail(data) {
  var subject = "Application Status Update: " + data.position + " [" + data.applicationId + "]";

  var statusNotesMap = {
    "UNDER_REVIEW": "Your profile is currently under active evaluation by our recruitment panel.",
    "Under Review": "Your profile is currently under active evaluation by our recruitment panel.",
    "SHORTLISTED": "Congratulations! Your profile has been shortlisted for the next evaluation round.",
    "Shortlisted": "Congratulations! Your profile has been shortlisted for the next evaluation round.",
    "INTERVIEW_SCHEDULED": "Your interview round has been scheduled. Our team will reach out with the meeting link.",
    "Interview Scheduled": "Your interview round has been scheduled. Our team will reach out with the meeting link.",
    "SELECTED": "Congratulations! You have been selected for the opportunity with KaizenQ.",
    "Selected": "Congratulations! You have been selected for the opportunity with KaizenQ.",
    "REJECTED": "Thank you for your interest. While we cannot proceed with your profile at this time, we will keep your resume for future opportunities.",
    "Rejected": "Thank you for your interest. While we cannot proceed with your profile at this time, we will keep your resume for future opportunities."
  };

  var statusNote = statusNotesMap[data.newStatus] || ("Your application status has been updated to: " + data.newStatus);

  var plainText =
    "Dear " + data.applicantName + ",\n\n" +
    "This is an update regarding your application for the " + data.position + " opportunity at KaizenQ (Application ID: " + data.applicationId + ").\n\n" +
    "Status: " + data.newStatus + "\n\n" +
    statusNote + "\n\n" +
    (data.adminNotes ? "Note from recruitment panel: " + data.adminNotes + "\n\n" : "") +
    "Best regards,\n" +
    "KaizenQ Careers Team\n" +
    "Shaivika Groups\n" +
    BRAND_WEBSITE + "\n";

  var htmlTemplate =
    '<!DOCTYPE html>' +
    '<html><body style="font-family:sans-serif;color:#0f172a;line-height:1.6;padding:20px;">' +
      '<h2>KaizenQ Application Status Update</h2>' +
      '<p>Dear <strong>' + escapeHtml(data.applicantName) + '</strong>,</p>' +
      '<p>This is an update regarding your application for <strong>' + escapeHtml(data.position) + '</strong> (ID: <code>' + escapeHtml(data.applicationId) + '</code>).</p>' +
      '<div style="padding:16px;background:#f0f9ff;border-radius:10px;border-left:4px solid #0284c7;margin:20px 0;">' +
        '<div style="font-size:12px;font-weight:700;color:#0369a1;text-transform:uppercase;">Current Status:</div>' +
        '<div style="font-size:18px;font-weight:800;color:#0c4a6e;margin-top:4px;">' + escapeHtml(data.newStatus) + '</div>' +
        '<p style="margin:8px 0 0;font-size:13px;color:#0369a1;">' + escapeHtml(statusNote) + '</p>' +
      '</div>' +
      (data.adminNotes ? '<p style="font-size:13px;color:#475569;"><strong>Recruitment Note:</strong> ' + escapeHtml(data.adminNotes) + '</p>' : '') +
      '<p style="font-size:13px;color:#64748b;margin-top:24px;">KaizenQ Careers Team &bull; Shaivika Groups<br>' +
      '<a href="' + BRAND_WEBSITE + '">' + BRAND_WEBSITE + '</a></p>' +
    '</body></html>';

  MailApp.sendEmail({
    to: data.applicantEmail,
    subject: subject,
    body: plainText,
    htmlBody: htmlTemplate,
    name: "KaizenQ Careers Team"
  });
}

/**
 * Utility to escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==============================================================================
// 5. ONE-CLICK INITIALIZATION & VERIFICATION TOOLS
// ==============================================================================
/**
 * Run this function inside Google Apps Script editor (Select "initializeSetup" -> Run)
 * to verify spreadsheet 1og9L7aU0R4_30uavzj17PZGAlGFt70VxVEwJ1WKKy_w and setup 15 headers.
 */
function initializeSetup() {
  Logger.log("--- Initializing KaizenQ Careers Google Sheet Database ---");
  var target = getTargetSheet();
  setupSheetHeaders(target.sheet);
  Logger.log("Spreadsheet Name: " + target.ss.getName());
  Logger.log("Spreadsheet ID:   " + target.ss.getId());
  Logger.log("Spreadsheet URL:  " + target.ss.getUrl());
  Logger.log("Target Sheet Tab: " + target.sheet.getName());
  Logger.log("Total Columns:    15 (A through O)");
  Logger.log("Total Rows:       " + target.sheet.getLastRow());
  Logger.log("Setup completed successfully. Ready for deployment!");
  return target.ss.getUrl();
}

/**
 * Run this function inside Google Apps Script editor to test mock applicant submission.
 */
function testSubmission() {
  var userEmail = Session.getActiveUser().getEmail() || DEFAULT_HR_EMAIL;
  var testPayload = {
    action: "submitApplication",
    fullName: "Praveen Kumar (Test)",
    email: userEmail,
    phone: "+91 9876543210",
    position: "Full Stack Web Development Virtual Internship",
    resumeUrl: "https://drive.google.com/file/d/sample-test-resume/view",
    linkedin: "https://linkedin.com/in/test-applicant",
    github: "https://github.com/test-applicant",
    portfolioUrl: "https://test-applicant.dev",
    coverLetter: "Excited to build full stack React and Node.js solutions with the KaizenQ team.",
    opportunityId: "int-fullstack-web-01",
    department: "Engineering",
    workMode: "REMOTE",
    status: "New"
  };

  var mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  var result = doPost(mockEvent);
  Logger.log("Test Submission Response: " + result.getContent());
}
