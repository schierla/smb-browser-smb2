# SMB2 Client for Node.js (adapted for smb-browser)

## Introduction

This library is a simple implementation of SMB2 for Node.js. It allows you to access a SMB2 share as if you were using the native fs library.

The development is still at an experimental stage and should not be yet considered for production environment.

This library is based on node-smb2 v0.2.11 by bchelli and has been adapted in order to meet the requirements of the smb-browser project: 
- Strip down for read-only access
- Correctly handle file sizes >4GB
- Request only read permissions, handle STATUS_PENDING, and allow random access and streaming in readFile
- Provide file and folder details in readdir 
- Forget password once connected and authenticated

## API

### var smb2Client = new SMB2 ( options )
The SMB2 class is the constructor of your SMB2 client.

the parameter ```options``` accepts this list of attributes:

- ```share``` (mandatory): the share you want to access
- ```domain``` (mandatory): the domain of which the user is registred
- ```username``` (mandatory): the username of the user that access the share
- ```password``` (mandatory): the password
- ```port``` (optional): default ```445```, the port of the SMB server
- ```packetConcurrency``` (optional): default ```20```, the number of simulatanous packet when writting / reading data from the share
- ```autoCloseTimeout``` (optional): default ```10000```, the timeout in milliseconds before to close the SMB2 session and the socket, if setted to ```0``` the connection will never be closed unless you do it 

Example:
```javascript
// load the library
var SMB2 = require('smb2');

// create an SMB2 instance
var smb2Client = new SMB2({
  share:'\\\\000.000.000.000\\c$'
, domain:'DOMAIN'
, username:'username'
, password:'password!'
});
```

### smb2Client.readdir ( path, callback )
Asynchronous readdir(3). Reads the contents of a directory. The callback gets two arguments (err, files) where files is an array objects describing contained files and directories.

Example:
```javascript
smb2Client.readdir('Windows\\System32', function(err, files){
    if(err) throw err;
    console.log(files);
});
```

### smb2Client.readFile ( filename, cbSize, cbData, callback )
- ```filename``` String
- ```options``` Object
    - ```encoding``` String | Null default = null
- ```callback``` Function

Asynchronously reads the entire contents of a file. Example:
```javascript
smb2Client.readFile('path\\to\\my\\file.txt', 
  function(size) {
	  console.log("The file has " + size + " bytes.");
		// optionally return a requested range, {start: 0, end: 100}
  }, 
	function(data) {
	  // will be called for each chunk of 64k
	  console.log(data);
	},
	function(err){
    if(err) throw err;
    else console.log("End of file reached.");
  }
);
```

The first callback cbSize is passed one argument (size) that gives the size of the file, and may return a range {start: , end: } if only a part of the file is requested.

The second callback cbData is called for each loaded data chunk of up to 64 KB.

The third callback is passed one arguments (err) that gives the occured error, or is null if the request completed successfully.


### smb2Client.close ( )
This function will close the open connection if opened, it will be called automatically after ```autoCloseTimeout``` ms of no SMB2 call on the server.

## Contributors
- [Benjamin Chelli](https://github.com/bchelli)
- [Fabrice Marsaud](https://github.com/marsaud)
- [Jay McAliley](https://github.com/jaymcaliley)
- [eldrago](https://github.com/eldrago)
- [schierla](https://github.com/schierla)

## References

    The[MS-SMB2]: Server Message Block (SMB) Protocol Versions 2 and 3
    Copyright (C) 2014 Microsoft
    http://msdn.microsoft.com/en-us/library/cc246482.aspx

## License

(The MIT License)

Copyright (c) 2013-2014 Benjamin Chelli &lt;benjamin@chelli.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
