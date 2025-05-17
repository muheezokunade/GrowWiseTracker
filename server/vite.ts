import { Express } from "express";
import { Server } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import express from "express";

export function log(message: string): void {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${time} [express] ${message}`);
}

// Serve static files in production
export function serveStatic(app: Express): void {
  const distPath = path.join(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    log(`Warning: Build directory not found at ${distPath}`);
  }
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    const indexPath = path.join(distPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      log(`Error: index.html not found at ${indexPath}`);
      return res.status(404).send("Frontend not built. Run 'npm run build' first.");
    }
  });
}

// Set up development environment with Vite
export async function setupVite(app: Express, server: Server): Promise<void> {
  try {
    // Create Vite server
    const vite = await createViteServer({
      server: { 
        middlewareMode: true 
      },
      root: path.join(process.cwd(), "client"),
      appType: "spa"
    });
    
    // Use Vite middleware
    app.use(vite.middlewares);
    
    // Handle SPA routing in development
    app.use("*", async (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      
      try {
        // Get index.html
        const indexPath = path.join(process.cwd(), "client", "index.html");
        
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send("Client index.html not found");
        }
        
        // Read and transform index.html
        let html = fs.readFileSync(indexPath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        
        // Send transformed HTML
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (error) {
        console.error("Vite middleware error:", error);
        return next(error);
      }
    });
  } catch (error) {
    console.error("Vite setup error:", error);
    
    // Fall back to static serving if Vite setup fails
    log("Falling back to static serving due to Vite setup error");
    serveStatic(app);
  }
}
