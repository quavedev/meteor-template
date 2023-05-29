import { WebApp } from 'meteor/webapp';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/codeftw', (req, res) => {
  console.log('/codeftw');
  const url = 'https://codeftw.dev';
  res.redirect(302, url);
});
app.get('/iniciar', (req, res) => {
  console.log('/iniciar get');
  res.send('Ol\xE1, voc\xEA acabou de fazer um GET. Bora fazer um post? Onde? No mesmo lugar.');
});
app.post('/iniciar', (req, res) => {
  console.log('/iniciar post');
  res.send('Ol\xE1, voc\xEA acabou de fazer um POST. Bora fazer um put passando um query param chamado "mensagem" para /proxima-pista?');
});
app.put('/proxima-pista', (req, res) => {
  let _req$query; let
_req$query2;

  console.log('/proxima-pista');

  if (!((_req$query = req.query) !== null && _req$query !== void 0 && _req$query.mensagem)) {
    res.status(500).send('Faltou o query param chamado "mensagem" ou ele est\xE1 vazio.');
    return;
  }

  console.log('req.query?.mensagem', req.query.mensagem);
  res.send('Ol\xE1, voc\xEA acabou de fazer um PUT com a mensagem "'.concat((_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.mensagem, '". Bora terminar esse ca\xE7a ao tesouro? Passe um Header chamado CodeFTWToken com o valor #UmDosMelhores para /zerar usando GET'));
});
app.get('/zerar', (req, res) => {
  let _req$headers;

  console.log('/zerar');

  if (!((_req$headers = req.headers) !== null && _req$headers !== void 0 && _req$headers.codeftwtoken)) {
    res.status(500).send('Faltou o Header "CodeFTWToken"');
    return;
  }

  if (req.headers.codeftwtoken !== '#UmDosMelhores') {
    console.log('req.query?.mensagem', req.headers.codeftwtoken);
    res.status(500).send('Quase! O Header veio mas com o valor errado, deveria ser "#UmDosMelhores"');
    return;
  }

  res.send('Voc\xEA zerou o game! E para provar cole esse texto nos coment\xE1rios do v\xEDdeo do YouTube (n\xE3o conta pra ningu\xE9m que \xE9 a mensagem de zerar o ca\xE7a ao tesouro): "Agora eu sei os m\xE9todos HTTP na pr\xE1tica! Valeu #CodeFTW"');
});

WebApp.connectHandlers.use('/', app);
