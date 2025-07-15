const path = require('path');

const { TryConnToSql } = require('../Common/mssql.js');
const GetRoutes = require('./Routes/Get/get.js');
const PostRoutes = require('./Routes/Post/post.js');

const routes_array = ['try_conn', 'get', 'post'];

const InitBackEnd = (express, servExpress, prcEnv) => {
  servExpress.use(express.json());
  servExpress.use(express.urlencoded({ extended: true }))
  servExpress.use("/PhotoReports/", express.static(path.join(__dirname + "/PhotoReports/")));
  //servExpress.use(logger('dev'));
  servExpress.set('view engine', 'ejs');
  servExpress.set('views', path.join(__dirname, 'views'));

  const backend_version = prcEnv.backend_version;

  servExpress.get('/', async (req, res) => {
    res.redirect(backend_version);
  });

  servExpress.get(`/${ backend_version }`, (req, res) => {
    res.render('index', {
      data: routes_array,
      type: 'version',
      url: req.originalUrl,
    });
  });

  servExpress.get(`/${ backend_version.concat('/', routes_array[0]) }`,
    async (req, res) => {
      const { status, message } = await TryConnToSql();
      res.status(status).send(message);
    }
  );

  servExpress.use(`/${ backend_version.concat('/', routes_array[1]) }`, GetRoutes);
  servExpress.use(`/${ backend_version.concat('/', routes_array[2]) }`, PostRoutes);
  return;
};

module.exports = {
  InitBackEnd
};