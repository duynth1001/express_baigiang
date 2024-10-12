import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/transporter.js";
import crypto from 'crypto'; // lib để tạo random code cho flow forgot password
import { createRefToken, createRefTokenAsyncKey, createToken, createTokenAsyncKey } from "../config/jwt.js";
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
    //create refresh token và lưu vào database
    let refreshToken = createRefToken({userId:user.user_id});
    await model.users.update({
      refresh_token:refreshToken
    },{
      where:{user_id:user.user_id}
    });

    //lưu refresh token vào cookie
    res.cookie('refreshToken',refreshToken,{
      httpOnly:true,// Cookie ko thể truy cập từ javascript
      secure:false,//để chạy dưới localhost
      sameSite:"Lax",//để đảm bảo cookie được gửi trong các domain khác nhau
      maxAge:7*24*60*60*1000 //thời gian tồn tại cookie trong browser
    });
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

const extendToken = async (req,res)=>{
  //lấy refresh token từ cookie request
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401)
  }

  //nếu có kiểm tra trong db
   const checkRefToken = await model.users.findOne({
    where:{
      refresh_token:refreshToken
    }
   });
   if (!checkRefToken) {
    return res.status(401);
   }

  //  const newToken = createToken({userId: checkRefToken.user_id})
  // tạo access token mới
   const newToken = createTokenAsyncKey({userId: checkRefToken.user_id})
  return res.status(200).json({message:"Success",data:newToken});

}

const loginAsyncKey = async(req,res)=>{
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
    let accessToken = createTokenAsyncKey({userId:user.user_id});
    //create refresh token và lưu vào database
    let refreshToken = createRefTokenAsyncKey({userId:user.user_id});
    await model.users.update({
      refresh_token:refreshToken
    },{
      where:{user_id:user.user_id}
    });

    //lưu refresh token vào cookie
    res.cookie('refreshToken',refreshToken,{
      httpOnly:true,// Cookie ko thể truy cập từ javascript
      secure:false,//để chạy dưới localhost
      sameSite:"Lax",//để đảm bảo cookie được gửi trong các domain khác nhau
      maxAge:7*24*60*60*1000 //thời gian tồn tại cookie trong browser
    });
    return res.status(200).json({
      message: "Login successfully",
      data: accessToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
}

const forgotPass = async(req,res)=>{
  try {
    //get email from body  
    let {email} = req.body;

    //kiểm tra email có tồn tại trong database
      let checkEmail = await model.users.findOne({
        where:{
          email
        }
      });

      if (!checkEmail) {
        return res.status(400).json({message:"Email is wrong"});
      }

      //tạo code
      let randomCode = crypto.randomBytes(5).toString("hex");

      //tạo biến lưu expired code
      let expired = new Date(new Date().getTime()+1*60*60*1000);
      //lưu code vào db

      await model.code.create({
        code:randomCode,
        expired
      })

      //send mail
       //cấu hình info email
    const mailOption = {
      from:process.env.MAIL_USER,
      to:email,
      subject:"Mã xác thực",
      text:`Hệ thống gửi bạn mã code forgot password`,
      html:`<h1>${randomCode}</h1>`
    }

    //gửi mail
    transporter.sendMail(mailOption,(err,info)=>{
      if (err) {
        return res.status(500).json({message:"Sending email error"});
      }
      return res.status(200).json({
        message: "Please check your email",
      });
    })
  } catch (error) {
      console.log(error);
      
      return res.status(500).json({message:'error API forgot password'});
  }
}

const changePassword = async (req,res)=>{
  try {
    let {code,email,newPass}=req.body;
    
    //kiểm tra code có tồn tại trong db hay không
    let checkCode = await model.code.findOne({
      where:{
        code
      }
    })
    if (!checkCode) {
      return res.status(400).json({message:"code is wrong"});
    }

    //check code có còn expire hay ko

    //kiểm tra email có tồn tại trong db hay không
    let checkEmail = await model.users.findOne({
      where:{
        email
      }
    })
    if (!checkEmail) {
      return res.status(400).json({message:"Email is wrong"});
    }

    let hashNewPass =bcrypt.hashSync(newPass,10);
    checkEmail.pass_word=hashNewPass;
    checkEmail.save();

    //remove code sau khi change password thành công
    await model.code.destroy({
      where:{code}
    });
    return res.status(200).json({message:"Change password successfully!"});
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({message:"error API change password"});
  }
}

export { register,
   login, 
   loginFacebook,
   extendToken,
   loginAsyncKey,
   forgotPass,
   changePassword
  };
