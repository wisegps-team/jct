var express = require('express');
var router = express.Router();

// home page
router.get('/pc_carapply', function (req, res, next) {
    res.render('pc_carapply');
});
router.get('/pc_carapply_detail', function (req, res, next) {
    res.render('pc_carapply_detail')
})
router.get('/pc_repair', function (req, res, next) {
    res.render('pc_repair');
});
router.get('/pc_repair_detail', function (req, res, next) {
    res.render('pc_repair_detail')
})



router.get('/_getapply', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    var str = '';
    var sql = '';
    if (query.type == 1) {
        str = 'select * from ga_apply where uid = ' + query.uid + ' order by cre_tm desc';
    } else if (query.type == 2) {
        str = 'select * from ga_apply2 where DEPT = ' + query.depart + ' order by SQSJ desc'
    }

    let pagenum = req.query.page;
    let pageSize = req.query.pageSize;

    sql = str + " limit " + pagenum * pageSize + ' ,' + pageSize;

    db.query(str, function (err, rows) {
        var total = rows.length;
        var totalPage = parseInt(rows.length / pageSize);
        if (total > pageSize) {
            if (total % pageSize > 0) {
                totalPage += 1
            }
        }

        if (rows.length) {
            if (total > pageSize) {
                db.query(sql, function (err, rowss) {
                    let data = rowss || [];
                    let i = 0;
                    data.forEach(ele => {
                        let str2 = '';
                        if (query.type == 1) {
                            str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                        } else if (query.type == 2) {
                            str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                        }
                        db.query(str2, function (error, row) {
                            i++;
                            ele.spstatus = row || [];
                            if (data.length == i) {
                                let dd = {
                                    total: total,
                                    totalPage: totalPage,
                                    data: data,
                                }
                                res.json(dd);
                            }
                        })
                    })

                })
            } else {
                let data = rows || [];
                let i = 0;
                data.forEach(ele => {
                    let str2 = '';
                    if (query.type == 1) {
                        str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                    } else if (query.type == 2) {
                        str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                    }
                    db.query(str2, function (error, row) {
                        i++;
                        ele.spstatus = row || [];
                        if (data.length == i) {
                            let dd = {
                                total: total,
                                totalPage: totalPage,
                                data: data,
                            }
                            res.json(dd);
                        }
                    })
                })
            }
        } else {
            let dd = {
                total: total,
                totalPage: totalPage,
                data: rows,
            }
            res.json(dd)
        }
    })
})




//获取我已处理审核的列表
router.get('/_getaudit', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let pagenum = req.query.page;
    let pageSize = req.query.pageSize;
    var str = '';
    let sql = '';

    if (query.type == 1) {
        str = "select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (sp_status != 1 and uid = " + query.uid + " and isagree >= 0 and apply_id >= 0) ) as a "
            + "left join ga_apply as b on a.apply_id = b.id  "
            + "order by a.apply_id desc";
    } else if (query.type == 2) {
        str = "select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (sp_status != 1 and uid = " + query.uid + " and isagree >= 0 and apply2_id >= 0) ) as a "
            + "left join ga_apply2 as b on a.apply2_id = b.XLH  "
            + "order by a.apply2_id desc";
    }

    sql = str + " limit " + pagenum * pageSize + ' ,' + pageSize;


    // let _index = 0;
    db.query(str, function (err, rows) {
        var total = rows.length;
        var totalPage = parseInt(rows.length / pageSize);
        if (total > pageSize) {
            if (total % pageSize > 0) {
                totalPage += 1
            }
        }
        if (rows.length) {
            if (total > pageSize) {
                db.query(sql, function (err, rowss) {
                    let data = rowss || [];
                    let i = 0;
                    data.forEach(ele => {
                        if (ele.id || ele.XLH) {
                            let str2 = '';
                            if (query.type == 1) {
                                str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                            } else if (query.type == 2) {
                                str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                            }
                            db.query(str2, function (error, row) {
                                i++;
                                ele.spstatus = row || [];
                                if (data.length == i) {
                                    let dd = {
                                        total: total,
                                        totalPage: totalPage,
                                        data: data,
                                    }
                                    res.json(dd);
                                }
                            })
                        } else {
                            i++;
                            if (data.length == i) {
                                let dd = {
                                    total: total,
                                    totalPage: totalPage,
                                    data: data,
                                }
                                res.json(dd);
                            }
                        }
                    })

                })
            } else {
                let data = rows || [];
                let i = 0;
                data.forEach(ele => {
                    if (ele.id || ele.XLH) {
                        let str2 = '';
                        if (query.type == 1) {
                            str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                        } else if (query.type == 2) {
                            str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                        }
                        db.query(str2, function (error, row) {
                            i++;
                            ele.spstatus = row || [];
                            if (data.length == i) {
                                let dd = {
                                    total: total,
                                    totalPage: totalPage,
                                    data: data,
                                }
                                res.json(dd);
                            }
                        })
                    } else {
                        i++;
                        if (data.length == i) {
                            let dd = {
                                total: total,
                                totalPage: totalPage,
                                data: data,
                            }
                            res.json(dd);
                        }
                    }
                })
            }
        } else {
            let dd = {
                total: total,
                totalPage: totalPage,
                data: rows,
            }
            res.json(dd)
        }
    })
})

//获取我审核中的列表
router.get('/_getauditing', function (req, res, next) {
    var db = req.con;
    var query = req.query;
    let pagenum = req.query.page;
    let pageSize = req.query.pageSize;
    var str = '';
    let sql = '';

    if (query.type == 1) {
        str = "select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (sp_status = 1 and uid = " + query.uid + " and isagree = 0 and apply_id >= 0) ) as a "
            + "left join ga_apply as b on a.apply_id = b.id  "
            + "order by a.apply_id desc";
    } else if (query.type == 2) {
        str = "select a.*,b.* from (select *,ga_spstatus.id as sid,ga_spstatus.uid as suid,ga_spstatus.status as sstatus,ga_spstatus.cre_tm as scre_tm  from ga_spstatus where (sp_status = 1 and uid = " + query.uid + " and isagree = 0 and apply2_id >= 0) ) as a "
            + "left join ga_apply2 as b on a.apply2_id = b.XLH  "
            + "order by a.apply2_id desc";
    }

    sql = str + " limit " + pagenum * pageSize + ' ,' + pageSize;


    // let _index = 0;
    db.query(str, function (err, rows) {
        var total = rows.length;
        var totalPage = parseInt(rows.length / pageSize);
        if (total > pageSize) {
            if (total % pageSize > 0) {
                totalPage += 1
            }
        }
        if (rows.length) {
            if (total > pageSize) {
                db.query(sql, function (err, rowss) {
                    let data = rowss || [];
                    let i = 0;
                    data.forEach(ele => {
                        if (ele.id || ele.XLH) {
                            let str2 = '';
                            if (query.type == 1) {
                                str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                            } else if (query.type == 2) {
                                str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                            }
                            db.query(str2, function (error, row) {
                                i++;
                                ele.spstatus = row || [];
                                if (data.length == i) {
                                    let dd = {
                                        total: total,
                                        totalPage: totalPage,
                                        data: data,
                                    }
                                    res.json(dd);
                                }
                            })
                        } else {
                            i++;
                            if (data.length == i) {
                                let dd = {
                                    total: total,
                                    totalPage: totalPage,
                                    data: data,
                                }
                                res.json(dd);
                            }
                        }
                    })

                })
            } else {
                let data = rows || [];
                let i = 0;
                data.forEach(ele => {
                    if (ele.id || ele.XLH) {
                        let str2 = '';
                        if (query.type == 1) {
                            str2 = 'select * from ga_spstatus where apply_id = ' + ele.id + ' order by status';
                        } else if (query.type == 2) {
                            str2 = 'select * from ga_spstatus where apply2_id = ' + ele.id + ' order by status';
                        }
                        db.query(str2, function (error, row) {
                            i++;
                            ele.spstatus = row || [];
                            if (data.length == i) {
                                let dd = {
                                    total: total,
                                    totalPage: totalPage,
                                    data: data,
                                }
                                res.json(dd);
                            }
                        })
                    } else {
                        i++;
                        if (data.length == i) {
                            let dd = {
                                total: total,
                                totalPage: totalPage,
                                data: data,
                            }
                            res.json(dd);
                        }
                    }
                })
            }
        } else {
            let dd = {
                total: total,
                totalPage: totalPage,
                data: rows,
            }
            res.json(dd)
        }
    })
})
module.exports = router;
