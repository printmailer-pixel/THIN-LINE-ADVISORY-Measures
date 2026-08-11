function doPost(e) {
  try {
    // Parse the incoming JSON payload
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Create an array for the new row
    // You will need to map these to match the exact columns in your sheet
    const rowData = [
      new Date(), // Timestamp
      data.demographics.callSign || "",
      data.demographics.email || "",
      data.demographics.age || "",
      data.demographics.gender || "",
      data.demographics.role || "",
      data.demographics.status || "",
      data.demographics.years || "",
      data.demographics.leadership || "",
      data.demographics.military || "",
      data.demographics.combat || "",
      data.demographics.orgType || "",
      data.demographics.setting || "",
      data.scores.springer || 0,
      data.scores.springerInterpretation || "",
      data.scores.cape || 0,
      data.scores.capeInterpretation || "",
      data.scores.pcl5 || 0,
      data.scores.pcl5Interpretation || "",
      data.scores.gad7 || 0,
      data.scores.gad7Interpretation || "",
      data.scores.phq9 || 0,
      data.scores.phq9Interpretation || "",
      data.scores.cssrs || 0,
      data.scores.cssrsInterpretation || ""
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Send email with scores if an email was provided
    if (data.demographics.email) {
      sendResultsEmail(data);
    }
    
    // Check if we need to flag concerning scores
    checkConcerningScores(data);
    
    return ContentService.createTextOutput(JSON.stringify({ "success": true, "message": "Data received successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "success": false, "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendResultsEmail(data) {
  const email = data.demographics.email;
  const subject = "Your THIN LINE ADVISORY Measure Results";
  
  let body = "Thank you for completing the measures. Here are your results:\n\n";
  
  body += "1. Springer Measure of Elasticity\n";
  body += "Score: " + data.scores.springer + "\n";
  body += "Interpretation: " + data.scores.springerInterpretation + "\n\n";
  
  body += "2. Checklist of Adverse Professional Experiences (CAPE)\n";
  body += "Score: " + data.scores.cape + "\n";
  body += "Interpretation: " + data.scores.capeInterpretation + "\n\n";
  
  body += "3. PCL-5 (Post-Traumatic Stress Symptoms)\n";
  body += "Score: " + data.scores.pcl5 + "\n";
  body += "Interpretation: " + data.scores.pcl5Interpretation + "\n\n";
  
  body += "4. GAD-7 (Anxiety)\n";
  body += "Score: " + data.scores.gad7 + "\n";
  body += "Interpretation: " + data.scores.gad7Interpretation + "\n\n";
  
  body += "5. PHQ-9 (Depression)\n";
  body += "Score: " + data.scores.phq9 + "\n";
  body += "Interpretation: " + data.scores.phq9Interpretation + "\n\n";
  
  body += "If you have any questions or would like to talk through your results, please reach out.\n\n";
  body += "Resources for support:\n";
  body += "- 988 Suicide & Crisis Lifeline: https://988lifeline.org\n";
  body += "- Veterans Crisis Line: https://www.veteranscrisisline.net\n";
  
  MailApp.sendEmail(email, subject, body);
}

function checkConcerningScores(data) {
  let isConcerning = false;
  let concerns = [];
  
  // Example flagging thresholds:
  if (data.scores.pcl5 >= 32) {
    isConcerning = true;
    concerns.push("High PCL-5 score (" + data.scores.pcl5 + ")");
  }
  if (data.scores.phq9 >= 15) {
    isConcerning = true;
    concerns.push("High PHQ-9 score (" + data.scores.phq9 + ")");
  }
  if (data.scores.cssrs > 0) {
    isConcerning = true;
    concerns.push("Positive CSSRS score (" + data.scores.cssrs + ")");
  }
  
  // If concerning, send an email alert to yourself
  if (isConcerning) {
    // Replace with your actual email address
    const adminEmail = "your-email@example.com"; 
    const subject = "ACTION REQUIRED: Concerning Measure Results - " + (data.demographics.callSign || "Unknown");
    
    let body = "A respondent just submitted measures with concerning scores.\n\n";
    body += "Call Sign: " + (data.demographics.callSign || "Not provided") + "\n";
    body += "Concerns:\n- " + concerns.join("\n- ") + "\n\n";
    body += "Full Scores:\n";
    body += "Springer: " + data.scores.springer + "\n";
    body += "CAPE: " + data.scores.cape + "\n";
    body += "PCL-5: " + data.scores.pcl5 + "\n";
    body += "GAD-7: " + data.scores.gad7 + "\n";
    body += "PHQ-9: " + data.scores.phq9 + "\n";
    body += "CSSRS: " + data.scores.cssrs + "\n";
    
    MailApp.sendEmail(adminEmail, subject, body);
  }
}
