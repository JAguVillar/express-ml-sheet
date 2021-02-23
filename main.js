// npm install express
// npm install ejs
const express = require('express')
const app = express()
var http = require('http');
const path = require('path')
const fs = require('fs')
// npm i body-parser
var bodyParser = require('body-parser');
// npm install axios
const axios = require('axios')
// npm i json-2-csv
const converter = require('json-2-csv')
// npm i json2xls
const json2xls = require('json2xls');
app.locals.data = {};
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get('/', (req, res) => {
    res.render("home")
})


app.post('/add', (req, res) => {
    var d = new Date()
    var dd = d.getDate()
    var mm = d.getMonth() + 1
    var yyyy = d.getFullYear()
    var hoy = yyyy + ' ' + mm + ' ' + dd
    axios({
        method: 'get',
        url: 'https://api.mercadolibre.com/sites/MLA/search?q=' + encodeURIComponent(req.body.articulo),
        responseType: 'json'
    })
        .then(function (response) {
            var resultados = []
            var resultados_json = []
            // resultados = response.data.results
            console.log(resultados)
            response.data.results.forEach(element => {
                var str_titulo = element.title
                str_titulo = str_titulo.replace(/,/g, '')
                resultados_json.push({
                    "id": element.id,
                    "titulo": str_titulo,
                    "precio": element.price,
                    "link": element.permalink,
                    "imagen": element.thumbnail,
                    "vendedor": element.seller.permalink

                })
            })
            const data = JSON.stringify(resultados_json)
            // app.use(json2xls.middleware)
            console.log(resultados_json)
            try { fs.writeFileSync('./resultados/' + req.body.articulo + '_' + hoy + '.json', data, 'utf-8') }
            catch (e) { console.log('Failed to save the JSON file !') }
            const json_csv = JSON.parse(fs.readFileSync('./resultados/' + req.body.articulo + '_' + hoy + '.json'))
            converter.json2csv(json_csv, (err, csv) => {
                if (err) {
                    console.log(err)
                }

                fs.writeFileSync('./resultados/' + req.body.articulo + '_' + hoy + '.csv', csv)
            })
            var xls = json2xls(JSON.parse(fs.readFileSync('./resultados/' + req.body.articulo + '_' + hoy + '.json')))
            fs.writeFileSync('./resultados/' + req.body.articulo + '_' + hoy + '.xlsx', xls, 'binary')
            req.app.locals.data = req.body.articulo + '_' + hoy + '.xlsx';
            console.log("global:" + req.app.locals.data);
            // try { fs.writeFileSync('myfile.csv', data, 'utf-8'); }
            // catch (e) { alert('Failed to save the CSV file !'); }
            res.render("descargar",)
        })
});

app.get('/download', function (req, res) {
    res.download("./resultados/" + req.app.locals.data);
});

app.get('/about', (req, res) => {
    res.send("daft y punk")
})

app.listen(3000)