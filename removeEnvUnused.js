const fs = require('fs')
const path = require('path')
const {prcEnv: env} = require('./Common/static')
const { ObjectToENV } = require('./electron/utils/HelperFunction')
const log = require('electron-log')


const envPath = path.join(process.cwd(), '.env')
console.log('envPath-----' , envPath)


const envCopy = env
envCopy.db_password = ''
envCopy.db_name = ''
const envFormat = ObjectToENV(envCopy)
fs.writeFile(envPath, envFormat, (err) => {
    if (err) log.info('err while writing env file: ', err);
    log.info('Successfully saved data to env.')
})