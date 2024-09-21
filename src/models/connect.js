import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'node44_youtube',//ten db
    'root',//ten username
    '1234',//password user
    {
        host:'localhost',
        port:3308,
        dialect:'mysql'
    }
);

export default sequelize;
// npx sequelize-auto -h localhost -d node44_youtube -u root -x 1234 -p 3308 --dialect mysql -o src/models -l esm