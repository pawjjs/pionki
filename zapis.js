const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    let filename="";
    
    if(req.url==="/dane"){
        fs.readFile('dane.json', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, {'content-type': 'text/plain; charset=utf-8'});
                res.end("Błąd serwera przy odczycie JSON");
                return;
            }
            // Zwracamy poprawny nagłówek dla formatu JSON
            res.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
            res.end(data);
        });
        return;
    }
    
    if(req.url==="/dane" && req.method==="POST"){
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async() => {
            
        });
        return;
    }
    
    if(req.url==="/"){
        filename='home.html'
    }
    else {
        filename = '404.html'
    }
    
    fs.readFile(filename, (err, data) => {
        if(err) {
            res.writeHead(500, {'content-type': 'text/plain'});
            res.end("server error");
            return;
        }else{
             res.writeHead(filename === "404.html" ? 404:200, {'content-type': 'text/html'});
             res.end(data)
        }
    })
    
})

server.listen(3000, () => {
    console.log('Server is running on port 3000');
})