import mysql from 'mysql2/promise'

const pool =mysql.createPool({
    host: 'localhost', // địa chỉ host của MYSQL dưới local
    user: 'root', //  tên người dùng
    password: '1234',  // mật khẩu người dùng
    database: 'db_food',
    port: 3308
})
export default pool;

// npx sequelize-auto -h localhost -d node44_youtube -u root -x 123456 -p 3307 --dialect mysql -o src/models -l esm