
var cors=require('cors');
module.exports=cors({
  // origin: '*', // hoặc cụ thể: http://localhost:3000
   origin: ['http://localhost:5173', "https://system-waste-less-ai-1.onrender.com"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With',],
//   credentials: true // Cho phép gửi cookie
});
console.log('cors');
