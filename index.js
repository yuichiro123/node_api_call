const https = require('https');
const fs = require('fs');
const csv = require('csv');
const converter = require('json-2-csv');

const BaseURL = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'

/**
 * APIをコール
 * @param {*} params 
 * @param {*} callback 
 */
function callApi(params, callback) {
    let data = '';

    https.get(BaseURL, (res) => {
        res.on('data', (chunk) => {
            data += chunk;
        }).on('end', () => {
            callback(JSON.parse(data));
        });
    }).on('error', (err) => {
        console.log("Error:" + err.message);
    });
}

async function asyncCallApi(params) {
    let data = '';

    return new Promise((resolve, reject) => {
        https.get(BaseURL, (res) => {
            res.on('data', (chunk) => {
                data += chunk;
            }).on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (err) => {
            reject("Error:" + err.message);
        });
    })
}
/**
 * レスポンス解析
 * @param {string} data レスポンスJSON
 */
function getResponse(data) {
    console.log(data);
}

async function asyncReadCsvToJson() {
    return new Promise((resolve) => {
        fs.createReadStream('./data/ic.csv')
        .pipe(csv.parse({columns: true}, (err, data) => {
            // callback(data)
            // return data;
            resolve(data);
        }));
    });
}

function saveJsonToCsv(data) {
    converter.json2csv(data, (err, csv) => {
        if (err) {
            throw err;
        }

        fs.writeFileSync('./result/data.csv', csv);
        console.log('##### Writ End');
    });
}

async function main() {
    // CSV Data Read
    const data = await asyncReadCsvToJson()
    // console.log(data);

    // API Call
    let resultData = [];
    for (const item of data) {
        let lat, lng = -1;
        const info = await asyncCallApi(item).catch(() => console.log(`Error Call API ${item.highway}/${item.ic}`));
        if (info) {
            lat = 130.123;
            lng = 30.9887;
        }
        resultData.push({'highway' : item.highway, 'ic': item.ic, 'lat': lat, 'lng': lng});

        // Sleep
        await new Promise((r) => setTimeout(r, 1500));
    }
    
    // Write CSV
    saveJsonToCsv(resultData);

    
}

main();