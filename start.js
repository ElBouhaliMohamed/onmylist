const nodemon = require("nodemon");
const ngrok = require("ngrok");

try {
  nodemon
    .on("start", function() {
      console.log("App has started");
    })
    .on("quit", function() {
      console.log("App has quit");
    })
    .on("restart", function(files) {
      console.log("App restarted due to: ", files);
    });

  nodemon(`node' ./server.js`);

  (async function() {
    const url = await ngrok.connect({
        proto: "http",
        addr: "3000"
      });

      console.log("Ngrok tunnel opened at " + url);
  })();

} catch (err) {
  console.log(err);
}
