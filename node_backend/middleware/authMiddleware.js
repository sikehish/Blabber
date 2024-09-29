const jwt=require("jsonwebtoken")
exports.checkAuth = (req, res, next) => {
    // console.log("REQUEST: ",req?.cookies)
    const token = req?.cookies?.token;
    // console.log("HAHAH123", req.cookies.token)
    
    if (!token) {
      return res.status(401).json({ status: "fail", message: 'Unauthorized access. Token not provided.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);
      // console.log("DECODED: ", decodedToken)
      if (!decodedToken || !decodedToken.email) {
        return res.status(401).json({ status: "fail", message: "Invalid token format" });
      }
  
      const { email,name } = decodedToken;
      req.user = {email,name};
      
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ status: "fail", message: 'Unauthorized access.' });
    }
  };
  