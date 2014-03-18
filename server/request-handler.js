/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var results = [];
exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);
  // console.log(JSON.parse(request._data));

  var statusCode = 200;
  var data;
  /* Without this line, this server wouldn't work. See the note
   * below  about CORS. */
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  // read client index.html, write in response to client
  var body = "";
  request.setEncoding('utf8');
  request.on('data', function(chunk){
    body += chunk;
  });
  if(request.method === "POST"){
    request.on('end', function(){
      data = JSON.parse(body);
      var createdAt = (new Date()).toJSON();
      data.createdAt = createdAt;
      results.push(data);
      response.end();
    });
  }
  if(request.method === 'GET'){
    request.on('end', function(){
      // data = JSON.parse(body);
      

      var getDataQuery = require('url').parse(request.url, true).query;

      if (getDataQuery.order) {
        var sorted = results.slice();
        var orderRequest = JSON.parse(getDataQuery.order);
        if (orderRequest[0] === '-') {
          var property = orderRequest.slice(1);
          sorted.sort(function(a, b){
            return (new Date(b[property])) - (new Date(a[property]));
          });
          response.write(JSON.stringify({results: sorted}));
        }
      }

      // response.write(JSON.stringify({results: results}));
      // console.log(JSON.stringify(results));
      response.end();
    });
  }
  // response.write("before End");

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
