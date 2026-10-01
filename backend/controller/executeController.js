export const execute = async (req, res) => {
  try {
    const { language, code, stdin = "" } = req.body || {};

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: language or code",
      });
    }

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("JDoodle credentials are missing");

      return res.status(500).json({
        success: false,
        message: "Compiler service is not configured on the server",
      });
    }

    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script: code,
        language,
        stdin,
        versionIndex: "0",
      }),
    });

    const result = await response.json();

    console.log("JDoodle response:", result);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.error || "JDoodle execution failed",
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.output || "",
      cpuTime: result.cpuTime,
      memory: result.memory,
      statusCode: result.statusCode,
    });
  } catch (err) {
    console.error("Execution error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Code execution failed",
    });
  }
};
