import { Request, Response, NextFunction } from 'express';

export const debugLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log('\n🔍 Debug Request:');
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  console.log('   Body type:', typeof req.body);
  console.log('   Body is undefined?', req.body === undefined);
  console.log('   Body is null?', req.body === null);
  console.log('   Body keys:', Object.keys(req.body || {}));
  next();
};
