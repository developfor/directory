var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3EfeqdsdsdSDF_ASFsdfSD_FbFY84nil.=+?SDF?SDFSGAJjI43^';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
var hw = encrypt("Community members will never sell, trade, or otherwise make available their client or employee's database, business operations, marketing objectives, or other confidential information to any third party without express written permission from the client. Community members will never deceive a client into unknowingly granting permission for their information to be shared with other organizations.")
// outputs hello world
console.log(decrypt(hw));