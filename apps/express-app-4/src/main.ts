import * as express from 'express';
import { environment } from './environments/environment';
const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to express-app-4!' });
});

app.set('port', process.env.PORT || environment.PORT || 3000);
const server = app.listen(app.get('port'), function () {
  console.log('KT3 profile API Express server listening on port %d in %s mode', app.get('port'), app.settings.env);
});
server.on('error', console.error);

//
