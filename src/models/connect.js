import { Sequelize } from "sequelize";
import configDb from '../config/connect_db.js'

const sequelize = new Sequelize(
    configDb.database,//ten db
    configDb.user,//ten username
    configDb.pass,//password user
    {
        host:configDb.host,
        port:configDb.port,
        dialect:configDb.dialect
    }
);

export default sequelize;
// npx sequelize-auto -h localhost -d node44_youtube -u root -x 1234 -p 3308 --dialect mysql -o src/models -l esm