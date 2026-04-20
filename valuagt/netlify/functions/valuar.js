exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ERROR: ANTHROPIC_API_KEY no está configurada.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada en el servidor." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Body inválido: " + e.message })
    };
  }

  console.log("Llamando a Anthropic API...");

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: body.messages
      })
    });
  } catch (e) {
    console.error("Error al conectar con Anthropic:", e.message);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "No se pudo conectar con Anthropic: " + e.message })
    };
  }

  const data = await response.json();
  console.log("Respuesta de Anthropic, status HTTP:", response.status);

  if (!response.ok) {
    console.error("Anthropic devolvió error:", JSON.stringify(data));
    return {
      statusCode: response.status,
      body: JSON.stringify({ error: "Error de Anthropic: " + JSON.stringify(data) })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
};
