const express = require('express');
// const logger = require('morgan');
const servExpress = express();

const { GetConnPool } = require('../Common/mssql.js');
const { SendPing } = require('../Common/functions.js');
const { prcEnv } = require('../Common/static.js');
const { InitBackEnd } = require('./index.js');

servExpress.use(express.json())
// servExpress.use(logger('dev'))

async function tryInitBackend()
{
    try
    {
        InitBackEnd(express, servExpress, prcEnv);

        const pingResult = await SendPing(prcEnv.db_host);
        if(!pingResult.alive)
        {
            console.error('Host [ ', pingResult.host, ' ] unavailable' );
            await retryInitialization();
        }
        else
        {
            const result = await GetConnPool();
            if(result?.config)
            {
                const object =
                {
                    'Host' : result.config.server,
                    'Database' : result.config.database
                };
                console.log('Success.-y conn. SQL Server:', object);
            }
        }
    } catch (error) {
        console.error('Error initialize backend:', error);
        await retryInitialization()
    }
}

async function retryInitialization()
{
    await new Promise(resolve => setTimeout(resolve, 30 * 1000));
    await tryInitBackend();
}

module.exports = {
    Main: tryInitBackend,
    app_exp: servExpress
}

// try {
//     const port = prcEnv.backend_port || parseInt(prcEnv.backend_port) + 1
//     servExpress.set("domain", prcEnv.backend_address || "127.0.0.1");
//     servExpress.listen(port, function (err) {
//         if (err) {
//             console.error('Listening error: ', err)
//         } else {
//             console.log(`Success.-y listening port:  ${port}`)
//             tryInitBackend()

//         }
//     });
// } catch (error) {
//     console.error('Express app main (listen) error: ', error)
// }
