import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'db_food',//ten db
    'root',//ten username
    '1234',//password user
    {
        host:localhost,
        port:3308,
        dialect:'mssql'
    }
);

export default sequelize;