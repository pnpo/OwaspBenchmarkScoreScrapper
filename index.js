const glob = require('glob');
const cheerio = require('cheerio');
const fs = require('fs');

const in_path = process.argv[2] || '../Benchmark/scorecard/';
const out_path = process.argv[3] || '../';

glob(`${in_path}*_Checkmarx_SAST_*.html`, {}, scrap);

function scrap(error, files) {
    if(error) {
        throw error;
    }
    if(files.lenth == 0) {
        throw new Error("No files were found!");
    }

    fs.readFile(files[0], 'utf8', (err, data) => {
        if(err){
            throw err;
        }
        const ch$ = cheerio.load(data);
        let res = {};
        let infotable = ch$('table').eq(1).children().children();
        let regex = /\d+[,\.]?\d+/;
        for(var i = 1; i <= 11; i++) {
            let category = infotable.eq(i).children('td').eq(0).html();
             res[category] = {
                    "TP"    : infotable.eq(i).children('td').eq(2).html(),
                    "FN"    : infotable.eq(i).children('td').eq(3).html(),
                    "TN"    : infotable.eq(i).children('td').eq(4).html(),
                    "FP"    : infotable.eq(i).children('td').eq(5).html(),
                    "Total" : infotable.eq(i).children('td').eq(6).html(), 
                    "TPR"   : regex.exec(infotable.eq(i).children('td').eq(7).html())[0].replace(',','.'),
                    "FPR"   : regex.exec(infotable.eq(i).children('td').eq(8).html())[0].replace(',','.'),
                    "Score" : regex.exec(infotable.eq(i).children('td').eq(9).html())[0].replace(',','.')
                };
        }
        
        res['Overall'] = {
            "TP"    : infotable.eq(12).children('th').eq(2).html(),
            "FN"    : infotable.eq(12).children('th').eq(3).html(),
            "TN"    : infotable.eq(12).children('th').eq(4).html(),
            "FP"    : infotable.eq(12).children('th').eq(5).html(),
            "Total" : infotable.eq(12).children('th').eq(6).html(), 
            "tpr"  : regex.exec(infotable.eq(13).children('th').eq(7).html())[0].replace(',','.'),
            "fpr"  : regex.exec(infotable.eq(13).children('th').eq(8).html())[0].replace(',','.'),
            "score": regex.exec(infotable.eq(13).children('th').eq(9).html())[0].replace(',','.')
        }

        fs.writeFile(
            `${out_path}score.json`,
            JSON.stringify(res),
            (err)=> {
                if(err) throw err;

                console.log("File Was Written!");
            });
        
    });

    
}
