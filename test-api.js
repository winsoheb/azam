// Native fetch available in Node >= 18

async function test() {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama2-70b",
        messages: [
          { role: "user", content: "hello" }
        ],
        max_tokens: 10
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("NVIDIA API Error:", res.status, err);
    } else {
      const data = await res.json();
      console.log("Success:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
