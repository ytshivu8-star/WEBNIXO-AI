import chatHandler from "../server_handlers/chat";
import conversionsHandler from "../server_handlers/conversions";
import couponsHandler from "../server_handlers/coupons";
import generateImageHandler from "../server_handlers/generate-image";
import healthHandler from "../server_handlers/health";
import optimizePromptHandler from "../server_handlers/optimize-prompt";
import paymentHandler from "../server_handlers/payment";
import profileHandler from "../server_handlers/profile";

export default async function handler(req: any, res: any) {
  // Extract path to route
  const url = req.url || "/";
  let pathname = url.split("?")[0];
  if (pathname.startsWith("/api/")) {
    pathname = pathname.substring(5); // remove /api/
  } else if (pathname.startsWith("/api")) {
    pathname = pathname.substring(4); // remove /api
  }
  if (pathname.startsWith("/")) {
    pathname = pathname.substring(1);
  }

  if (pathname.startsWith("chat")) {
    return chatHandler(req, res);
  }
  if (pathname.startsWith("conversions")) {
    return conversionsHandler(req, res);
  }
  if (pathname.startsWith("coupons")) {
    return couponsHandler(req, res);
  }
  if (pathname.startsWith("generate-image")) {
    return generateImageHandler(req, res);
  }
  if (pathname.startsWith("health")) {
    return healthHandler(req, res);
  }
  if (pathname.startsWith("optimize-prompt")) {
    return optimizePromptHandler(req, res);
  }
  if (pathname.startsWith("payment")) {
    return paymentHandler(req, res);
  }
  if (pathname.startsWith("profile")) {
    return profileHandler(req, res);
  }

  return res.status(404).json({ error: "API Route Not Found in index" });
}
