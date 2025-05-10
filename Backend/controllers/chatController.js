const axios = require("axios");
const { getDoc, doc } = require("firebase/firestore");
const { db } = require("../firebaseConfig");

// Chat Recommendation API
const getChatRecommendation = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    console.error("[ERROR] No userId provided in request.");
    return res.status(400).json({ error: "User ID is required" });
  }

  console.log(`[DEBUG] Received request to fetch chat recommendation for user: ${userId}`);

  try {
    // Fetch health data from Firestore
    const healthRef = doc(db, "healthData", userId);
    console.log("[DEBUG] Health reference created:", healthRef.path);
    const healthSnapshot = await getDoc(healthRef);

    let userHealthData;
    if (!healthSnapshot.exists()) {
      console.warn(`[WARNING] No health data found for user: ${userId}, using default 'general' condition`);
      userHealthData = { healthCondition: "general" };
    } else {
      userHealthData = healthSnapshot.data();
      console.log("[DEBUG] Fetched user health data:", JSON.stringify(userHealthData, null, 2));
    }

    const userInput = req.body.message || "No message provided";
    console.log(`[DEBUG] Query received: ${userInput}`);
    console.log(`[DEBUG] User health condition: ${userHealthData.healthCondition || 'general'}`);

    // Send chat message and health condition to Flask app
    const flaskResponse = await axios.post("http://192.168.60.22:5001/chat", {
      message: userInput,
      userId: userId,
      healthCondition: userHealthData.healthCondition || "general",
    });

    console.log("[DEBUG] Flask API Full Response:", JSON.stringify(flaskResponse.data, null, 2));
    console.log("[DEBUG] Flask Response Status:", flaskResponse.status);

    if (!flaskResponse.data || !flaskResponse.data.response) {
      console.error("[ERROR] Flask response does not contain a valid response.");
      return res.status(500).json({ error: "Invalid response from Flask API" });
    }

    // Log response details
    const botResponse = flaskResponse.data.response;
    console.log(`[DEBUG] Bot response: ${botResponse}`);
    const isSinhalaResponse = /[\u0D80-\u0DFF]/.test(botResponse);
    const queryIsSinhala = /[\u0D80-\u0DFF]/.test(userInput);
    console.log(`[DEBUG] Query language (inferred): ${queryIsSinhala ? 'Sinhala' : 'English'}`);
    console.log(`[DEBUG] Response language (inferred): ${isSinhalaResponse ? 'Sinhala' : 'English'}`);
    if (queryIsSinhala !== isSinhalaResponse) {
      console.error(`[ERROR] Language mismatch: Query language '${queryIsSinhala ? 'Sinhala' : 'English'}', Response language '${isSinhalaResponse ? 'Sinhala' : 'English'}'`);
    }

    res.status(200).json({ response: botResponse });
  } catch (error) {
    console.error(`[ERROR] Failed to fetch chat recommendation: ${error.message}`);
    console.error("[DEBUG] Stack trace:", error.stack);
    if (error.response) {
      console.error("[DEBUG] Flask API Error Response:", JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ error: "Failed to fetch chat recommendation", details: error.message });
  }
};

module.exports = { getChatRecommendation };