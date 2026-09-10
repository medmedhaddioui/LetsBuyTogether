import type { Response } from 'express';
export class AppError extends Error { constructor(public status:number,public code:string,message:string){super(message)} }
export const ok=(res:Response,data:unknown,status=200)=>res.status(status).json({success:true,data});
