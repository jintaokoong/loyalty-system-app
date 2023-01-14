import dotenv from 'dotenv';

dotenv.config();

import * as admin from 'firebase-admin';
import env from 'env-var';
import { getAuth } from 'firebase-admin/auth';

export const firebase = admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: env.get('FIREBASE_CLIENT_EMAIL').required().asString(),
    privateKey: env.get('FIREBASE_PRIVATE_KEY').required().asString(),
    projectId: env.get('FIREBASE_PROJECT_ID').required().asString(),
  }),
});

export const firebaseAuth = getAuth(firebase);
