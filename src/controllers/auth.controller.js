import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/transporter.js";
import { createToken } from "../config/jwt.js";
const model = initModels(sequelize);
const register = async (req, res, next) => {
  try {
    /**
     * Bước 1: nhận dữ liệu từ FE
     */
    const { fullName, email, pass } = req.body;

    //Bước 2: kiểm tra email đã tồn tại trong db hay chưa
    /**
     * -nếu tổn tại : trả lỗi đã tồn tại
     * -chưa không : đi tiếp
     */
    const userExist = await model.users.findOne({
      where: {
        email: email,
      },
    });
    if (userExist) {
      return res.status(400).json({
        message: `Tài khoản đã tồn tại`,
        data: null,
      });
    }

    //Thêm người dùng mới vào DB

    const userNew = await model.users.create({
      full_name: fullName,
      email: email,
      pass_word: bcrypt.hashSync(pass, 10),
    });

    //cấu hình info email
    const mailOption = {
      from:process.env.MAIL_USER,
      to:email,
      subject:"Welcome to Our Service",
      text:`Hello ${fullName}. Best Regard.`,
      html:`<h1>ahihi đồ ngốc</h1>`
    }

    //gửi mail
    transporter.sendMail(mailOption,(err,info)=>{
      if (err) {
        return res.status(500).json({message:"Sending email error"});
      }
      return res.status(200).json({
        message: "Đăng ký thành công",
        data: userNew,
      });
    })

    // Remove the password from the returned object
    const userWithoutPassword = userNew.toJSON();
    delete userWithoutPassword.pass_word;

    return res.status(200).json({
      message: "Đăng ký thành công",
      data: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
};

const login = async (req, res) => {
  try {
    //B1: Lấy email và pass từ body request
    //B2: Check user thông qua email(get user từ DB)
    //B2.1 : Nếu k có user => ra error user not found
    //B2.2: Nếu có user => check tiếp pass
    //B2.2.1: Nếu pass k trùng nhau => ra error pass is wrong
    //B2.2.2: Nếu pass trùng nhau => tạo access token
    let { email, pass_word } = req.body;
    let user = await model.users.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json({ message: "Email is wrong" });
    }

    let checkPass = bcrypt.compareSync(pass_word, user.pass_word);
    if (!checkPass) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    let payload = {
      userId: user.user_id,
    };

    //tạo token
    //function sign của jwt
    //param 1: tạo payload và lưu vào token
    //param 2 : key để tạo token
    //param 3: setting life time của token và thuật toán để tạo token
    let accessToken = createToken({userId:user.user_id});
    return res.status(200).json({
      message: "Login successfully",
      data: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
};

const loginFacebook = async (req, res) => {
  try {
    //B1: lấy thông tin id, email, name từ request
    //B2: check id (app_face_id trong db)
    //B2.1: nếu có app_face_id =>tạo access token => gửi về FE
    //B2.2: nếu k có app_face_id=> tạo user mới => tạo access token => gửi về FE
    let { id, email, name } = req.body;
    let user = await model.users.findOne({
      where: { face_app_id: id },
    });
    if (!user) {
      let newUser = {
        full_name: name,
        face_app_id: id,
        email,
      };
     user= await model.users.create(newUser);
    }
    let accessToken = jwt.sign({ userId: user.user_id }, "NODE44", {
      algorithm: "HS256",
      expiresIn: "1d",
    });
    return res.status(200).json({
      message: "Login successfully",
      data: accessToken,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "error" });
  }
};

export { register, login, loginFacebook };
