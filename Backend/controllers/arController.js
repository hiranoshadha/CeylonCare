const axios = require("axios");
const { getDoc, doc } = require("firebase/firestore");
const { db } = require("../firebaseConfig");

// Therapy Recommendation API
const getARRecommendations = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    console.error("[ERROR] No userId provided in request.");
    return res.status(400).json({ error: "User ID is required" });
  }

  console.log(`[DEBUG] Received request to fetch therapy for user: ${userId}`);

  try {
    const response = await axios.get(`http://localhost:5000/healthData/${userId}`);
    console.log(`[DEBUG] Fetching health data for user: ${userId}, Response status: ${response.status}`);

    if (response.status !== 200) {
      throw new Error(`Error fetching health data: ${response.statusText}`);
    }

    const userHealthData = response.data;
    console.log("[DEBUG] Fetched user health data:", JSON.stringify(userHealthData, null, 2));

    const flaskResponse = await axios.post("http://localhost:5001/predict", userHealthData);

    console.log("[DEBUG] Flask API Full Response:", JSON.stringify(flaskResponse.data, null, 2));

    if (!flaskResponse.data || !flaskResponse.data.recommendations) {
      console.error("[ERROR] Flask response does not contain recommendations.");
      return res.status(500).json({ error: "Invalid response from Flask API" });
    }

    res.status(200).json({ recommendations: flaskResponse.data.recommendations });
  } catch (error) {
    console.error(`[ERROR] Failed to fetch therapy recommendations: ${error.message}`);
    console.error("[DEBUG] Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to fetch therapy recommendations", details: error.message });
  }
};

// Fetch Therapy Details API
const getTherapyDetails = async (req, res) => {
  const { therapyName } = req.params;

  if (!therapyName) {
    console.error("[ERROR] No therapy name provided in request.");
    return res.status(400).json({ error: "Therapy name is required" });
  }

  console.log(`[DEBUG] Fetching details for therapy: ${therapyName}`);

  try {
    console.log("[DEBUG] Firestore db object:", db ? "Initialized" : "Not initialized");

    const normalizedTherapyName = therapyName
      .trim()
      .replace(/%20/g, " ")
      .replace(/-/g, " ");

    console.log(`[DEBUG] Normalized therapy name: ${normalizedTherapyName}`);

    if (!db) {
      throw new Error("Firestore db is not initialized");
    }

    const therapyRef = doc(db, "therapies", normalizedTherapyName);
    console.log("[DEBUG] Therapy reference created:", therapyRef.path);

    const therapySnapshot = await getDoc(therapyRef);

    if (!therapySnapshot.exists()) {
      console.error(`[ERROR] No therapy details found for: ${normalizedTherapyName}`);
      return res.status(404).json({ error: `Therapy "${therapyName}" not found in database` });
    }

    const therapyDetails = therapySnapshot.data();
    console.log("[DEBUG] Fetched therapy details:", JSON.stringify(therapyDetails, null, 2));
    console.log("[DEBUG] Reference video field in Firestore:", therapyDetails.reference_video || "Not provided");
    console.log("[DEBUG] Reference video value (if any):", therapyDetails.reference_video ? `"${therapyDetails.reference_video}"` : "None");

    res.status(200).json(therapyDetails);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch therapy details: ${error.message}`);
    console.error("[DEBUG] Stack trace:", error.stack);
    res.status(500).json({ error: "Failed to fetch therapy details", details: error.message });
  }
};

module.exports = { getARRecommendations, getTherapyDetails };