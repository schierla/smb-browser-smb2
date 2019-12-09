

var SMB2Forge = require('../tools/smb2-forge')
  , SMB2Request = SMB2Forge.request
  , bigint = require('../tools/bigint')
  ;

/*
 * readFile
 * ========
 *
 * read the content of a file from the share
 *
 *  - open the file
 *
 *  - read the content
 *
 *  - close the file
 *
 */
module.exports = function(filename, cbSize, cbData, cb){
  var connection = this;

  SMB2Request('open', {path:filename}, connection, function(err, file){
    if(err) cb && cb(err);
    // SMB2 read file content
    else {
      var fileLength = 0
        , offset = 0
        , stop = false
        , maxPacketSize = 0x00010000
        ;
      // get file length
      fileLength = bigint.fromBuffer(file.EndofFile, 1).toNumber();
      var range = cbSize(fileLength);
      if(range) {
        offset = range.start; fileLength = range.end + 1;
      }

      // callback manager
      function callback(start){
        return function(err, content){
          if(stop) return;
          if(err) {
            if(err.code == 'STATUS_PENDING') {
              checkDone();
            } else {
              cb && cb(err);
              stop = true;
            }
          } else {
            cbData(content, (cont) => {
              offset = start + content.length;
              if(!cont) offset = fileLength;
              checkDone();
            });
          }
        }
      }
      // callback manager
      function checkDone(){
        if(stop) return;
        createPackets();
        if(offset >= fileLength) {
          SMB2Request('close', file, connection, function(err){
            cb && cb(null);
          })
        }
      }
      // create packets
      function createPackets(){
          // process packet size
          var rest = fileLength - offset;
          var packetSize = rest > maxPacketSize ? maxPacketSize : rest;
          if(packetSize > 0) {
            // generate buffer
            SMB2Request('read', {
              'FileId':file.FileId
            , 'Length':packetSize
            , 'Offset':bigint.toBigInt(8, offset).buffer
            }, connection, callback(offset));
          }
      }
      checkDone();
    }
  });
}
