export default {
  async fetch(request, env) {
    // Handle CORS preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",            // Allow all origins, or replace * with your domain
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "POST") {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
          return new Response("Expected multipart/form-data", {
            status: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
          return new Response("No file in 'file' field", {
            status: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }

        const bucket = env.MY_BUCKET;
        if (!bucket) {
          return new Response("R2 bucket not bound", {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }

        const fileName = file.name || `upload-${Date.now()}`;
        await bucket.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        return new Response(`Uploaded: ${fileName}`, {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      } catch (e) {
        return new Response("Upload error: " + e.message, {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    // Default fallback response for other methods
    return new Response("Send a POST with a file form field.", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};
