const http = require("http");
const fs = require("fs");
const formidable = require("formidable");

let user = [];
let mimetype = ["image/jpeg", "image/jpg", "image/png"];
let result = "";
let img = "";
let fileType;
let newPath;

const server = http.createServer((req, res) => {
  switch (fileType) {
    case "image/jpeg": {
      fs.readFile(`${newPath}`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.write(data);
        return res.end();
      });
      break;
    }
    case "image/jpg": {
      fs.readFile(`${newPath}`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/jpg" });
        res.write(data);
        return res.end();
      });
      break;
    }
    case "image/png": {
      fs.readFile(`${newPath}`, (err, data) => {
        res.writeHead(200, { "Content-Type": "image/png" });
        res.write(data);
        return res.end();
      });
      break; 
    }        
    default:{
      if (req.method === "GET") {
        fs.readFile("./views/register.html", "utf8", (err, data) => {
          if (err) {
            res.writeHead(400, { "Content-Type": "text/html" });
            return res.end("400 FILE NOT FOUND");
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        });
      } else {
        let form = new formidable.IncomingForm();
        form.uploadDir = "upload/";
        console.log(form)
        form.parse(req, function (err, fields, files) {
          let userInfo = {
            name: fields.name,
            email: fields.email,
            password: fields.password,
          };
          if (err) {
            console.log(err.message);
            return res.end(err.message);
          }
    
          let tmpPath = files.upload.filepath;
          console.log(tmpPath)
          newPath = `${form.uploadDir}${files.upload.originalFilename}`;
          console.log(newPath)
          
          userInfo.upload = `../${newPath}`;
          user.push(userInfo);
          fs.rename(tmpPath, newPath, (err) => {
            if (err) console.log(err.message);
            fileType = files.upload.mimetype;
            let index = -1;
            for (let ext of mimetype) {
              if (fileType === ext) {
                index = mimetype.indexOf(ext);
                break;
              }
            }
            if (index === -1) {
              res.writeHead(200, { "Content-Type": "text/html" });
              return res.end(
                "The file is not in the correct format: jpg, jpeg, png"
              );
            }
          });
    
          fs.readFile("views/display.html", 'utf8', (err, dataHtml) => {
            if (err) {
              return res.end(err.message);
            }
    
            result += `<p>name: ${userInfo.name}</p>
                       <p>email: ${userInfo.email}</p>
                       <p>password: ${userInfo.password}</p>`;
            img += `<img src="${userInfo.upload}" alt="" width="200" height="200"/>`;
    
            dataHtml = dataHtml.replace("{display}", result);
            dataHtml = dataHtml.replace("{img}", img);
    
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(dataHtml);
            return res.end();
          });
        });
      }
      break;
    }
  }
  
});

server.listen(8080, "localhost", () => {
  console.log("Sever is running at localhost:8080");
});
