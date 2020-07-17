import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Application } from 'express';

const ADMIN = 'admin';
const ADMIN_PASSWORD = 'password';
const SECRET = 'verysecretwordtohashtoken'; // Todo move to env

interface IUserInfo {
  userName: string;
}

export = {
  init: async (app: Application) => {
    passport.use(new LocalStrategy((userName, password, done) => {
      if (userName === ADMIN && password === ADMIN_PASSWORD) { // TODO: change to real user
        const token = jwt.sign({
          userName,
        }, SECRET,
          {
            expiresIn: '1h',
          });
        done(null, token);
        return;
      }
      done(null, false);
    }));

    passport.use(new BearerStrategy((token, done) => {
      try {
        const decodedData = jwt.verify(token, SECRET) as IUserInfo;
        if (decodedData.userName === ADMIN) { // TODO: change to real user
          done(null, decodedData.userName);
          return;
        }
        done(null, false);
      } catch (error) {
        done(null, false);
      }
    }));
  }

};
