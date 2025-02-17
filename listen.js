const app = require("./app");
const { port = 3100 } = process.env;

// Return success/ error message
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Listening on port: ${port}`);
  }
});
