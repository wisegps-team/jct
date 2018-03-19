
$(document).ready(function () {



    console.log(defalut)
    // debugger;
    // var 
    var _tab = 0;
    var _tab1 = 0;
    var _tab2 = 0;
    _tab = sessionStorage.getItem('tab') || 0;
    _tab1 = sessionStorage.getItem('tab1') || 0;
    _tab2 = sessionStorage.getItem('tab2') || 0;
    _tab3 = sessionStorage.getItem('tab3') || 0;

    var userid = W.getCookie('userid');
    var _user = {};
    var _user1 = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : ''
    var currentPage = 1,
        pageSize = 10;

    var sp_status = defalut.use.status;
    var app_state = defalut.repair.STATE

    var w_audited = [],
        w_auditing = [],
        w_commit = [],
        show_more = true;

    var all_audits = [];
    var all_apply = [];

    var all_auditing = [];

    var logining = function () {
        $.ajax({
            url: '/login',
            data: { password: hex_md5('123456') },
            success: function (res) {
                W.setCookie('dev_key', res.wistorm.dev_key);
                W.setCookie('app_key', res.wistorm.app_key);
                W.setCookie('app_secret', res.wistorm.app_secret);
                W.setCookie('auth_code', res.access_token);
                wistorm_api.getUserList({ username: userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                    debugger;
                    if (json.data[0]) {
                        _user1.user = json.data[0];
                        wistorm_api._list('employee', { uid: _user1.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                            _user1.employee = emp.data[0];
                            if (emp.data[0]) {
                                if (emp.data[0].roleId) {
                                    wistorm_api._list('role', { objectId: emp.data[0].roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                        // console.log(roles)
                                        _user1.employee.rolename = roles.data[0] ? roles.data[0].name.trim() : null;
                                        wistorm_api._list('department', { objectId: _user1.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                            _user1.depart = dep.data[0];
                                            mainContral(_user1)
                                        })
                                    })
                                } else {
                                    wistorm_api._list('department', { objectId: _user1.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                        _user1.depart = dep.data[0];
                                        mainContral(_user1)
                                    })
                                }
                            }
                        })
                    }
                    else {
                        weui.alert('还未登录', function () {
                            W.setCookie('userid', '', 30) //清空userid记录
                            W.setCookie('account', '', 30)
                            W.setCookie('password', '', 30);
                            top.location = '/'
                        })
                    }
                })
            }
        })
    }
    if (_user1) {
        if (userid) {
            if (userid == _user1.user.username) {
                mainContral(_user1)
            } else {
                logining();
            }
        } else {
            mainContral(_user1)
        }

    } else {
        _user1 = {};
        logining();
    }


    function mainContral(res) {
        console.log(res, '_user')
        sessionStorage.setItem('user', JSON.stringify(res));
        if (_tab == 2) { //提交列表
            if (_tab3 == 0) {
                My_push_list()
            } else {
                repair_history()
            }
        } else if (_tab == 1) { //审核列表
            if (_tab1 == 0) { //未审核
                all_auditing = [];
                My_auditing_list()
            } else if (_tab1 == 1) { //已审核
                My_audited_list()
            }
        } else if (_tab == 3) { //车队列表
            if (_tab2 == 1) { //派车
                // getdriver()
                vehicle_dispatch()
            } else if (_tab2 == 0) { //还车
                vehicle_return()
            }
        }
        if (res.depart.name == '车队' && (res.employee.role == 12 || res.employee.role == 13)) {
            $('#show_back').show()
        }
    }

    weui.tab('#tab', {
        defaultIndex: _tab,
        onChange: function (index) {
            sessionStorage.setItem('tab', index);
            console.log(index, 1);
            _tab = index;
            currentPage = 1;
            if (_tab == 2) { //提交列表
                if (_tab3 == 0) {
                    My_push_list()
                } else {
                    repair_history()
                }
            } else if (_tab == 1) { //审核列表
                if (_tab1 == 0) { //未审核
                    // all_auditing = [];
                    My_auditing_list()
                } else if (_tab1 == 1) { //已审核
                    My_audited_list()
                }
            } else if (_tab == 3) { //车队列表
                if (_tab2 == 1) { //派车
                    // getdriver()
                    vehicle_dispatch()
                } else if (_tab2 == 0) { //还车
                    vehicle_return()
                }
            }
        }
    });


    //审核切换
    //审核已处理和未处理
    W.tab('#tab1', {
        defaultIndex: _tab1,
        onChange: function (index) {
            console.log(index, 'index')
            sessionStorage.setItem('tab1', index);
            _tab1 = index;
            currentPage = 1;
            if (index == 0) {
                // w_auditing = [];
                My_auditing_list()
            } else if (index == 1) {
                w_audited = [];
                My_audited_list()
            }
        }
    }, { c1: ".weui-navbar__item1", c3: ".weui-tab__content1" });

    //车队切换
    W.tab('#tab2', {
        defaultIndex: _tab2,
        onChange: function (index) {
            console.log(index)
            _tab2 = index;
            sessionStorage.setItem('tab2', index);
            if (index == 1) {
                vehicle_dispatch()
            } else {
                vehicle_return()
            }
        }
    }, { c1: ".weui-navbar__item2", c3: ".weui-tab__content2" });


    //提交切换
    W.tab('#tab3', {
        defaultIndex: _tab3,
        onChange: function (index) {
            // console.log(index)
            _tab2 = index;
            sessionStorage.setItem('tab3', index);
            if (index == 0) {
                My_push_list()
            } else {
                repair_history()
            }
        }
    }, { c1: ".weui-navbar__item3", c3: ".weui-tab__content3" });

    //我的用车申请
    function My_push_list() {
        var option = { uid: _user1.user.objectId };
        submmit(option, 'ga_apply', '-id')
    }

    //我的车修申请
    function repair_history() {
        var option = {};
        if (_user1.depart.name == '修理厂') {
            option = { WXDW: _user1.employee.name }
        } else {
            option = { DEPT: _user1.employee.departId }
        }
        submmit(option, 'ga_apply2', '-XLH')
    }


    //车队派车
    function vehicle_dispatch() {
        var option = { estatus: 8, etm: 0 }
        submmit(option, 'ga_apply', '-id', '#ss22')
    }
    //车队还车
    function vehicle_return() {
        var option = { estatus: 9, etm: 0 };
        submmit(option, 'ga_apply', '-id', '#ss11')
    }

    //查询结果
    function submmit(json, table, sorts, selector) {
        W.$ajax('/mysql_api/list', {
            json_p: json,
            table: table,
            sorts: sorts
        }, function (app) {
            console.log(app);
            var i = 0;
            if (app.data.length) {
                app.data.forEach(ele => {
                    // var id = ele.id || ele.XLH;
                    var json = {}
                    if (ele.id) {
                        json = { apply_id: ele.id }
                    } else if (ele.XLH) {
                        json = { apply2_id: ele.XLH }
                    }
                    W.$ajax('/mysql_api/list', {
                        json_p: json,
                        table: 'ga_spstatus'
                    }, function (sps) {
                        i++;
                        ele.spstatus = sps.data
                        if (i == app.data.length) {
                            selector ? show_dispatch(app.data, selector) : own_List(app.data)
                        }
                    })
                })
            } else {
                selector ? show_dispatch(app.data, selector) : own_List(app.data)
            }

        })
    }

    //显示派车和还车列表
    function show_dispatch(res, selector) {
        $(selector).empty();
        res = res || [];
        if (res.length) {
            res.forEach((_ele, index) => {
                var ele = _ele;
                if (!_ele.id) {
                    ele = _ele.apply
                }
                if (ele.id) {
                    let _href = './my_list?applyid=' + ele.id + '&vehiclesend=' + true;
                    // let _status = 0;
                    // var applystatus = ele.spstatus[0] ? ele.spstatus[0].sp_status : 5
                    var name = ele.name
                    // console.log(index)
                    var use_status = '';
                    var color_status = '';
                    use_status = sp_status[ele.sp_status || 6]
                    // applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                    // applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
                    var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                    let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100">
                            <div class="weui-media-box weui-media-box_text">
                                <div class="weui-flex">
                                    <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                        <span style="vertical-align: middle">${name}用车</span>
                                        <span class="weui-badge great ${color_status}  chang_f12" style="margin-left: 5px;">${use_status}</span>
                                    </h4>
                                    <div class="weui-flex__item t_a_r" style="flex:2">${date}</div>
                                </div>
                                <div class="weui-flex ">
                                    <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">事由</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.days || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>`
                    $(selector).append(str_content);
                }
            })
        }
    }
    //显示我用车和车修列表
    function own_List(res) {
        console.log(res)
        all_apply = res;
        $('#own_list').empty();
        $('#repair_list').empty();
        res = res || [];
        if (res.length) {
            res.forEach((ele, index) => {
                if (ele.id) {
                    let _href = './my_list?applyid=' + ele.id + '&my=' + true;
                    // let _status = 0;
                    var applystatus = ele.spstatus[0] ? ele.spstatus[0].sp_status : 5
                    var name = ele.name
                    console.log(index)
                    var use_status = '';
                    // let color_status = '';
                    use_status = sp_status[ele.sp_status || 6]
                    // applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                    // applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
                    let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                    let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100" >
                            <div class="weui-media-box weui-media-box_text" >
                                <div class="weui-flex" >
                                    <h4 class="weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                        <span style="vertical-align: middle">${name}用车</span>
                                        <span class="weui-badge great   chang_f12" style="margin-left: 5px;">${use_status}</span>
                                    </h4>
                                    <div class="weui-flex__item t_a_r" style="flex:2" >${date}</div>
                                </div>
                                <div class="weui-flex ">
                                    <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">事由</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.days || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>`
                    $('#own_list').append(str_content);
                }
                if (ele.XLH) {
                    var _href = './fix_detail?applyid=' + ele.XLH + '&my=true';
                    name = ele.SQR + '的车修'
                    var use_status = app_state[ele.STATE];
                    var color_status = '';
                    // ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                    // if (level_show) {
                    let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100">
                            <div class="weui-media-box weui-media-box_text">
                                <div class="weui-flex">
                                    <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                        <span style="vertical-align: middle">${name}</span>
                                        <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                    </h4>
                                    <div class="weui-flex__item t_a_r" style="flex:2">${W.dateToString(W.date(ele.SQSJ))}</div>
                                </div>
                                <div class="weui-flex ">
                                    <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">号码号牌</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.HPHM}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">预计金额</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.YJJED}</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </a>`
                    $('#repair_list').append(str_content);
                }
            })
        }
    }
    //用车审核
    function use_apply(option, callback) {
        // debugger;
        W.$ajax('mysql_api/list', {
            table: 'ga_apply',
            json_p: option,
            sorts: '-id'
        }, function (res) {
            if (res.total) {
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        table: 'ga_spstatus',
                        json_p: { apply_id: ele.XLH },
                        sorts: 'status'
                    }, function (sp) {
                        ele.spstatus = sp.data;
                        i++;
                        if (res.data.length == i) {
                            callback(res.data)
                        }
                    })
                })
            } else {
                callback(res.data)
            }
        })
    }
    //车修审核
    var Vehicle_apply = function (option, callback) {
        W.$ajax('mysql_api/list', {
            table: 'ga_apply2',
            json_p: option,
            sorts: '-XLH'
        }, function (res) {
            if (res.total) {
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        table: 'ga_spstatus',
                        json_p: { apply2_id: ele.XLH },
                        sorts: 'status'
                    }, function (sp) {
                        ele.spstatus = sp.data;
                        i++;
                        if (res.data.length == i) {
                            callback(res.data)
                        }
                    })
                })
            } else {
                callback(res.data)
            }
        })
    }
    //审核排序
    var auditBubble = function (array) {
        if (Object.prototype.toString.call(array).slice(8, -1) === 'Array') {
            var len = array.length, temp;
            for (var i = 0; i < len - 1; i++) {
                for (var j = len - 1; j >= i; j--) {
                    var cre = array[j].cre_tm || ~~(new Date(array[j].SQSJ).getTime() / 1000);
                    var cre1 = array[j - 1] ? array[j - 1].cre_tm || ~~(new Date(array[j - 1].SQSJ).getTime() / 1000) : array[j - 1];

                    if (cre > cre1) {
                        temp = array[j];
                        array[j] = array[j - 1];
                        array[j - 1] = temp;
                    }
                }
            }
            return array;
        } else {
            return 'array is not an Array!';
        }
    }

    //我未审核的列表
    function My_auditing_list() {
        all_auditing = []; //清空
        var option = { STATE: 1 };
        var option2 = {
            is_sh: 1,
            sp_status: 1
        };
        if (_user1.employee.role == 13) {
            option.DQLC = 6;
            option2.estatus = 6

        } else if (_user1.employee.role == 12) { //科所队和警务保障室
            if (_user1.employee.rolename == '警务保障室领导') {
                option.DQLC = 4;
                option2.estatus = 4
            } else {
                option.DEPT = _user1.employee.departId
                option.DQLC = 2;
                option2.depart = _user1.employee.departId
                option2.estatus = 2
            }
        }
        if (_user1.employee.isInCharge) { //专管员
            option.DQLC = 3;
        }

        if (_user1.employee.role == 12 || _user1.employee.role == 13 || _user1.employee.isInCharge) {
            use_apply(option2, function (res) {
                console.log(res, 'res')
                Vehicle_apply(option, function (res1) {
                    all_auditing = all_auditing.concat(res, res1);
                    // debugger;
                    console.log(all_auditing, 'auditing')
                    all_auditing = auditBubble(all_auditing)
                    // console.log(all_auditing)
                    show_auditing_list(all_auditing)
                })
            })
        }
    }

    //未审核显示列表
    var show_auditing_list = function (data) {
        $('#_auditing').empty();
        data.forEach(ele => {
            if (ele.id) {
                var _href = './my_list?applyid=' + ele.id + '&auditing=' + true;
                var applystatus = ele.spstatus[0] ? ele.spstatus[0].sp_status : 5
                var name = ele.name
                var use_status = '';
                use_status = sp_status[ele.sp_status || 6]
                // var color_status = '';
                // debugger;
                // applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                // applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                    <span style="vertical-align: middle">${name}用车</span>
                                    <span class="weui-badge great chang_f12" style="margin-left: 5px;">${use_status}</span>
                                </h4>
                                <div class="weui-flex__item t_a_r" style="flex:2">${date}</div>
                            </div>
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">事由</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.days || ''}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>`
                $('#_auditing').append(str_content);
            }
            if (ele.XLH) {
                var _href = './fix_detail?applyid=' + ele.XLH + '&auditing=true';
                name = ele.SQR + '的车修'
                var use_status = app_state[ele.STATE];
                var color_status = '';
                // ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                // if (level_show) {
                var str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                    <span style="vertical-align: middle">${name}</span>
                                    <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                </h4>
                                <div class="weui-flex__item t_a_r" style="flex:2">${W.dateToString(W.date(ele.SQSJ))}</div>
                            </div>
                            <div class="weui-flex ">
                                <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">号码号牌</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.HPHM}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">预计金额</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.YJJED}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </a>`
                $('#_auditing').append(str_content);
            }
        })
    }




    //我已审核列表
    function My_audited_list() {
        var option = { uid: _user1.user.objectId, sp_status: '0|4|5|6' }
        audit_arr(option, 1)
    }
    function audit_arr(option, type) {
        W.$ajax('/mysql_api/list', {
            json_p: option,
            table: 'ga_spstatus',
            sorts: '-cre_tm',
            limit: pageSize,
            pageno: currentPage
        }, function (res) {
            console.log(res, 'sps')
            var i = 0;
            res.data.forEach((ele, index) => {
                if (ele.apply_id) {
                    W.$ajax('/mysql_api/list', {
                        table: 'ga_apply',
                        json_p: { id: ele.apply_id },
                    }, function (app) {
                        ele.apply = app.data;
                        if (app.data[0]) {
                            W.$ajax('/mysql_api/list', {
                                table: 'ga_spstatus',
                                json_p: {
                                    apply_id: app.data[0].id
                                }
                            }, function (sps) {
                                i++;
                                ele.spstatus = sps.data;
                                if (i == res.data.length) {
                                    audit_list(res, type)
                                }
                            })
                        } else {
                            i++;
                            if (i == res.data.length) {
                                audit_list(res, type)
                            }
                        }
                    })
                } else {
                    W.$ajax('/mysql_api/list', {
                        table: 'ga_apply2',
                        json_p: { XLH: ele.apply2_id },
                        sorts: 'XLH'
                    }, function (app) {
                        ele.apply2 = app.data;
                        if (app.data[0]) {
                            W.$ajax('/mysql_api/list', {
                                table: 'ga_spstatus',
                                json_p: {
                                    apply2_id: app.data[0].XLH
                                }
                            }, function (sps) {
                                i++;
                                ele.spstatus = sps.data;
                                if (i == res.data.length) {
                                    audit_list(res, type)
                                }
                            })
                        } else {
                            i++;
                            if (i == res.data.length) {
                                audit_list(res, type)
                            }
                        }
                    })
                }
            })
        })
    }

    //筛选审核列表
    function audit_list(res, type) {
        console.log(res, 'res')
        if (res.data.length < pageSize) {
            show_more = false;
        } else {
            show_more = true;
        }
        var audited = [];
        if (type == 1) {
            audited = res.data;
        }
        if (_tab1 == 1) {
            w_audited = w_audited.concat(audited);
            _show_audit_list(w_audited, 1)
        }
    }

    //显示已审核列表
    function _show_audit_list(res, type) {
        debugger;
        console.log(res)
        type == 1 ? $('#_audited').empty() : $('#_auditing').empty();
        let name = '';
        res.forEach((ele, index) => {
            if (ele.apply) {
                var _href = './my_list?applyid=' + ele.apply_id;
                type == 1 ? _href += '&audited=true' : _href += '&auditing=true';
                name = ele.apply[0].name + '的用车'
                var _status = 0;
                var applystatus = ele.spstatus[0].sp_status;

                var use_status = '';
                var color_status = '';

                use_status = sp_status[ele.sp_status || 6]

                // applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;

                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))

                let str_content = ` 
                        <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                            <div class="f14 w_100">
                                <div class="weui-media-box weui-media-box_text">
                                    <div class="weui-flex">
                                        <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                            <span style="vertical-align: middle">${name}</span>
                                            <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                        </h4>
                                        <div class="weui-flex__item t_a_r">${date}</div>
                                    </div>
                
                                    <div class="weui-flex ">
                                        <div class="weui-flex__item">
                                            <div class="weui-cell p_0">
                                                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                    <p class="c_9">事由</p>
                                                </div>
                                                <div class="weui-cell__bd">
                                                    <p>${ele.apply[0].days}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">车牌号码</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.apply[0].car_num || '空'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </a>`
                type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)

            }
            if (ele.apply2) {
                let _href = './fix_detail?applyid=' + ele.apply2_id;
                type == 1 ? _href += '&audited=true' : _href += '&auditing=true';
                name = ele.apply2[0].SQR + '的车修'

                let use_status = app_state[ele.apply2[0].STATE];
                let color_status = '';

                ele.apply2[0].STATE == 1 ? color_status = '' : ele.apply2[0].STATE == 4 ? color_status = 'no_agree' : ele.apply2[0].STATE == 0 ? color_status = 'back' : color_status = 'auditing';

                let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100">
                            <div class="weui-media-box weui-media-box_text">
                                <div class="weui-flex">
                                    <h4 class=" weui-flex__item weui-media-box__title f_w_7" style="flex:3">
                                        <span style="vertical-align: middle">${name}</span>
                                        <span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;">${use_status}</span>
                                    </h4>
                                    <div class="weui-flex__item t_a_r" style="flex:2">${W.dateToString(W.date(ele.apply2[0].SQSJ))}</div>
                                </div>
                                <div class="weui-flex ">
                                    <div class="weui-flex__item">
                                        <div class="weui-cell p_0">
                                            <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                                <p class="c_9">号码号牌</p>
                                            </div>
                                            <div class="weui-cell__bd">
                                                <p>${ele.apply2[0].HPHM}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="weui-flex__item">
                                    <div class="weui-cell p_0">
                                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                            <p class="c_9">预计金额</p>
                                        </div>
                                        <div class="weui-cell__bd">
                                            <p>${ele.apply2[0].YJJED}</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </a>`
                type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
            }

        })
        let more_content = `
                <a class="weui-cell weui-cell_access" href="javascript:;" id="changeCPage">
                    <div class="f14 w_100">
                        <div class="t_a_c">
                            更多···
                        </div>
                    </div>
                </a> `;

        if (show_more) {
            type == 1 ? $('#_audited').append(more_content) : $('#_auditing').append(more_content)
        }
        $("#changeCPage").on('click', function () {
            console.log(currentPage);
            currentPage++;
            if (_tab1 == 0) {
                My_auditing_list();
            }
        })
    }




})