import type { RequestHandler } from 'express'; import jwt from 'jsonwebtoken'; import { env } from '../config/env.js'; import { AppError } from '../utils/http.js';
export const optionalAuth:RequestHandler=(req,_res,next)=>{const token=req.headers.authorization?.replace(/^Bearer /,'');if(token){try{req.user=jwt.verify(token,env.JWT_SECRET) as {id:string;role:'USER'|'ADMIN'}}catch{}}next()};
export const auth:RequestHandler=(req,res,next)=>optionalAuth(req,res,()=>req.user?next():next(new AppError(401,'UNAUTHORIZED','Authentication is required.')));
export const admin:RequestHandler=(req,_res,next)=>req.user?.role==='ADMIN'?next():next(new AppError(403,'FORBIDDEN','Administrator access is required.'));
