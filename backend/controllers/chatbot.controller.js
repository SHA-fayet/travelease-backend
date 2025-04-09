import Package from "../models/package.model.js";

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

    // Fetch live database packages for context
    const availablePackages = await Package.find({})
      .select("packageName destination packagePrice packageDiscountPrice packageDays packageNights packageDescription");

    let liveDatabaseContext = "Here are the live, bookable travel packages currently available in the database:\n";
    if (availablePackages.length > 0) {
      availablePackages.forEach(pkg => {
        const activePrice = (pkg.packageDiscountPrice > 0) ? pkg.packageDiscountPrice : pkg.packagePrice;
        liveDatabaseContext += `- Name: "${pkg.packageName || 'Unknown'}", Destination: ${pkg.destination || 'Various'}, Duration: ${pkg.packageDays || 1}D/${pkg.packageNights || 0}N, Price: ৳${activePrice || 0} BDT, Description: ${pkg.packageDescription || "N/A"}\n`;
      });
    } else {
      liveDatabaseContext += "- No packages are currently available.\n";
    }

    const systemPrompt = `
      You are Travel Bhai, the official intelligent travel assistant and smart recommendation engine for TravelEase.
      Recommend suitable packages from the live database below based on the user's request. Keep it friendly, concise, and structured.
      
      LIVE DATABASE:
      ${liveDatabaseContext}
      
      User's Request: ${prompt}
    `;

    let replyText = null;

    // ==========================================
    // TIER 1: TRY GOOGLE GEMINI API FIRST
    // ==========================================
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        const geminiData = await geminiRes.json();
        if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
          replyText = geminiData.candidates[0].content.parts[0].text;
          console.log("✅ Travel Bhai responded successfully via Gemini AI.");
        } else {
          console.warn("⚠️ Gemini API rate limit or error hit. Failing over to Tier 2 (Groq AI)...");
        }
      } catch (geminiErr) {
        console.warn("⚠️ Gemini network failure. Failing over to Tier 2 (Groq AI)...");
      }
    }

    // ==========================================
    // TIER 2: FAILOVER TO GROQ API (MULTI-MODEL ATTEMPTS)
    // ==========================================
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!replyText && groqKey) {
      const groqModels = ["llama-3.1-8b-instant", "gemma2-9b-it", "openai/gpt-oss-120b"];

      for (const modelName of groqModels) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: "system", content: "You are Travel Bhai, an AI travel recommendation engine for TravelEase." },
                { role: "user", content: systemPrompt }
              ]
            })
          });

          const groqData = await groqRes.json();
          if (groqRes.ok && groqData.choices?.[0]?.message?.content) {
            replyText = groqData.choices[0].message.content;
            console.log(`✅ Travel Bhai responded successfully via Groq AI using model: ${modelName}`);
            break; // Exit loop on first successful model
          } else {
            console.warn(`⚠️ Groq model '${modelName}' rejected or unavailable, trying next...`);
          }
        } catch (groqModelErr) {
          console.warn(`⚠️ Groq model '${modelName}' network exception.`);
        }
      }
    }

    // ==========================================
    // TIER 3: SMART LOCAL DATABASE RECOMMENDATION ENGINE
    // ==========================================
    if (!replyText) {
      console.log("🔄 All external AI APIs unavailable. Engaging Smart Local Engine fallback.");
      const queryLower = prompt.toLowerCase();
      
      const matchedPackages = availablePackages.filter(pkg => {
        const name = (pkg.packageName || "").toLowerCase();
        const dest = (pkg.destination || "").toLowerCase();
        const desc = (pkg.packageDescription || "").toLowerCase();
        return name.includes(queryLower) || dest.includes(queryLower) || desc.includes(queryLower);
      });

      replyText = "🤖 *(AI traffic high / fallback active)*:\n\n";
      if (matchedPackages.length > 0) {
        replyText += "Here are the best matching trips from our live database:\n";
        matchedPackages.forEach(pkg => {
          const price = pkg.packageDiscountPrice > 0 ? pkg.packageDiscountPrice : pkg.packagePrice;
          replyText += `• **${pkg.packageName || "Package"}** (${pkg.destination || "Destination"}) - ${pkg.packageDays || 1}D/${pkg.packageNights || 0}N for ৳${price || 0} BDT\n`;
        });
      } else {
        replyText += "We have several amazing packages available on our search page! Here are our top recommendations:\n";
        availablePackages.slice(0, 3).forEach(pkg => {
          const price = pkg.packageDiscountPrice > 0 ? pkg.packageDiscountPrice : pkg.packagePrice;
          replyText += `• **${pkg.packageName || "Package"}** (${pkg.destination || "Destination"}) - ৳${price || 0} BDT\n`;
        });
      }
    }

    return res.status(200).json({ success: true, reply: replyText });

  } catch (error) {
    console.error("Travel Bhai Critical Server Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "I am having trouble connecting right now. Please try again later." 
    });
  }
};