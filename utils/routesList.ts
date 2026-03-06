import { Application } from 'express';

interface RouteInfo {
  method: string;
  path: string;
  description?: string;
}

/**
 * Extract all routes from Express app
 */
export function listAllRoutes(app: Application): RouteInfo[] {
  const routes: RouteInfo[] = [];

  // Extract routes from app._router.stack
  const stack = (app._router as any)?.stack || [];

  stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const methods = Object.keys(middleware.route.methods);
      methods.forEach((method) => {
        routes.push({
          method: method.toUpperCase(),
          path: middleware.route.path,
        });
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods);
          const basePath = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\^/g, '')
            .replace(/\$/g, '')
            .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param');

          methods.forEach((method) => {
            const fullPath = basePath + handler.route.path;
            routes.push({
              method: method.toUpperCase(),
              path: fullPath.replace(/\/\//g, '/'),
            });
          });
        }
      });
    }
  });

  // Sort routes by path
  routes.sort((a, b) => a.path.localeCompare(b.path));

  return routes;
}

/**
 * Print all routes to console in a formatted way
 */
export function printRoutes(app: Application): void {
  const routes = listAllRoutes(app);

  console.log('\n' + '='.repeat(100));
  console.log('📋 API ENDPOINTS');
  console.log('='.repeat(100));

  // Group routes by base path
  const grouped: { [key: string]: RouteInfo[] } = {};

  routes.forEach((route) => {
    const basePath = route.path.split('/')[2] || 'root'; // /api/auth -> auth
    if (!grouped[basePath]) {
      grouped[basePath] = [];
    }
    grouped[basePath].push(route);
  });

  // Print grouped routes
  Object.keys(grouped).sort().forEach((group) => {
    console.log(`\n🔹 ${group.toUpperCase()}`);
    console.log('-'.repeat(100));

    grouped[group].forEach((route) => {
      const methodColor = getMethodColor(route.method);
      const paddedMethod = route.method.padEnd(7);
      console.log(`  ${methodColor}${paddedMethod}\x1b[0m ${route.path}`);
    });
  });

  console.log('\n' + '='.repeat(100));
  console.log(`📊 Total Routes: ${routes.length}`);
  console.log('='.repeat(100));
  console.log(`\n📚 API Documentation: http://localhost:${process.env.PORT || 3000}/api-docs`);
  console.log('='.repeat(100) + '\n');
}

/**
 * Get ANSI color code for HTTP method
 */
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return '\x1b[32m'; // Green
    case 'POST':
      return '\x1b[33m'; // Yellow
    case 'PUT':
      return '\x1b[36m'; // Cyan
    case 'PATCH':
      return '\x1b[35m'; // Magenta
    case 'DELETE':
      return '\x1b[31m'; // Red
    default:
      return '\x1b[37m'; // White
  }
}

/**
 * Generate routes summary
 */
export function getRoutesSummary(app: Application): {
  total: number;
  byMethod: { [key: string]: number };
  byGroup: { [key: string]: number };
} {
  const routes = listAllRoutes(app);

  const byMethod: { [key: string]: number } = {};
  const byGroup: { [key: string]: number } = {};

  routes.forEach((route) => {
    // Count by method
    byMethod[route.method] = (byMethod[route.method] || 0) + 1;

    // Count by group
    const group = route.path.split('/')[2] || 'root';
    byGroup[group] = (byGroup[group] || 0) + 1;
  });

  return {
    total: routes.length,
    byMethod,
    byGroup,
  };
}
