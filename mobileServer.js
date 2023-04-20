let express=require('express');
let app=express();
app.use(express.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const {Pool}=require("pg");
const client=new Pool({
    user:"postgres",
    password:"jU9b0FzDHK9A51P3",
    database:"postgres",
    port:5432,
    host:"db.cfdhexebrdpjmzmfwdcg.supabase.co",
    ssl:{rejectUnauthorized:false},
});
client.connect(function(err) {
    if (err) throw err;
    
  });

const port= process.env.PORT || 2411;
app.listen(port, ()=>console.log(`Node app listening on port ${port}!`));

app.get('/svr/mobiles', (req, res)=>{
    let brands=req.query.brand;
    let rams=req.query.ram;
    let roms=req.query.rom;
    let os=req.query.os; 

    let sql="SELECT * FROM mobiles";
    client.query(sql, function(err, result){
        if(err) {
            res.status(404).send(err);
            console.log(err,'hii1')
        }
        else{
            let arr=result.rows;
            if(brands){
                let brandList=brands.split(',');
                arr=arr.filter(n=>brandList.includes(n.brand));
            }
            if(rams){
                let ramList=rams.split(',');
                arr=arr.filter(n=>ramList.includes(n.ram));
            }
            if(roms){
                let romList=roms.split(',');
                arr=arr.filter(n=>romList.includes(n.rom));
            }
            if(os){
                arr=arr.filter(n=>n.os==os);
            }
            res.send(arr);
            console.log('correct');
        }
    });
});

app.get('/svr/mobiles/:name', (req, res)=>{
    let name=req.params.name;
    let sql="SELECT * FROM mobiles";
    client.query(sql, function(err, result){
        if(err) res.status(404).send(err);
        else{
            let emp=result.rows.find(n=>n.name==name);
            // console.log(emp, empCode)
            res.send(emp);
        }
    });
});

app.post('/svr/mobiles', (req, res)=>{
    let body=req.body;
    let params=[body.name, body.price, body.brand, body.ram, body.rom, body.os];
    let sql="Insert into mobiles (name, price, brand, ram, rom, os) values ($1, $2, $3, $4, $5, $6)";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from mobiles";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows);
            })
        } 
    });
})

app.put('/svr/mobiles/:name', (req, res)=>{
    let body=req.body;
    let name=req.params.name;
    let params=[body.price, body.brand, body.ram, body.rom, body.os, name];
    let sql="UPDATE mobiles SET  price=$1, brand=$2, ram=$3, rom=$4, os=$5 WHERE name=$6";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from mobiles";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows.find(n=>n.name==name));
            })
        } 
    });
});


app.delete('/svr/mobiles/:name', (req, res)=>{
    let name=req.params.name;
    let sql="DELETE FROM mobiles WHERE name =$1";
    client.query(sql, [name], (err, result)=>{
        // console.log(result)
        if(err) res.status(404).send(err);
        else res.send("done");
    });
});

app.get('/svr/resetData', (req, res)=>{
    let sql1 = "DELETE FROM mobiles";
    client.query(sql1,  (err, result)=>{
        if(err) {
            res.status(404).send(err);
            console.log(err, "hii1");
        }
        else {
            let {mobilesData} = require('./mobilesData.js');
            let arr1 = mobilesData.map(p => [p.name, p.price, p.brand, p.ram, p.rom, p.os]);
            for(row of arr1){

                let sql=`INSERT INTO mobiles (name, price, brand, ram, rom, os) VALUES ($1, $2, $3, $4, $5, $6)`;
                client.query(sql,row, (err, result)=>{
                    if(err){
                        res.status(404).send(err);
                    }
                    else{
                        // res.json({
                        //     data:result.rows
                        // })
                        console.log("done")
                    }
                })
            }
        }
        // client.end()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

    });
});