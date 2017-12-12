// import { setTimeout } from 'timers';

var express = require('express');
var router = express.Router();
var addr = require('./_areaData')

// home page
console.log(addr)
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Account Information' });
});

router.get('/my_list', function (req, res, next) {
    res.render('my_list');
})


router.get('/fix_detail', function (req, res, next) {
    res.render('fix_detail');
})
// router.get('/fix_detail', function (req, res, next) {
//     res.render('fix_detail')
// })
//获取部门
router.get('/get_depart', function (req, res, next) {
    var db = req.con;
    var query = req.query.data;

    var sql = 'SELECT * FROM ga_depart  WHERE  id > 0';
    db.query(sql, function (err, rows) {
        var data = rows;
        res.json(rows)
    });
})

//获取地址
router.get('/address', function (req, res, next) {
    res.json(addr)
})


//获取个人信息
router.get('/get_user', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var sql = 'SELECT * from ga_user WHERE userid = ' + '"' + query.userid + '"';
    console.log(sql)
    db.query(sql, function (err, rows) {
        console.log(rows, 'dfd')
        var data = {};
        data.user = rows[0];
        if (rows.length) {
            var sql2 = 'SELECT * FROM ga_depart WHERE id = ' + '"' + rows[0].depart + '"';
            db.query(sql2, function (err, result) {
                console.log(result)
                data.depart = result[0];
                res.json(data)
            })
        } else {
            res.json(data);
        }
    })
    // console.log(query, 'query')
})

//获取单位车辆
router.get('/get_car', function (req, res, next) {
    var db = req.con;
    var depart = req.query.depart;
    var sql = null;
    if (depart == 0) {
        sql = "select a.*,b.*,c.* from ((select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart > " + depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num) left join ga_user as c on b.name = c.name";
    } else {
        sql = "select a.*,b.*,c.* from ((select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num) left join ga_user as c on b.name = c.name";
    }
    db.query(sql, function (err, result) {
        // console.log(result)
        // data.depart = result[0];
        res.json(result)
    })
})





//获取审核人
router.get('/getaudit', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    console.log(query)
    var str = [];
    for (var o in query) {
        str.push(query[o])
    }
    var sql = 'select * from ga_user where depart in (' + str.join(',') + ')'
    console.log(sql)
    db.query(sql, function (err, result) {
        // console.log(result)
        // data.depart = result[0];
        res.json(result)
    })
})


//提交申请
router.get('/add_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    console.log(query);
    let form = query.form_option;
    let text = [];
    // let val = [];
    let val2 = [];
    for (var o in form) {
        text.push(o);
        if (o == 'cre_tm') {
            console.log(typeof parseInt(form[o]))
            val2.push(parseInt(form[o]))
        } else {
            val2.push(form[o])
        }

    }
    // console.log(typeof form.cre_tm)
    let _uid = query.form_option.uid
    let _cre_tm = query.form_option.cre_tm;
    let val_str = '';
    val2.forEach(ele => {
        val_str += '"' + ele + '",'
    })
    val_str = val_str.slice(0, -1);
    console.log(val_str)
    let str1 = 'INSERT INTO ga_apply(' + text.join(',') + ') VALUES(' + val_str + ')'
    // console.log(str1)

    let spstatus_data = query.auditer || [];

    db.query(str1, function (err, result) {
        // console.log(result, 'ddd')
        let applyid = result.insertId;
        // console.log(spstatus_data, 'dfd')
        // if (applyid) {
        // console.log(spstatus_data,'ddddddd')
        // let i = 0;
        spstatus_data.forEach(ele => {
            if (ele) {
                let _sop = {
                    id: 0,
                    uid: ele.id,
                    apply_id: applyid,
                    cre_tm: _cre_tm,
                    isagree: 0,
                    sp_status: 1,
                }
                if (ele.role == "科所队领导") {
                    _sop.status = 1
                } else if (ele.role == '警务保障室领导') {
                    _sop.status = 2
                } else {
                    _sop.status = 3
                }
                let stext = [];
                // let val = [];
                let sval = [];
                for (var o in _sop) {
                    stext.push(o);
                    if (o == 'cre_tm') {
                        sval.push(parseInt(_sop[o]))
                    } else {
                        sval.push(_sop[o])
                    }

                }
                let sval_str = '';
                sval.forEach(ele => {
                    sval_str += '"' + ele + '",'
                })
                sval_str = sval_str.slice(0, -1);
                let sstr = 'INSERT INTO ga_spstatus(' + stext.join(',') + ') VALUES(' + sval_str + ')'
                // if()
                console.log(sstr)
                
                db.query(sstr, function (err, sres) {
                    console.log(sres, 'res')
                    res.json(applyid)
                })
            } else {
                // if (form.role == '局领导') {
                //     console.log('ddd,')
                //     let sstr = 'INSERT INTO ga_spstatus(id,status,isagree,uid,advice,cre_tm,apply_id) VALUES(0,1,1' + form.uid + ',' + form.cre_tm + ',' + applyid + ')'
                //     db.query(sstr, function (err, sres) {
                //         console.log(sres, 'res')
                //     })
                // }
            }

        })
        if (!spstatus_data.length) {
            if (form.role == '局领导') {
                console.log('ddd,')
                let sstr = 'INSERT INTO ga_spstatus(id,status,isagree,uid,cre_tm,apply_id,sp_status) VALUES("0","1","1","' + form.uid + '","' + form.cre_tm + '","' + applyid + '","5")'
                console.log(sstr, 'res')
                db.query(sstr, function (err, sres) {
                    console.log(err, sstr, 'res');
                    res.json(applyid)
                })
            }
        }
        
        // }


        // console.log(applyid)
    })


})
// router.get('./')


//获取申请详情
router.get('/getapply_list', function (req, res, next) {
    let db = req.con;
    let query = req.query;

    // let sql = 'select * from ga_apply where id = ' + query.applyid;
    let sql = 'select a.*,b.* ,c.* from (select * ,ga_apply.id as aid, ga_apply.name as aname,ga_apply.cre_tm as acre_tm from ga_apply where id = ' + query.applyid + ') as a '
        + 'left join (select *,ga_user.id as usid,ga_user.name as uname,ga_user.status as ustatus from ga_user where id > 0) as b on a.uid = b.id'
        + ' left join (select *,ga_depart.id as did,ga_depart.name as dname,ga_depart.note as dnote from ga_depart where id > 0) as c on a.depart = c.id'
    // let sql = ' select * from ga_apply where id = ' + query.applyid 
    let _r_o = {};
    db.query(sql, function (err, row) {
        console.log(row, 1);
        _r_o.apply = row;

        // let sql2 = 'select * from ga_spstatus where apply_id = ' + query.applyid;
        let sql2 = "select a.*,b.* from (select * ,ga_spstatus.id As sid,ga_spstatus.cre_tm As scre_tm,ga_spstatus.status As sstatus from ga_spstatus where apply_id = " + query.applyid + ") as a left join ga_user as b on a.uid = b.id order by a.status";
        console.log(sql2, 2)
        db.query(sql2, function (err, rows) {
            console.log(err, rows, 'ddfd');
            let sql3 = 'select * from ga_cart where name = "' + row[0].car_num + '"';
            // console.log()
            _r_o.spstatus = rows;

            if (row[0].car_num) {
                console.log(row[0].car_num, 'car');
                console.log(sql3)
                db.query(sql3, function (err, rows3) {
                    console.log(rows3)
                    _r_o.cart = rows3;
                    res.json(_r_o)
                })
            } else {
                res.json(_r_o);
            }
        })

    })
    // console.log(query)
})

//获取我的提交列表
router.get('/get_applys', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    // var str = 'select * from ga_apply where uid = ' + query.uid + ' order by id desc ';
    // var str = 'select * from ga_apply where uid = ' + query.uid
    //     + ' UNION select * from ga_apply2 where DEPT = 2';

    // var str = 'select * from ga_apply where uid = ' + query.uid + ' left join ga_apply2  on ga_apply.depart = ga_apply2.DEPT '
    //     + ' UNION select * from ga_apply2 where DEPT = 2 left join ga_apply ga_apply.depart = ga_apply2.DEPT';


    var str = "select * from  ga_apply right join ga_apply2 on ga_apply.id=ga_apply2.SPJB where ga_apply2.DEPT = " + query.depart
        + " union "
        + "(select * from ga_apply left join ga_apply2 on  ga_apply.id=ga_apply2.SPJB where ga_apply.uid = " + query.uid + ") order by cre_tm desc, SQSJ desc"


    console.log(str)
    db.query(str, function (err, rows) {
        console.log(rows, 'sssss')
        let data = rows || [];
        if (data.length >= 1) {
            let i = 0;
            data.forEach((ele, index) => {
                if (ele.id) {
                    let str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    db.query(str2, function (error, row) {
                        i++;
                        // console.log(i, 'i', typeof row)
                        // console.log(str2, error, index, i)
                        ele.spstatus = row || [];
                        if (data.length == i) {
                            res.json(data);
                        }
                    })
                } else if (ele.XLH) {
                    let str2 = 'select * from ga_spstatus where apply2_id = ' + ele.XLH + ' order by status';
                    db.query(str2, function (error, row) {
                        i++;
                        // console.log(i, 'i', typeof row)
                        // console.log(str2, error, index, i)
                        ele.spstatus = row || [];
                        if (data.length == i) {
                            res.json(data);
                        }
                    })
                }

            })
        } else {
            res.json(rows)
        }
    })
})


//获取我已处理审核的列表
router.get('/audit_list', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let cpage1 = query.currentPage * query.pageSize;
    let cpage2 = query.pageSize;
    // let psize = query.pageSize;

    // var str = 'select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' and isagree > 0) as a left join ga_apply as b on a.apply_id = b.id order by a.id desc limit ' + cpage1 + ',' + cpage2;
    var str = "select a.*,b.*,c.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (uid = " + query.uid + " and isagree > 0) ) as a "
        + "left join ga_apply as b on a.apply_id = b.id  "
        + "left join ga_apply2 as c on a.apply2_id = c.XLH order by a.id desc limit " + cpage1 + "," + cpage2;
    var str = "select a.*,b.*,c.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (uid = " + query.uid + " and isagree > 0) ) as a "
        + "left join ga_apply as b on a.apply_id = b.id  "
        + "left join ga_apply2 as c on a.apply2_id = c.XLH order by a.id desc limit " + cpage1 + "," + cpage2;
    // var str = 'select * from ga_spstatus where uid = ' + query.uid
    console.log(str)
    let _index = 0;
    db.query(str, function (err, rows) {
        console.log(err, rows, query);
        let data = rows || [];
        if (data.length) {
            data.forEach((ele, index) => {
                console.log(_index)
                if (ele.id) {
                    let str1 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(data);
                        }
                    })
                } else if (ele.XLH) {
                    let str1 = 'select * from ga_spstatus where apply2_id = ' + ele.XLH + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(data);
                        }
                    })
                } else {
                    _index++;
                    if (data.length == _index) {
                        res.json(data);
                    }
                }
            })
        } else {
            res.json(data)
        }
    })
})

//获取未处理的审核列表
router.get('/no_audit_list', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let cpage1 = query.currentPage * query.pageSize;
    let cpage2 = query.pageSize;
    // var str = 'select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' and isagree = 0) as a left join ga_apply as b on a.apply_id = b.id  order by a.id desc limit ' + cpage1 + ',' + cpage2;
    // var str = '(select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' and isagree = 0) as a left join ga_apply as b on a.apply_id = b.id or left join ga_apply2 as b on a.apply_id = b.XLH order by a.id desc'
    var str = "select a.*,b.*,c.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = " + query.uid + " and isagree = 0) as a "
        + "left join ga_apply as b on a.apply_id = b.id  "
        + "left join ga_apply2 as c on a.apply2_id = c.XLH order by a.id desc limit " + cpage1 + "," + cpage2;
    // var str = 'select * from ga_spstatus where uid = ' + query.uid
    let _index = 0;
    db.query(str, function (err, rows) {
        console.log(err, rows, query);
        let data = rows;
        if (data.length) {
            data.forEach((ele, index) => {
                console.log(_index)
                if (ele.id) {
                    let str1 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(rows);
                        }
                    })
                } else if (ele.XLH) {
                    let str1 = 'select * from ga_spstatus where apply2_id = ' + ele.XLH + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(data);
                        }
                    })
                } else {
                    _index++;
                    if (rows.length == _index) {
                        res.json(rows);
                    }
                }
            })
        } else {
            res.json(data)
        }
        // 
    })
})




//获取车队还车列表
router.get('/getcar_num', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str1 = "select a.*,b.* from (select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + query.depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num order by b.id desc";
    console.log(str1)
    // let str = 'select * from ga_cart where depart = 58';
    let i = 0;
    db.query(str1, function (err, row) {
        // res.json(row)
        row.forEach(ele => {
            let _eid = ele.id || 0
            let str = 'select * from ga_spstatus where apply_id = ' + _eid + ' order by status';
            console.log(str, 'str')
            db.query(str, function (er, ro) {
                console.log(row.length, i, er)
                i++;
                ele.spstatus = ro;

                if (row.length == i) {
                    res.json(row)
                }
            })

        })

    })
})

//更新申请状态
router.get('/up_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_apply SET etm=' + query.etm + ',is_sh = 2 WHERE id=' + query.id;

    db.query(str, function (err, row) {
        console.log(row);
        if (query.sp_status) {
            let str2 = 'update ga_spstatus set sp_status = ' + query.sp_status + ' where apply_id = ' + query.id
            db.query(str2, function (error, rows) {
                res.json(row)
            })
        } else {
            res.json(row)
        }


    })
    // console.log(str)
})

//审核是否同意
router.get('/agree_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_spstatus SET isagree=' + query.isagree + ' WHERE id=' + query.id;
    db.query(str, function (err, row) {
        console.log(row);
        if (query.isagree == 2) {
            let str1 = 'update ga_apply set etm = ' + query.etm + ' where id = ' + query.applyid;
            db.query(str1, function (error, ros) {
                let str2 = 'update ga_spstatus set sp_status = ' + query.sp_status + ' where apply_id = ' + query.applyid
                db.query(str2, function (error1, row1) {
                    res.json(row);
                })
            })
        } else {
            // res.json(row);
            // let str1 = 'update ga_spstatus set agress'
            if (query.sp_status) {
                let str2 = 'update ga_spstatus set sp_status = ' + query.sp_status + ' where apply_id = ' + query.applyid
                db.query(str2, function (error1, row1) {
                    res.json(row);
                })
            }else {
                res.json(row);
            }
        }

    })
})


//获取需要派车的申请列表
router.get('/getdriver', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var db = req.con;
    var query = req.query;
    var str = 'select * from ga_apply where driver = 3 and etm = 0 order by id desc ';
    db.query(str, function (err, rows) {
        console.log(rows, '')
        let data = rows || [];
        if (data.length >= 1) {
            let i = 0;
            data.forEach((ele, index) => {
                var str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                db.query(str2, function (error, row) {
                    i++;
                    console.log(str2, error, index, i)
                    ele.spstatus = row || [];
                    if (data.length == i) {
                        res.json(data);
                    }

                })

            })
        } else {
            res.json(rows)
        }
    })
})


//获取司机和车辆
router.get('/getcar_driver', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str1 = "select a.*,b.* from (select *, ga_cart.id AS cid,ga_cart.name AS cname,ga_cart.uid AS cuid,ga_cart.depart AS cdepart from ga_cart where depart = " + query.depart + ") as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.car_num";
    // console.log(str1)
    // let str = 'select * from ga_cart where depart = 58';
    // let i = 0;

    db.query(str1, function (err, row) {
        let data = { car: row }
        let str2 = "select a.*,b.* from (select *, ga_driver.id AS did, ga_driver.uid AS duid,ga_driver.cre_tm AS dcre_tm,ga_driver.name AS dname from ga_driver where uid = 1) as a left join (select *,ga_apply.id AS aid,ga_apply.depart AS adepart from ga_apply where etm='0') as b on a.name=b.driver";
        db.query(str2, function (err, rows) {
            data.driver = rows;
            res.json(data)
        })

    })
})

//车队派车
router.get('/up_applypc', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let str = 'UPDATE ga_apply SET car_num="' + query.car + '",driver = "' + query.driver + '" WHERE id=' + query.id;
    console.log(str)
    db.query(str, function (err, ros) {
        console.log(err)
        res.json(ros)
    })
})


//搜索已提交列表
router.get('/search_apply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    // var str = 'select * from ga_apply where uid = ' + query.uid + ' order by id desc ';
    // var str = 'select * from ga_apply where uid = ' + query.uid
    //     + ' UNION select * from ga_apply2 where DEPT = 2';

    // var str = 'select * from ga_apply where uid = ' + query.uid + ' left join ga_apply2  on ga_apply.depart = ga_apply2.DEPT '
    //     + ' UNION select * from ga_apply2 where DEPT = 2 left join ga_apply ga_apply.depart = ga_apply2.DEPT';


    var str = "select * from  ga_apply right join ga_apply2 on ga_apply.id=ga_apply2.SPJB where ga_apply2.DEPT = " + query.depart
        + " union "
        + "(select * from ga_apply left join ga_apply2 on  ga_apply.id=ga_apply2.SPJB where ga_apply.uid = " + query.uid + ") order by cre_tm desc, SQSJ desc"


    console.log(str)
    db.query(str, function (err, rows) {
        console.log(rows, 'sssss')
        let data = rows || [];
        if (data.length >= 1) {
            let i = 0;
            data.forEach((ele, index) => {
                if (ele.id) {
                    let str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    db.query(str2, function (error, row) {
                        i++;
                        // console.log(i, 'i', typeof row)
                        // console.log(str2, error, index, i)
                        ele.spstatus = row || [];
                        if (data.length == i) {
                            res.json(data);
                        }
                    })
                } else if (ele.XLH) {
                    let str2 = 'select * from ga_spstatus where apply2_id = ' + ele.XLH + ' order by status';
                    db.query(str2, function (error, row) {
                        i++;
                        // console.log(i, 'i', typeof row)
                        // console.log(str2, error, index, i)
                        ele.spstatus = row || [];
                        if (data.length == i) {
                            res.json(data);
                        }
                    })
                }

            })
        } else {
            res.json(rows)
        }
    })
})

//搜索审核列表
router.get('/search_audit_list', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let cpage1 = query.currentPage * query.pageSize;
    let cpage2 = query.pageSize;
    // let psize = query.pageSize;

    // var str = 'select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' ) as a left join ga_apply as b on a.apply_id = b.id order by a.id desc';
    var str = "select a.*,b.*,c.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = " + query.uid + " ) as a "
        + "left join ga_apply as b on a.apply_id = b.id  "
        + "left join ga_apply2 as c on a.apply2_id = c.XLH order by a.id desc";
    // if (query.search) {
    // str = 'select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' and isagree > 0) as a left join (select * from ga_apply where name like "%' + query.search + '%"  or days like "%' + query.search + '%" ) as b on a.apply_id = b.id order by a.id desc'
    // str = 'select a.*,b.* from (select * from ga_apply where name like "%' + query.search + '%"  or days like "%' + query.search + '%" )  as a left join (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where uid = ' + query.uid + ' and isagree > 0) as b on a.id = b.apply_id order by a.id desc'
    // }


    // var str = 'select * from ga_spstatus where uid = ' + query.uid
    console.log(str)
    let _index = 0;
    db.query(str, function (err, rows) {
        console.log(err, rows, query);
        let data = rows || [];
        data = data.filter(ele => ele.suid == query.uid)
        console.log(data.length)
        if (data.length) {
            data.forEach((ele, index) => {
                console.log(_index)
                if (ele.id) {
                    let str1 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(data);
                        }
                    })
                } else if (ele.XLH) {
                    let str1 = 'select * from ga_spstatus where apply2_id = ' + ele.XLH + ' order by status';
                    db.query(str1, function (err, rowss) {
                        _index++;
                        // console.log(str1, _index)
                        ele.spstatus = rowss;
                        if (data.length == _index) {
                            res.json(data);
                        }
                    })
                } else {
                    _index++;
                    if (data.length == _index) {
                        res.json(data);
                    }
                }
            })
        } else {
            res.json(data)
        }

        // 
    })
})

// router.get('/up_applyend', function (req, res, next) {
//     var db = req.con;
//     var query = req.query;
//     let str = 'UPDATE ga_apply SET etm="' + query.car + '",driver = "' + query.driver + '" WHERE id=' + query.id;
//     db.query(str, function (err, ros) {
//         console.log(err)
//         res.json(ros)
//     })
// })

module.exports = router;
