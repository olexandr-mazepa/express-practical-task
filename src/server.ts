import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';

import auth from './utils/auth'
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import bcrypt  from 'bcrypt';
const app = express();
app.use(bodyParser.json());
const db = new JsonDB(new Config("myDataBase", true, false, '/'));

auth.init(app);


app.post('/login', passport.authenticate('local', { session: false }),
  (req: Request, res: Response) => {
    console.log('login');
    res.send({
      token: req.user,
    });
  },
);


app.post('/registration', async (req: Request, res: Response) => {
  const requiredProperties = ['firstName', 'lastName', 'phone', 'email', 'password'];
  const isAllFieldsExist = requiredProperties.every(propName => {
    return Object.prototype.hasOwnProperty.call(req.body, propName);
  })

  if (!isAllFieldsExist) {
    res.status(400).send('Bad Request ')
  }

  const user = {
    ...req.body,
    password: await bcrypt.hash(req.body.password, 12),
    id: Date.now()
  }
  db.push(`/users/${user.id}`, user);
  res.status(200).send(user);
},
);


app.get('/users', passport.authenticate('bearer', { session: false }), (req: Request, res: Response) => {
  const users = db.getData('/users') || []; // Todo remove passwords
  return res.status(200).send(users)
})
export default app;
