let app: any;
let loadError: any = null;

async function getApp() {
  if (app) return app;
  if (loadError) throw loadError;
  try {
    const module = await import("../server");
    app = module.default;
    return app;
  } catch (err: any) {
    loadError = err;
    throw err;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (err: any) {
    console.error("Vercel serverless function boot error:", err);
    res.status(500).json({
      error: "Vercel serverless function boot error",
      message: err?.message || String(err),
      stack: err?.stack || "No stack trace available"
    });
  }
}
