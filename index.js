const http = require('http');
const q = require('q');
const url = require('url');
const { Client } = require('pg');
var fs = require('fs');

http.createServer((req, res) => {
  console.log(req.method)
  console.log(req.url)
  var httpHandlers = {    //مدیریت توابع
    Home: {
      GET:Home
    },
    Movies: {
      POST: Search, //تابع آبدیت اطلاعات
      GET: Info, //تابع دیافت اطلاعات یک عضو
    },
    Signup: {
      POST: Signup, //تابع آبدیت اطلاعات
    },
    Movise: {
      POST: Movise, //تابع آبدیت اطلاعات
    },
    Comment: {
      POST: Comment, //تابع آبدیت اطلاعات
    },
    Rate: {
      POST: Rate, //تابع آبدیت اطلاعات
    }
  };

  const queryObject = url.parse(req.url, true);
  pathname = queryObject.pathname.split('/');
  if (httpHandlers[pathname[1]] && httpHandlers[pathname[1]][req.method]) {

    httpHandlers[pathname[1]][req.method](req, res)   //فراخوانی تابع مورد نظر

  } else {
    res.statusCode = 400;
    res.write("err from url or method");
    res.end();
  }

}).listen(81, () => console.log("server start"));






function Home(req, res) {

fs.readFile('./home.html', function (err, html) {
    if (err) {
        throw err; 
    }       
 
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();  

});
}























function Search(req, res) {

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();


  getBody(req)
    .then(body => {
      console.log(body)
      if (body == null) {
        res.statusCode = 400;
        res.write("err input type");
        res.end();
      } else {
        if (body.minviewers >= 0) {
          var query = `SELECT filmtitle,year,rate,id FROM movies WHERE viewers >= ('` + body.minviewers + `') `;
          if (body.partname != "") { query = query + ` AND filmtitle LIKE ('%` + body.partname + `%') ` }
          if (body.downyear != "") { query = query + ` AND year >= ('` + body.downyear + `') ` }
          if (body.upyear != "") { query = query + ` AND year <= ('` + body.upyear + `') ` }
          if (body.downrate != "") { query = query + ` AND rate >= ('` + body.downrate + `') ` }
          if (body.uprate != "") { query = query + ` AND rate <= ('` + body.uprate + `') ` }
          query = query + ` ORDER BY rate DESC `
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaa", query)
          client.query(query)
            .then(res1 => {
              console.log("oooooooooooooooooooooooooooooooooooooooo", res1.rows)
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.write(JSON.stringify(res1.rows));
              res.end();
            })
            .catch(err => {
              console.error(err);
            })
            .finally(() => {
              client.end();
            });




        } else {
          res.statusCode = 400;
          res.write("err input type");
          res.end();
        }
      }
    })
}






















function Info(req, res) {
  data = req.url.split('?');
  id = data[1].split('=');

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();

  const query = `SELECT * FROM movies WHERE id IN ('` + id[1] + `')`;
  client.query(query)
    .then(res1 => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(res1.rows));
      res.end();

    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      client.end();
    });


}





















function Signup(req, res) {


  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();


  getBody(req)
    .then(body => {
      if (body == null) {
        res.statusCode = 400;
        res.write("err input type");
        res.end();
      } else {
        if (body.user && body.pass && body.phone) {
          let today = new Date();

          const query = `SELECT username FROM users WHERE username IN ('` + body.user + `') `
          client.query(query)
            .then(res1 => {

              if (res1.rows[0] == undefined) {

                const query1 = ` INSERT INTO users (username, password, phone, date) VALUES ('` + body.user + `', '` + body.pass + `', '` + body.phone + `', '` + today + `') `;
                client.query(query1)
                  .then(res3 => {

                    res.write("sabt shod");
                    res.end();

                  })
                  .catch(err => {
                    console.error(err);
                  })


              } else {
                res.write("user takrare");
                res.end();
              }

            })
            .catch(err => {
              console.error(err);
            })




        } else {
          res.statusCode = 400;
          res.write("err input type");
          res.end();
        }
      }
    })
}





























function Movise(req, res) {


  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();


  getBody(req)
    .then(body => {
      if (body == null) {
        res.statusCode = 400;
        res.write("err input type");
        res.end();
      } else {
        if (body.filmtitle && body.year && body.user && body.pass && body.companys && body.directors && body.actors) {

          const querySELECT = `SELECT username FROM users WHERE username IN ('` + body.user + `') AND password IN ('` + body.pass + `')`;

          client.query(querySELECT)
            .then(res4 => {

              if (res4.rows[0] != undefined) {

                const querymovies = `SELECT filmtitle FROM movies WHERE filmtitle IN ('` + body.filmtitle + `') AND year IN ('` + body.year + `')`;
                client.query(querymovies)
                  .then(res1 => {
                    if (res1.rows[0] == undefined) {
                      const queryid = `SELECT nextval('movies_id_seq')`;
                      client.query(queryid)
                        .then(resid => {
                          id = resid.rows[0].nextval;
                          let today = new Date();

                          const queryINSERT = `INSERT INTO movies (filmtitle, year, id, rate, viewers, recommendedby, dateregister) VALUES ('` + body.filmtitle + `', '` + body.year + `', '` + id + `', '` + 0 + `', '` + 0 + `', '` + body.user + `', '` + today + `')`;
                          q.allSettled([
                            client.query(queryINSERT),
                            arrayinsert(id, body.companys, "c"),
                            arrayinsert(id, body.directors, "d"),
                            arrayinsert(id, body.actors, "a")
                          ]).then(function (results) {
                            res.write("sabt shod");
                            res.end();
                          });

                        })
                        .catch(err => {
                          console.error(err);
                        })
                    } else {
                      res.write("movies tekrare");
                      res.end();
                    }
                  })
                  .catch(err => {
                    console.error(err);
                  })

              } else {
                res.write("user ea pass eshtbah");
                res.end();
              }
            })
            .catch(err => {
              console.error(err);
            })

        } else {
          res.statusCode = 400;
          res.write("err input type");
          res.end();
        }
      }
    })
}
































function Comment(req, res) {


  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();


  getBody(req)
    .then(body => {
      if (body == null) {
        res.statusCode = 400;
        res.write("err input type");
        res.end();
      } else {
        if (body.user && body.pass && body.movieid && body.comment) {

          let today = new Date();
          var str = body.comment + "," + body.user + "," + today + "&";

          client.connect();
          const querySELECT = `SELECT username FROM users WHERE username IN ('` + body.user + `') AND password IN ('` + body.pass + `')`;

          client.query(querySELECT)
            .then(res1 => {
              if (res1.rows[0] != undefined) {
                const querySELECT2 = `SELECT comments FROM movies WHERE id IN ('` + body.movieid + `')`;
                client.query(querySELECT2)
                  .then(res2 => {
                    var query = ``;
                    if (res1.rows[0].comments != undefined) {
                      query = `UPDATE movies SET comments = '` + res1.rows[0].comments + str + `' WHERE id IN ('` + body.movieid + `')`;
                    } else {
                      query = `UPDATE movies SET comments = '` + str + `' WHERE id IN ('` + body.movieid + `')`;
                    }
                    client.query(query)
                      .then(res2 => {
                        res.write("save shod");
                        res.end();
                      })
                      .catch(err => {
                        console.error(err);
                      })
                      .finally(() => {
                        client.end();
                      });
                  })
                  .catch(err => {
                    console.error(err);
                    client.end();
                  })

              } else {
                res.write("user ea pass eshtbah");
                res.end();
              }
            })
            .catch(err => {
              console.error(err);
              client.end();
            })

        } else {
          res.statusCode = 400;
          res.write("err input type");
          res.end();
        }
      }
    })
}




























function Rate(req, res) {


  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });
  client.connect();


  getBody(req)
    .then(body => {
      if (body == null) {
        res.statusCode = 400;
        res.write("err input type");
        res.end();
      } else {
        if (body.user && body.pass && body.movieid && body.rate) {

          let today = new Date();

          client.connect();
          const querySELECT = `SELECT username FROM users WHERE username IN ('` + body.user + `') AND password IN ('` + body.pass + `')`;
          client.query(querySELECT)
            .then(res5 => {
              if (res5.rows[0] != undefined) {
                const querySELECT2 = `SELECT username FROM rate WHERE username IN ('` + body.user + `') AND movieid IN ('` + body.movieid + `')`;
                client.query(querySELECT2)
                  .then(res1 => {
                    if (res1.rows[0] == undefined) {
                      const queryINSERT = `INSERT INTO rate (username, movieid, rate, date) VALUES ('` + body.user + `', '` + body.movieid + `', '` + body.rate + `', '` + today + `')`;
                      client.query(queryINSERT)
                        .then(res2 => {
                          const querySELECT3 = `SELECT rate,viewers FROM movies WHERE id IN ('` + body.movieid + `')`;
                          client.query(querySELECT3)
                            .then(res3 => {
                              tab = res3.rows[0].viewers + 1
                              newrate = ((res3.rows[0].rate * res3.rows[0].viewers) + body.rate) / tab
                              const queryUPDATE = `UPDATE movies SET rate = '` + newrate + `', viewers = '` + tab + `' WHERE id IN ('` + body.movieid + `')`;
                              client.query(queryUPDATE)
                                .then(res4 => {
                                  res.write("save shod");
                                  res.end();
                                })
                                .catch(err => {
                                  console.error(err);
                                })
                            })
                            .catch(err => {
                              console.error(err);
                            })
                        })
                        .catch(err => {
                          console.error(err);
                        })
                    } else {
                      res.write("your rated");
                      res.end();
                    }
                  })

                  .catch(err => {
                    console.error(err);
                    client.end();
                  })

              } else {
                res.write("user or pass invalid");
                res.end();
              }
            })
            .catch(err => {
              console.error(err);
              client.end();
            })

        } else {
          res.statusCode = 400;
          res.write("err input type");
          res.end();
        }
      }
    })
}





























function queryStringToObject(queryString) {
  let obj = {}
  if (queryString) {
    queryString.slice(0).split('&').map((item) => {
      const [k, v] = item.split('=')
      v ? obj[k] = v : null
    })
  }
  return obj
}


function getBody(req) {
  let defer = q.defer();
  let body = [];
  let processData;
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    if (body == "" || body == null || body == undefined) {
      defer.resolve(null)
    } else {
      try {
        processData = JSON.parse(body);
        defer.resolve(processData)
      } catch (error) {
        defer.resolve(null)
      }
    }
  });
  return defer.promise;
}


























































































function arrayinsert(movieid, arrayid, rolearray) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'prospect',
    password: '12281693',
    port: 5432
  });

  client.connect();
  arrayid.forEach(element => {
    var queryINSERTrole = `INSERT INTO role (movieid, roleid, role) VALUES ('` + movieid + `', '` + element + `', '` + rolearray + `')`;
    client.query(queryINSERTrole)
      .then(res3 => {
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        client.end();
      });
  });

}