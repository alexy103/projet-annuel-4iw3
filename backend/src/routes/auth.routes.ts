import { Router } from 'express';

import { changePassword, githubOAuth, login, logout, refreshToken, register, resendCode, resetPassword, verifyCode } from '../controllers';
import { requireApiKey, requireAuth } from '../middlewares';

export const authRouter: Router = Router();

authRouter.post('/login', requireApiKey, login);

authRouter.post('/register', requireApiKey, register);

authRouter.post('/refresh', requireApiKey, requireAuth(), refreshToken);

authRouter.post('/logout', requireApiKey, requireAuth(), logout);

authRouter.post('/verify-code', requireApiKey, verifyCode);

authRouter.post('/resend-code', requireApiKey, resendCode);

authRouter.post('/change-password', requireApiKey, changePassword);

authRouter.post('/reset-password', requireApiKey, resetPassword);

authRouter.post('/oauth/github', requireApiKey, githubOAuth);
