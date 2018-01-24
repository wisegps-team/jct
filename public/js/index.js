
$(document).ready(function () {


    var beta = function () {
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
                            weui.alert('还未登录',function(){
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
    }

    beta();
































    var beta1 = function () {
        console.log(defalut)
        var _tab = 0;
        var _tab1 = 0;
        var _tab2 = 0;
        _tab = sessionStorage.getItem('tab') || 0;
        _tab1 = sessionStorage.getItem('tab1') || 0;
        _tab2 = sessionStorage.getItem('tab2') || 0;
        _tab3 = sessionStorage.getItem('tab3') || 0;

        var userid = W.getCookie('userid');
        var _user = {};
        var _user1 = {};
        var currentPage = 1,
            pageSize = 10;

        // var all
        // var app_state = {
        //     0: '撤销',
        //     1: '审批中',
        //     4: '审批驳回',
        //     5: '待报销',
        //     6: '已结束'
        // }
        var app_state = {
            0: '撤销',
            1: '审批中',
            3: '明细录入',
            4: '审批驳回',
            5: '待报销',
            6: '已结束'
        }

        var sp_status = {
            0: '撤销',
            1: '审批中',
            4: '审批驳回',
            5: '已通过',
            6: '已还车'
        }

        var role = {
            9: '普通成员',
            12: '部门领导',
            13: '公司领导'

        }
        var w_audited = [],
            w_auditing = [],
            w_commit = [],
            show_more = true;

        var all_audits = [];
        var all_apply = [];

        // $('#use_car').on('click', function () {
        //     top.location = './apply'
        // })



        $.ajax({
            url: '/login',
            data: { password: hex_md5('123456') },
            success: function (res) {
                W.setCookie('dev_key', res.wistorm.dev_key);
                W.setCookie('app_key', res.wistorm.app_key);
                W.setCookie('app_secret', res.wistorm.app_secret);
                W.setCookie('auth_code', res.access_token);
                wistorm_api.getUserList({ username: userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                    _user1.user = json.data[0];
                    wistorm_api._list('employee', { uid: _user1.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                        _user1.employee = emp.data[0];
                        if (emp.data[0]) {
                            if (emp.data[0].roleId) {
                                wistorm_api._list('role', { objectId: emp.data[0].roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                    // console.log(roles)
                                    _user1.employee.rolename = roles.data[0] ? roles.data[0].name : null;
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
                })
            }
        })

        function mainContral(res) {
            console.log(res, '_user')
            localStorage.setItem('user', JSON.stringify(res));
            if (_tab == 2) { //提交列表
                if (_tab3 == 0) {
                    My_push_list()
                } else {
                    repair_history()
                }
            } else if (_tab == 1) { //审核列表
                if (_tab1 == 0) { //未审核
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
                    w_auditing = [];
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

        //查询结果
        function submmit(json, table, sorts, selector) {
            W.$ajax('/mysql_api/list', {
                json_p: json,
                table: table,
                sorts: sorts
            }, function (app) {
                console.log(app);
                var i = 0;
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
            })
        }

        //我未审核的列表
        function My_auditing_list() {
            // var option1 = {DEPT:_user.}
            var option = { STATE: 1 };
            var option2 = {
                is_sh: 1,
                status: 1
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
            if (_user.employee.isInCharge) { //专管员
                option.DQLC = 3;
            }
            W.$ajax('mysql_api/list', {
                table: 'ga_apply',
                json_p: option2,
                sorts: '-id',
            }, function (app) {
                console.log(app);

            })
        }
        var Vehicle_apply = function (option) {
            W.$ajax('mysql_api/list', {
                table: 'ga_apply2',
                json_p: option,
                sorts: '-XLH'
            }, function (res) {
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        table: 'ga_spstatus',
                        json_p: { apply2_id: ele.XLH },
                        sorts: 'status'
                    }, function (sp) {
                        i++;
                        if (res.data.length == i) {

                        }
                    })
                })
            })
        }
        var use_apply = function (option, callback) {
            W.$ajax('mysql_api/list', {
                table: 'ga_apply',
                json_p: option,
                sorts: '-id'
            }, function (res) {
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        table: 'ga_spstatus',
                        json_p: { apply_id: ele.XLH },
                        sorts: 'status'
                    }, function (sp) {
                        i++;
                        if (res.data.length == i) {
                            callback()
                        }
                    })
                })
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
                                        // console.log(res, 'auditresarr');
                                        audit_list(res, type)
                                    }
                                })
                            } else {
                                i++;
                                if (i == res.data.length) {
                                    // console.log(res, 'auditresarr');
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
                                    // console.log(sps)
                                    i++;
                                    ele.spstatus = sps.data;
                                    // console.log(res, 'auditresarr')
                                    if (i == res.data.length) {
                                        // console.log(res, 'auditresarr');
                                        audit_list(res, type)
                                    }
                                })
                            } else {
                                i++;
                                if (i == res.data.length) {
                                    // console.log(res, 'auditresarr');
                                    audit_list(res, type)
                                }
                            }
                        })
                    }
                })
            })
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
        // function vehicle_return1() {
        //     wistorm_api._list('vehicle', { status: 1, departId: _user1.depart.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
        //         var i = 0;
        //         veh.data.forEach(ele => {
        //             W.$ajax('/mysql_api/list', {
        //                 json_p: { car_num: ele.name, estatus: 8 },
        //                 table: 'ga_apply',
        //                 sorts: '-id'
        //             }, function (app) {
        //                 console.log(app);
        //                 // var i = 0;
        //                 ele.apply = app.data[0]
        //                 if (app.data[0]) {
        //                     app.data.forEach(eles => {
        //                         // var id = ele.id || ele.XLH;
        //                         var json = {}
        //                         if (eles.id) {
        //                             json = { apply_id: eles.id }
        //                         } else if (eles.XLH) {
        //                             json = { apply2_id: eles.XLH }
        //                         }
        //                         W.$ajax('/mysql_api/list', {
        //                             json_p: json,
        //                             table: 'ga_spstatus'
        //                         }, function (sps) {
        //                             i++
        //                             ele.apply.spstatus = sps.data
        //                             if (i == veh.data.length) {
        //                                 show_dispatch(veh.data, '#ss11')
        //                             }
        //                         })
        //                     })
        //                 } else {
        //                     i++
        //                     if (i == veh.data.length) {
        //                         show_dispatch(veh.data, '#ss11')
        //                     }
        //                 }

        //             })
        //         })
        //     })

        // }


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
                        var applystatus = ele.spstatus[0] ? ele.spstatus[0].sp_status : 5
                        let name = ele.name
                        console.log(index)
                        let use_status = '';
                        let color_status = '';
                        applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                        applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
                        let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                        let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100">
                            <div class="weui-media-box weui-media-box_text">
                                <div class="weui-flex">
                                    <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                        <span style="vertical-align: middle">${name}用车</span>
                                        <span class="weui-badge great ${color_status}  chang_f12" style="margin-left: 5px;">${use_status}</span>
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

        function own_List(res) {
            console.log(res)
            all_apply = res;
            $('#own_list').empty();
            res = res || [];
            if (res.length) {
                res.forEach((ele, index) => {
                    if (ele.id) {
                        let _href = './my_list?applyid=' + ele.id + '&my=' + true;
                        // let _status = 0;
                        var applystatus = ele.spstatus[0] ? ele.spstatus[0].sp_status : 5
                        let name = ele.name
                        console.log(index)
                        let use_status = '';
                        let color_status = '';
                        applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                        applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;
                        let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                        let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                        <div class="f14 w_100">
                            <div class="weui-media-box weui-media-box_text">
                                <div class="weui-flex">
                                    <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                        <span style="vertical-align: middle">${name}用车</span>
                                        <span class="weui-badge great ${color_status}  chang_f12" style="margin-left: 5px;">${use_status}</span>
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
                                                <p>${ele.days}</p>
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
                        let _href = './fix_detail?applyid=' + ele.XLH + '&my=true';
                        name = ele.SQR + '的车修'
                        let use_status = app_state[ele.STATE];
                        let color_status = '';
                        ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
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


        //筛选审核列表
        function audit_list(res, type) {
            console.log(res, 'res')
            if (res.data.length < pageSize) {
                show_more = false;
            } else {
                show_more = true;
            }
            var audited = [];
            var auditing = [];
            if (type == 1) {
                audited = res.data;
            } else if (type == 2) {
                auditing = res.data;
            }
            if (_tab1 == 1) {
                w_audited = w_audited.concat(audited);
                showAudit(w_audited, 1)
            } else {
                w_auditing = w_auditing.concat(auditing);
                showAudit(w_auditing, 2)
            }

        }


        function showAudit(data, type) {
            console.log(data, type)
            _show_audit_list(data, type)
            // own_List(data)
        }

        function _show_audit_list(res, type) {
            console.log(res)
            type == 1 ? $('#_audited').empty() : $('#_auditing').empty();
            let name = '';
            let level_show = false;
            res.forEach((ele, index) => {
                if (ele.apply) {
                    let _href = './my_list?applyid=' + ele.id;
                    type == 1 ? _href += '&audited=true' : _href += '&auditing=true';
                    name = ele.apply[0].name + '的用车'
                    let _status = 0;
                    var applystatus = ele.spstatus[0].sp_status;

                    let use_status = '';
                    let color_status = '';

                    applystatus == 5 ? use_status = '已通过' : applystatus == 6 ? use_status = '已还车' : applystatus == 4 ? use_status = '驳回' : applystatus == 0 ? use_status = '已撤销' : applystatus == 1 ? use_status = '审核中' : null;
                    applystatus == 5 ? color_status = '' : applystatus == 6 ? color_status = '' : applystatus == 4 ? color_status = 'no_agree' : applystatus == 0 ? color_status = 'back' : applystatus == 1 ? color_status = 'auditing' : null;

                    let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                    if (level_show) {
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
                }
                if (ele.apply2) {
                    let _href = './fix_detail?applyid=' + ele.apply2_id;
                    type == 1 ? _href += '&audited=true' : _href += '&auditing=true';
                    name = ele.apply2[0].SQR + '的车修'
                    // let _status = 0;
                    // console.log(index)
                    if (ele.spstatus.length == 1) {
                        if (_user1.employee.role == '12') {
                            level_show = true;
                        }
                    } else if (ele.spstatus.length == 2) {
                        if (_user1.employee.role == '12') {
                            level_show = true;
                        } else if (_user1.employee.role == '12' && _user1.depart.name == '警务保障室') {
                            if (ele.spstatus[0].isagree == 1) {
                                level_show = true
                            }
                        }
                    } else if (ele.spstatus.length == 3) {
                        if (_user1.employee.role == '12') {
                            level_show = true;
                        } else if (_user1.employee.role == '12') {
                            if (ele.spstatus[0].isagree == 1) {
                                level_show = true
                            }
                        } else if (_user1.employee.role == '13') {
                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                                level_show = true
                            }
                        }
                    } else if (ele.spstatus.length == 4) {
                        if (_user1.employee.role == '12') {
                            level_show = true;
                        } else if (_user1.employee.role == '12' && _user1.depart.name == "警务保障室") {
                            if (ele.spstatus[0].isagree == 1) {
                                level_show = true
                            }
                        } else if (_user1.employee.role == '9' && _user1.employee.isInCharge) {
                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                                level_show = true
                            }
                        }
                        else if (_user1.employee.role == '13') {
                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[3].isagree == 1) {
                                level_show = true
                            }
                        }
                    }
                    let use_status = app_state[ele.apply2[0].STATE];
                    let color_status = '';
                    // _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                    ele.apply2[0].STATE == 1 ? color_status = '' : ele.apply2[0].STATE == 4 ? color_status = 'no_agree' : ele.apply2[0].STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                    // if (_user.user.role == '管理员') {
                    //     level_show = true;
                    // }
                    // let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                    if (level_show) {
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
                        // $('#own_list').append(str_content);
                        type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                    }
                }

            })
            let more_content = `
            <a class="weui-cell weui-cell_access" href="javascript:;" id="changeCPage">
            <div class="f14 w_100">
                <div class="t_a_c">
                    更多···
                </div>
            </div>
        </a>
        `;

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

















































        // $.ajax({ url: '/login', data: { password: hex_md5(hex_md5(123456)}, success: function (res) { console.log(res, 'res') } })
        // var auth_code = '5753fe38833fb41b72b005d86211aa80492dd737a55b086e4ecec96451e0be1b6d6e9013e9cdf82c495a3dbb8f07e356'

        // wistorm_api.getUserList({ username: userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, auth_code, function (json) { console.log(json) })
        // console.log(wistorm_api)



        // var _user = null;
        function test() {
            function getJson(url, callback, option, type) {
                var types = type ? type : 'get';
                var option = Object.assign({}, option ? option : {})
                $.ajax({
                    url: url,
                    dataType: 'json',
                    data: option,
                    timeout: 100000,
                    type: types,
                    success: callback,
                    error: function (err) { },
                })
            }


            W.$ajax('/mysql_api/list', {
                json_p: { userid: userid },
                table: 'ga_user'
            }, function (us) {
                // console.log(us, 'list')
                _user.user = us.data[0];
                var _depart = us.data[0].depart
                W.$ajax('/mysql_api/list', {
                    json_p: { id: _depart },
                    table: 'ga_depart'
                }, function (de) {
                    // console.log(de, 'ress')
                    _user.depart = de.data[0];
                    MY_User(_user)
                })
            })



            // getJson('/get_user', MY_User, { userid: userid })
            function MY_User(res) {
                console.log(res, 'dfdfdf')

                localStorage.setItem('user', JSON.stringify(res));
                // window._user = res;
                _user = res;
                getJson('/search_audit_list', search, { uid: _user.user.id })

                // getJson('/search_apply', search2, { uid: _user.user.id, depart: _user.depart.id })

                if (_tab == 2) { //提交列表
                    getMyList()
                } else if (_tab == 1) { //审核列表
                    if (_tab1 == 0) { //未审核
                        get_no_auditList()
                    } else if (_tab1 == 1) { //已审核
                        getauditlist()
                    }
                } else if (_tab == 3) { //车队列表
                    if (_tab2 == 1) {
                        getdriver()
                    } else if (_tab2 == 0) {
                        back_car()
                    }

                }
                if (_user.user.role == '管理员') {
                    $('#show_back').show()
                }
            }

            // getJson('/get_left', get_car)
            // function get_car(res){
            //     console.log(res)
            // }
            // localStorage.setItem()


            weui.tab('#tab', {
                defaultIndex: _tab,
                onChange: function (index) {
                    sessionStorage.setItem('tab', index);
                    console.log(index, 1);
                    _tab = index;
                    currentPage = 0;
                    if (index == 2) {
                        getMyList()
                    } else if (index == 1) {
                        if (_tab1 == 0) {
                            get_no_auditList()
                        } else if (_tab1 == 1) {
                            getauditlist()
                        }

                    } else if (index == 3) {
                        if (_tab2 == 1) {
                            getdriver()
                        } else {
                            back_car()
                        }
                    }
                }
            });
            //提交列表
            function getMyList() {
                getJson('/get_applys', own_List, { uid: _user.user.id, depart: _user.depart.id })
            }


            //列出提交列表
            function own_List(res) {
                console.log(res)
                all_apply = res;
                $('#own_list').empty();
                res = res || [];
                if (res.length) {
                    res.forEach((ele, index) => {
                        if (ele.id) {
                            let _href = './my_list?applyid=' + ele.id + '&my=' + true;
                            let _status = 0;
                            let name = ele.name
                            console.log(index)
                            if (ele.spstatus.length == 1) {
                                if (ele.spstatus[0].isagree == 1) {
                                    _status = 1;
                                    if (ele.etm) {
                                        _status = 2;
                                    }
                                } else {
                                    _status = 0;
                                }
                                if (ele.spstatus[0].isagree == 2) {
                                    _status = 3;
                                }
                                if (!ele.spstatus[0].isagree && ele.etm > 0) {
                                    _status = 4;
                                }
                            } else if (ele.spstatus.length == 3) {

                                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                                    _status = 1;
                                    if (ele.etm) {
                                        _status = 2;
                                    }
                                } else {
                                    _status = 0;
                                }

                                if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                                    _status = 3;
                                }
                                if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                                    _status = 4;
                                }
                            }
                            let use_status = '';
                            let color_status = '';
                            _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                            _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                            let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                            let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                    <div class="f14 w_100">
                        <div class="weui-media-box weui-media-box_text">
                            <div class="weui-flex">
                                <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                    <span style="vertical-align: middle">${name}用车</span>
                                    <span class="weui-badge great ${color_status}  chang_f12" style="margin-left: 5px;">${use_status}</span>
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
                                            <p>${ele.days}</p>
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
                            let _href = './fix_detail?applyid=' + ele.XLH + '&my=true';
                            name = ele.SQR + '的车修'
                            let use_status = app_state[ele.STATE];
                            let color_status = '';
                            ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
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
                            $('#own_list').append(str_content);
                            // type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                            // }
                        }


                    })
                }

            }

            //获已审核列表
            function getauditlist() {
                getJson('/audit_list', audit_list, { uid: _user.user.id, pageSize: pageSize, currentPage: currentPage })
                W.$ajax('/mysql_api/list', {
                    table: 'ga_spstatus',
                    json_p: { uid: _user.user.id, },
                    limit: 10,
                    pageno: 1,
                    sorts: 'cre_tm'
                }, function (res) {
                    console.log(res, 'statat')
                    var i = 0;
                    res.data.forEach((ele, index) => {
                        if (ele.apply_id) {
                            W.$ajax('/mysql_api/list', {
                                table: 'ga_apply',
                                json_p: { id: ele.apply_id },
                            }, function (app) {
                                ele.apply = app;
                                if (app.data[0]) {
                                    W.$ajax('/mysql_api/list', {
                                        table: 'ga_spstatus',
                                        json_p: {
                                            apply_id: app.data[0].id
                                        }
                                    }, function (sps) {
                                        i++;
                                        ele.spstatus = sps;
                                        if (i == res.data.length) {
                                            console.log(res, 'auditresarr')
                                        }
                                    })
                                } else {
                                    i++;
                                    if (i == res.data.length) {
                                        console.log(res, 'auditresarr')
                                    }
                                }
                            })
                        } else {
                            W.$ajax('/mysql_api/list', {
                                table: 'ga_apply2',
                                json_p: { XLH: ele.apply2_id },
                                sorts: 'XLH'
                            }, function (app) {
                                ele.apply = app;
                                if (app.data[0]) {
                                    W.$ajax('/mysql_api/list', {
                                        table: 'ga_spstatus',
                                        json_p: {
                                            apply2_id: app.data[0].XLH
                                        }
                                    }, function (sps) {
                                        // console.log(sps)
                                        i++;
                                        ele.spstatus = sps;
                                        // console.log(res, 'auditresarr')
                                        if (i == res.data.length) {
                                            console.log(res, 'auditresarr')
                                        }
                                    })
                                } else {
                                    i++;
                                    if (i == res.data.length) {
                                        console.log(res, 'auditresarr')
                                    }
                                }
                            })
                        }
                    })
                })
            }
            //未审核
            function get_no_auditList() {
                getJson('/no_audit_list', audit_list, { uid: _user.user.id, pageSize: pageSize, currentPage: currentPage })
            }
            //筛选审核列表
            function audit_list(res) {
                // console.log(res)
                if (res.length < pageSize) {
                    show_more = false;
                } else {
                    show_more = true;
                }
                let audited = [];
                let auditing = [];
                res.forEach((ele, index) => {
                    if (ele.isagree) {
                        audited.push(ele)
                    } else {
                        // if(ele.STATE == 1){
                        if (ele.sp_status == 1) {
                            auditing.push(ele)
                        }

                        // }else {
                        // audited.push(ele) 
                        // }

                    }
                })
                if (_tab1 == 1) {
                    w_audited = w_audited.concat(audited);
                    showAudit(w_audited, 1)
                } else {
                    w_audited = w_auditing.concat(auditing);
                    showAudit(w_audited, 2)
                }

            }


            function showAudit(data, type) {
                console.log(data, type)
                _show_audit_list(data, type)
                // own_List(data)
            }

            function _show_audit_list(res, type) {
                console.log(res)
                type == 1 ? $('#_audited').empty() : $('#_auditing').empty();
                let name = '';
                let level_show = false;
                res.forEach((ele, index) => {
                    if (ele.id) {
                        let _href = './my_list?applyid=' + ele.id;
                        name = ele.name + '的用车'
                        let _status = 0;
                        // console.log(index)
                        if (ele.spstatus.length == 1) {
                            if (ele.spstatus[0].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }
                            if (ele.spstatus[0].isagree == 2) {
                                _status = 3;
                            }
                            if (!ele.spstatus[0].isagree && ele.etm > 0) {
                                _status = 4;
                            }
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            }
                        } else if (ele.spstatus.length == 3) {
                            // if (ele.spstatus[0].isagree || ele.spstatus[1].isagree || ele.spstatus[2].isagree && ele.etm > 0) {
                            //     _status = 4;
                            // }
                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }

                            if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                                _status = 3;
                            }
                            if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                                _status = 4;
                            }
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            } else if (_user.user.role == '警务保障室领导') {
                                if (ele.spstatus[0].isagree == 1) {
                                    level_show = true
                                }
                            } else if (_user.user.role == '局领导') {
                                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                                    level_show = true
                                }
                            }
                        }
                        let use_status = '';
                        let color_status = '';
                        _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                        _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                        if (_user.user.role == '管理员') {
                            level_show = true;
                        }
                        let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                        if (level_show) {
                            let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
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
                                            <p>${ele.days}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="weui-flex__item">
                                <div class="weui-cell p_0">
                                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                                        <p class="c_9">车牌号码</p>
                                    </div>
                                    <div class="weui-cell__bd">
                                        <p>${ele.car_num || '空'}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </a>`
                            // $('#own_list').append(str_content);
                            type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                        }
                    }
                    if (ele.XLH) {
                        let _href = './fix_detail?applyid=' + ele.XLH;
                        name = ele.SQR + '的车修'
                        // let _status = 0;
                        // console.log(index)
                        if (ele.spstatus.length == 1) {
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            }
                        } else if (ele.spstatus.length == 2) {
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            } else if (_user.user.role == '警务保障室领导') {
                                if (ele.spstatus[0].isagree == 1) {
                                    level_show = true
                                }
                            }
                        } else if (ele.spstatus.length == 3) {
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            } else if (_user.user.role == '警务保障室领导') {
                                if (ele.spstatus[0].isagree == 1) {
                                    level_show = true
                                }
                            } else if (_user.user.role == '局领导') {
                                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                                    level_show = true
                                }
                            }
                        } else if (ele.spstatus.length == 4) {
                            if (_user.user.role == '科所队领导') {
                                level_show = true;
                            } else if (_user.user.role == '警务保障室领导') {
                                if (ele.spstatus[0].isagree == 1) {
                                    level_show = true
                                }
                            } else if (_user.user.role == '专管员') {
                                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1) {
                                    level_show = true
                                }
                            }
                            else if (_user.user.role == '局领导') {
                                if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[3].isagree == 1) {
                                    level_show = true
                                }
                            }
                        }
                        let use_status = app_state[ele.STATE];
                        let color_status = '';
                        // _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                        ele.STATE == 1 ? color_status = '' : ele.STATE == 4 ? color_status = 'no_agree' : ele.STATE == 0 ? color_status = 'back' : color_status = 'auditing';
                        // if (_user.user.role == '管理员') {
                        //     level_show = true;
                        // }
                        // let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))
                        if (level_show) {
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
                            // $('#own_list').append(str_content);
                            type == 1 ? $('#_audited').append(str_content) : $('#_auditing').append(str_content)
                        }
                    }

                })
                let more_content = `
                <a class="weui-cell weui-cell_access" href="javascript:;" id="changeCPage">
                <div class="f14 w_100">
                    <div class="t_a_c">
                        更多···
                    </div>
                </div>
            </a>
            `;

                if (show_more) {
                    type == 1 ? $('#_audited').append(more_content) : $('#_auditing').append(more_content)
                }
                $("#changeCPage").on('click', function () {
                    console.log(currentPage);
                    currentPage++;
                    if (_tab1 == 1) {
                        getauditlist();
                    }
                })
            }



            weui.searchBar('#my_list #searchBar');
            weui.searchBar('#audit_list #searchBar1');

            //tab切换
            function tab(selector) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var $eles = $(selector);
                // console.log($eles);
                console.log((0, $)(selector))

                var $eles = $(selector);
                options = $.extend({
                    defaultIndex: 0,
                    onChange: $.noop
                }, options);
                console.log(options)
                $eles.forEach(function (ele) {
                    var $tab = $(ele);
                    console.log($tab)
                    var $tabItems = $tab.find('.weui-navbar__item1, .weui-tabbar__item1');
                    console.log($tabItems)
                    var $tabContents = $tab.find('.weui-tab__content1');
                    console.log($tabContents)

                    $tabItems.eq(options.defaultIndex).addClass('weui-bar__item_on');
                    $tabContents.eq(options.defaultIndex).show();

                    $tabItems.on('click', function () {
                        var $this = $(this),
                            index = $this.index();

                        $tabItems.removeClass('weui-bar__item_on');
                        $this.addClass('weui-bar__item_on');

                        $tabContents.hide();
                        $tabContents.eq(index).show();

                        options.onChange.call(this, index);
                    });
                });
            }

            //审核已处理和未处理
            tab('#tab1', {
                defaultIndex: _tab1,
                onChange: function (index) {
                    console.log(index, 'index')
                    sessionStorage.setItem('tab1', index);
                    _tab1 = index;
                    currentPage = 0;
                    if (index == 0) {
                        w_auditing = [];
                        get_no_auditList();
                    } else if (index == 1) {
                        w_audited = [];
                        getauditlist();
                    }

                }
            });

            $('#use_car').on('click', function () {
                top.location = './apply'
            })



            //车队还车
            // if(_user.use)
            // function back_car() {
            //     getJson('/getcar_num', showcarlist, { depart: 58 })
            // }

            // function getdriver() {
            //     getJson('/getdriver', showcarlist1)
            // }

            function tab1(selector) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var $eles = $(selector);
                // console.log($eles);
                console.log((0, $)(selector))

                var $eles = $(selector);
                options = $.extend({
                    defaultIndex: 0,
                    onChange: $.noop
                }, options);
                console.log(options)
                $eles.forEach(function (ele) {
                    var $tab = $(ele);
                    console.log($tab)
                    var $tabItems = $tab.find('.weui-navbar__item2, .weui-tabbar__item2');
                    console.log($tabItems)
                    var $tabContents = $tab.find('.weui-tab__content2');
                    console.log($tabContents)

                    $tabItems.eq(options.defaultIndex).addClass('weui-bar__item_on');
                    $tabContents.eq(options.defaultIndex).show();

                    $tabItems.on('click', function () {
                        var $this = $(this),
                            index = $this.index();

                        $tabItems.removeClass('weui-bar__item_on');
                        $this.addClass('weui-bar__item_on');

                        $tabContents.hide();
                        $tabContents.eq(index).show();

                        options.onChange.call(this, index);
                    });
                });
            }
            tab1('#tab2', {
                defaultIndex: _tab2,
                onChange: function (index) {
                    console.log(index)
                    _tab2 = index;
                    sessionStorage.setItem('tab2', index);
                    if (index == 1) {
                        getdriver()
                    } else {
                        back_car()
                    }
                }
            });

            function showcarlist(res) {
                console.log(res);
                $('#ss11').empty();
                res.forEach((ele, index) => {
                    if (ele.id) {
                        let _href = './my_list?applyid=' + ele.id;
                        let _status = 0;
                        console.log(index)
                        if (ele.spstatus.length == 1) {
                            if (ele.spstatus[0].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }
                            if (ele.spstatus[0].isagree == 2) {
                                _status = 3;
                            }
                            if (!ele.spstatus[0].isagree && ele.etm > 0) {
                                _status = 4;
                            }
                        } else if (ele.spstatus.length == 3) {

                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }

                            if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                                _status = 3;
                            }
                            if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                                _status = 4;
                            }
                        }
                        let use_status = '';
                        let color_status = '';
                        _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                        _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                        let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000));
                        let name = ele.name
                        let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                <div class="f14 w_100">
                    <div class="weui-media-box weui-media-box_text">
                        <div class="weui-flex">
                            <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                <span style="vertical-align: middle">${name}的用车</span>
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
                                        <p>${ele.days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>`
                        $('#ss11').append(str_content);
                    }

                })


            }

            function showcarlist1(res) {
                console.log(res);
                $('#ss22').empty();
                res.forEach((ele, index) => {
                    if (ele.id) {
                        let _href = './my_list?applyid=' + ele.id;
                        let _status = 0;
                        console.log(index)
                        if (ele.spstatus.length == 1) {
                            if (ele.spstatus[0].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }
                            if (ele.spstatus[0].isagree == 2) {
                                _status = 3;
                            }
                            if (!ele.spstatus[0].isagree && ele.etm > 0) {
                                _status = 4;
                            }
                        } else if (ele.spstatus.length == 3) {

                            if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                                _status = 1;
                                if (ele.etm) {
                                    _status = 2;
                                }
                            } else {
                                _status = 0;
                            }

                            if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                                _status = 3;
                            }
                            if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                                _status = 4;
                            }
                        }
                        let use_status = '';
                        let color_status = '';
                        _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                        _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                        let date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000));
                        let name = ele.name
                        let str_content = ` <a class="weui-cell weui-cell_access p_0 b_b_1" href="${_href}">
                <div class="f14 w_100">
                    <div class="weui-media-box weui-media-box_text">
                        <div class="weui-flex">
                            <h4 class=" weui-flex__item weui-media-box__title f_w_7">
                                <span style="vertical-align: middle">${name}的用车</span>
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
                                        <p>${ele.days}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </a>`
                        $('#ss22').append(str_content);
                    }

                })


            }



            $('#search_list2').on('input', function () {
                // console.log('hello')
                // console.log(this.value)
                // getJson('/search_apply', own_List, { uid: _user.user.id, search: this.value, depart: _user.depart.id })
                console.log(this.value)
                let ss = [];
                let res = this.value
                if (res) {
                    all_apply.forEach(s2 => {
                        if (s2.name) {
                            if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                                ss.push(s2)
                            }
                        } else {
                            if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                                ss.push(s2)
                            }
                        }
                    })
                } else {
                    ss = all_apply
                }

                own_List(ss)
            })


            $('#search_list1').on('input', function () {
                audit_filter(this.value)
            })
            function audit_filter(res) {
                let ss = [];
                show_more = false;
                if (!res) {
                    show_more = true;
                    w_audited = [];
                    w_auditing = []
                }
                if (_tab1 == 0) {
                    if (res) {
                        // ss = all_audits.filter(s1 => s1.isagree == 0 && (s1.name.includes(res) || s1.days.includes(res) || s1.SQR.includes(res) || s1.HPHM.includes(res) || s1.car_num.includes(res)))
                        all_audits.forEach(s2 => {
                            if (s2.isagree == 0) {
                                if (s2.name) {
                                    if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                                        ss.push(s2)
                                    }
                                } else {
                                    if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                                        ss.push(s2)
                                    }
                                }
                            }
                        })
                        showAudit(ss, 2)
                    } else {
                        get_no_auditList();
                    }

                } else if (_tab1 == 1) {
                    if (res) {
                        all_audits.forEach(s2 => {
                            if (s2.isagree > 0) {
                                if (s2.name) {
                                    if (s2.name.includes(res) || s2.days.includes(res) || s2.car_num.includes(res)) {
                                        ss.push(s2)
                                    }
                                } else {
                                    if (s2.SQR.includes(res) || s2.HPHM.includes(res)) {
                                        ss.push(s2)
                                    }
                                }
                            }
                        })
                        // ss = all_audits.filter(s2 => s2.isagree > 0 && (s2.name.includes(res) || s2.days.includes(res) || s2.SQR.includes(res) || s2.HPHM.includes(res) || s2.car_num.includes(res)))
                        showAudit(ss, 1)

                    } else {
                        // show_more = true
                        getauditlist()
                    }

                }

            }
            function search(res) {
                // console.log(res)
                res = res.filter(ele => ele.name || ele.SQR)
                console.log(res)
                all_audits = res;
            }

            function search2(res) {
                all_apply = res;
            }
        }
    }


})