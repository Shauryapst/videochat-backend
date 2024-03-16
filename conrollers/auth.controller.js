const logger = require("../logger/logger");
const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { generateToken } = require("../utils/tokenHandler");

const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email.toLowerCase()});

        if(user && (await bcrypt.compare(password, user.password))){
           const token = generateToken(user);
           return res.status(200).json({
            userDetails: {
                email: user.email,
                username: user.username,
                token: token
            }
        })
        }
        return res.status(404).send("User not Found");
        
    }
    catch(err){
        return res.status(500).send(err.message);
    }
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExist = await User.exists({ email: email });
    logger.debug("user exists in register : " + JSON.stringify(userExist));
    if (userExist) {
        
        return res.status(409).send("Email  alredy in use");
    }
    
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email: email.toLowerCase(),
        password: encryptedPassword,
        username
    })
    

    const token = generateToken(user);
    logger.debug(token);

    return res.status(201).json({
        userDetails: {
            email: user.email,
            token: token
        }
    })

  } catch (err) {
    return res.status(500).send("errpr occured. Please try again");
  }
};

module.exports = { login, register };
