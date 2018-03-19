$(document).ready(function () {
    // console.log(W.getSearch())

    var _g = W.getSearch();
    var _user = JSON.parse(sessionStorage.getItem('user'));
    var vehicleCaptain = null;
    var sendname = null;
    var senduserid = null;
    var driver = '';
    var driver_tel = '';
    var driver_message = {};
    var name_tel = '';
    // var SQR_message = {};
    var car = '';
    var status = defalut.use.status;
    var estatus = defalut.use.estatus;
    var roles = defalut.userole;
    var role = {
        9: '普通成员',
        12: '部门领导',
        13: '公司领导'

    }
    if (_user) {
        mainContral(_user)
    } else {
        _user = {};
        if (_g.userid) {
            $.ajax({
                url: '/login',
                data: { password: hex_md5('123456') },
                success: function (res) {
                    W.setCookie('dev_key', res.wistorm.dev_key);
                    W.setCookie('app_key', res.wistorm.app_key);
                    W.setCookie('app_secret', res.wistorm.app_secret);
                    W.setCookie('auth_code', res.access_token);
                    wistorm_api.getUserList({ username: _g.userid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        if (json.data[0]) {
                            _user.user = json.data[0];
                            wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                _user.employee = emp.data[0];
                                if (emp.data[0]) {
                                    if (emp.data[0].roleId) {
                                        wistorm_api._list('role', { objectId: emp.data[0].roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                                            // console.log(roles)
                                            _user.employee.rolename = roles.data[0] ? roles.data[0].name : '';
                                            wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                                _user.depart = dep.data[0];
                                                mainContral(_user)
                                            })
                                        })
                                    } else {
                                        wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                                            _user.depart = dep.data[0];
                                            mainContral(_user)
                                        })
                                    }
                                }
                            })
                        } else {
                            top.location = '/login1'
                        }
                    })
                }
            })
        }
    }

    function mainContral(user) {
        console.log(user, 'user')
        sessionStorage.setItem('user', JSON.stringify(user));
        //获取车队队长信息
        GetVehicleCaptain(user);
        //获取申请信息
        GetApplyMessage(user);


    }

    function GetApplyMessage(user) {
        W.$ajax('mysql_api/list', {
            json_p: { id: _g.applyid },
            table: 'ga_apply'
        }, function (res) {
            wistorm_api._list('vehicle', { name: res.data[0].car_num }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (vvv) {
                res.data[0].cart = vvv.data[0];
                wistorm_api._list('department', { objectId: res.data[0].depart }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
                    res.data[0].departName = dep.data[0];
                    wistorm_api.getUserList({ objectId: res.data[0].uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        res.data[0].user = json.data[0];
                        console.log(res, 'res')
                        W.$ajax('mysql_api/list', {
                            json_p: { apply_id: res.data[0].id },
                            table: 'ga_spstatus',
                            sorts: 'status'
                        }, function (sps) {
                            var i = 0;
                            sps.data.forEach(ele => {
                                wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json1) {
                                    ele.user = json1.data[0];
                                    wistorm_api._list('employee', { uid: ele.uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp1) {
                                        i++;
                                        ele.employee = emp1.data[0]
                                        if (i == sps.data.length) {
                                            res.data[0].spstatus = sps.data;
                                            // console.log(res.data[0],'ddff')
                                            showMesssage(res.data[0])
                                        }
                                    })

                                })
                            })
                        })
                    })
                })
            })

        })
    }

    function GetSQRMessage(uid) {
        wistorm_api._list('employee', { uid: uid }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
            // return emp.data[0];
            name_tel = emp.data[0].name + '(' + emp.data[0].tel + (emp.data[0].wechat ? '(' + emp.data[0].wechat + ')' : '') + ')'
        })
    }

    function GetDriverUserName(uid) {
        wistorm_api.getUserList({ objectId: uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
            driver_message = json.data[0];
        })
    }

    function GetVehicleCaptain(user) {
        wistorm_api._list('department', { name: '车队', uid: user.employee.companyId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
            console.log(dep, 'dep')
            wistorm_api._list('employee', { departId: dep.data[0].objectId, role: '12|13' }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                console.log(emp, 'emmp')
                var i = 0;
                emp.data.forEach(ele => {
                    wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                        ele.rolename = roles.data ? roles.data[0].name : '';
                        wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                            ele.user = json.data[0];
                            i++;
                            if (i == emp.data.length) {
                                vehicleCaptain = emp.data;
                                console.log(vehicleCaptain, 'vehiclecaptaion')
                            }
                        })
                    })
                })
            })
        })
    }



    function showMesssage(data) {
        console.log(data);
        console.log(vehicleCaptain, 'vehicle')
        // var applystatus = data.spstatus[0].sp_status
        sendname = data.name
        $('#name').text(data.name)
        $('#dqlc').text(estatus[data.estatus])
        $('#address').text(data.address || '');
        $('#days').text(data.days || '');
        $('#peer').text(data.peer || '');
        $('#province').text(data.province || '');
        $('#night').text(data.night ? '是' : '否');
        $('#car_num').text(data.car_num || '');
        $('#driver').text(data.driver == 3 ? '' : data.driver);
        $('#container').show();
        var span_status = `<span class="weui-badge great  chang_f12" style="margin-left: 5px;" id="_spstatus">${status[data.sp_status || 6]}</span>`
        $('#_spstatus_1').empty();
        $('#_spstatus_1').append(span_status);
        GetSQRMessage(data.uid)
        ShowAuditer(data.spstatus); //显示审核列表
        Operation(data) //具体操作
        // debugger;
        // var use_status = '';

    }

    function ShowAuditer(data) {
        $('#auditer').empty();
        data.forEach(ele => {
            if (ele.isagree == 0) {
                senduserid = ele.user ? ele.user.username : '';
            }
            var icon = !ele.isagree ? '<i class="weui-icon-circle f14 flow_agree_icon"></i>' : ele.isagree == 1 ? '<i class="weui-icon-success f14 flow_agree_icon"></i>' : '<i class="weui-icon-cancel f14 flow_agree_icon"></i>'
            var aud = !ele.isagree ? '·审批中' : ele.isagree == 1 ? '·已通过' : '·驳回'
            var tr_content = `
                <div class="weui-flex">
                <div class="weui-flex__item">
                    <div class="weui-cell weui-cell_access p_0 ">
                        <div class="flow_agree weui-media-box_text w_100">
                            ${icon}
                            <img src="./img/1.png" class="small_img">
                            <span class="f_w_7 ">${defalut.userole[ele.status] + (ele.employee ? ele.employee.name : '') + aud}</span>
                        </div>
                    </div>
                </div>
            </div>`
            $('#auditer').append(tr_content);
        })
    }

    function showCarDriver() { //获取车队司机和车辆
        wistorm_api._list('vehicle', { departId: _user.depart.objectId }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (veh) {
            var i = 0;
            if (veh.data.length) {
                veh.data.forEach(ele => {
                    if (ele.status == 1) { //出车
                        W.$ajax('mysql_api/list', {
                            table: 'ga_apply',
                            json_p: { car_num: ele.name, etm: 0, sp_status: '5' },
                            sorts: '-id'
                        }, function (res) {
                            ele.apply = res.data[0];
                            if (res.data[0]) {
                                wistorm_api._list('employee', { name: res.data[0].name }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                                    i++;
                                    ele.driverMessage = emp.data[0];
                                    if (i == veh.data.length) {
                                        show_car(veh.data)
                                    }
                                })
                            } else {
                                i++;
                                if (i == veh.data.length) {
                                    show_car(veh.data)
                                }
                            }
                        })
                    } else {
                        i++;
                        if (i == veh.data.length) {
                            show_car(veh.data)
                        }
                    }
                })
            } else {
                show_car(veh.data)
            }

        })
        wistorm_api._list('employee', { departId: _user.depart.objectId, role: 9 }, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
            var i = 0;
            if (emp.data.length) {
                emp.data.forEach(ele => {
                    // if (ele.status == 1) { //出车
                    W.$ajax('mysql_api/list', {
                        table: 'ga_apply',
                        json_p: { driver: ele.name, etm: 0, sp_status: 5 },
                        sorts: '-id'
                    }, function (res) {
                        ele.apply = res.data[0];
                        i++;
                        if (i == emp.data.length) {
                            show_driver(emp.data)
                        }
                    })
                })
            } else {
                show_driver(emp.data)
            }
        })
        function show_car(res) {
            console.log(res, 'car')
            var car_data = [];
            // var user_car = [];
            res.forEach((ele, index) => {
                var op = {};
                if (ele.status == 1) {
                    ele.apply && ele.driverMessage ? op.label = ele.name + '(' + ele.apply.name + ele.driverMessage.tel + ')' : ele.apply ? op.label = ele.name + '(' + ele.apply.name + ')' : op.label = ele.name;
                } else {
                    op.label = ele.name
                }
                op.value = ele.objectId;
                car_data.push(op);
                // ele.status == 0 ? user_car.push(ele) : null
            })
            $('#select_car').on('click', function () {
                weui.picker(car_data, {
                    onConfirm: function (result) {
                        console.log(result)
                        car = result[0].label;
                        if (result[0].label.indexOf('(') > -1) {
                            weui.alert('该车辆已在使用');
                            return false;
                        } else {
                            $('#carss').text(result[0].label)
                        }
                    },
                    id: 'select_car'
                });
            });
        }
        function show_driver(res) {
            console.log(res, 'res')
            var driver_data = [];
            res.forEach((ele, index) => {
                var op = {};
                ele.apply ? op.label = ele.name + '(' + ele.apply.car_num + ')' : op.label = ele.name;
                // op.label = ele.name
                // op.value = ele.objectId;
                op.value = index;
                // op.value = ele.name + '(' + ele.tel + (ele.wechat ? '(' + ele.wechat + ')' : '') + ')'
                driver_data.push(op);
            })
            $('#select_driver').on('click', function () {
                weui.picker(driver_data, {
                    onConfirm: function (result) {
                        console.log(result)
                        if (result[0].label.indexOf('(') > -1) {
                            weui.alert('驾驶员正在行驶途中')
                        }
                        driver = result[0].label;
                        var _thisDriver = res[result[0].value]
                        driver_tel = _thisDriver.name + '(' + _thisDriver.tel + (_thisDriver.wechat ? '(' + _thisDriver.wechat + ')' : '') + ')'
                        GetDriverUserName(_thisDriver.uid)
                        // driver_tel = result[0].value;

                        $('#driverss').text(result[0].label)
                    },
                    id: 'select_driver'
                });
            });
        }
    }


    function Operation(data) {
        console.log(data)
        var s_status = 0;
        if (_g.my && data.sp_status == 1) {
            $('#my_button').show();
            if (data.spstatus.length) {
                if (data.spstatus[0].isagree == 0) {
                    $('#resubmit').show();
                } else {
                    $('#backout').parent().hide()
                }
            }
        }
        if (_g.auditing && data.sp_status == 1) { //审核中
            if (data.estatus == 2) {
                if (_user.employee.role == 12 && _user.employee.departId == data.depart && (!_user.employee.rolename || _user.employee.rolename == '部门领导')) {
                    s_status = 1
                    $('#other_button').show();
                }
            } else if (data.estatus == 4) {
                if (_user.employee.role == 12 && _user.employee.rolename == '警务保障室领导') {
                    s_status = 2
                    $('#other_button').show();
                }
            } else if (data.estatus == 6) {
                if (_user.employee.role == 13) {
                    s_status = 3
                    $('#other_button').show();
                }
            }
        }

        if (_g.vehiclesend && data.sp_status == 5) { //车队还车或者归还车辆
            if (data.estatus == 8) {
                $('#pcar_driver').show();
                $('#other_vehicle_send').show();
                showCarDriver()
            } else if (data.estatus == 9) {
                $('#vehicle_back').show()
            }
        }
        if (_g.my && data.sp_status == 5) { //申请人还车或者催车队还车
            if (data.estatus == 7) {
                $('#my_back_car').show()
            } else if (data.estatus == 8) {

            } else if (data.estatus == 9) {
                $('#call_vechicle_back').show();
            }
        }

        AllToast(data, s_status)






    }

    //按钮控制
    function AllToast(data, s_status) {
        console.log(data, 'toast_button');

        $('#urge').on('click', function () {  //催办
            $('#auditerTitle').text('选择审核人')
            var option1 = {};
            var type = 0;
            if (data.estatus == 2) {
                option1 = { objectId: _user.employee.departId, uid: _user.employee.companyId }
                type = 1
            } else if (data.estatus == 4) {
                option1 = { isSupportDepart: true, uid: _user.employee.companyId }
                type = 2
            } else if (data.estatus == 6) {
                option1 = { name: '局领导', uid: _user.employee.companyId }
                type = 3
            }
            getAuditers(option1, type, true)
        })

        //撤销
        $('#backout').on('click', function () {
            var etm = ~~(new Date().getTime() / 1000)
            W.$ajax('mysql_api/update', {
                json_p: { id: _g.applyid },
                update_json: { etm: etm, estatus: 0, is_sh: 2, sp_status: 0 },
                table: 'ga_apply'
            }, function (res) {
                console.log(res)
                W.$ajax('mysql_api/update', {
                    json_p: { apply_id: _g.applyid },
                    update_json: { sp_status: 0 },
                    table: 'ga_spstatus'
                }, function (u_s) {
                    console.log(u_s)
                    wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                        console.log(veh)
                        sendmessage(_g.applyid, data.user.username, sendname, '撤销成功', 1, '', function () {
                            // sendmessage(_g.applyid, data.user.username, sendname, '撤销成功', 1, function () {
                            history.go(0)
                        })
                    });
                })
            })
        })
        //同意
        $('#agree').on('click', function () {
            var apply_ujson = { is_sh: 2, sp_status: 5 };
            if (data.use_type == 3) {
                apply_ujson.estatus = 8;
            } else {
                apply_ujson.estatus = 7;
            }
            if (data.status == 1) { //一级审批
                var etm = ~~(new Date().getTime() / 1000)
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: apply_ujson,
                    table: 'ga_apply'
                }, function (res) {
                    console.log(res)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid, status: s_status },
                        update_json: { isagree: 1, sp_status: 5, uid: _user.employee.uid },
                        table: 'ga_spstatus'
                    }, function (us) {
                        debugger;
                        if (data.use_type != 3) {
                            sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                history.go(0)
                            })
                        } else {
                            var i = 0;
                            vehicleCaptain.forEach(ele => {
                                sendmessage(_g.applyid, ele.user.username, sendname, '派车申请', 3, '', function () {
                                    i++;
                                    if (vehicleCaptain.length == i) {
                                        sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                            history.go(0)
                                        })
                                    }
                                })
                            })
                        }
                    })
                })
            } else if (data.status == 3) { //三级审批
                if (_user.employee.role == 13) { //局领导
                    W.$ajax('mysql_api/update', {
                        json_p: { id: _g.applyid },
                        update_json: apply_ujson,
                        table: 'ga_apply'
                    }, function (res) {
                        W.$ajax('mysql_api/update', {
                            json_p: { apply_id: _g.applyid, status: s_status },
                            update_json: { isagree: 1, uid: _user.employee.uid },
                            table: 'ga_spstatus'
                        }, function (res1) {
                            W.$ajax('mysql_api/update', {
                                json_p: { apply_id: _g.applyid },
                                update_json: { sp_status: 5 },
                                table: 'ga_spstatus'
                            }, function (res2) {
                                debugger;
                                if (data.use_type != 3) {
                                    sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                        history.go(0)
                                    })
                                } else {
                                    var i = 0;
                                    vehicleCaptain.forEach(ele => {
                                        sendmessage(_g.applyid, ele.user.username, sendname, '派车申请', 3, '', function () {
                                            i++;
                                            if (vehicleCaptain.length == i) {
                                                sendmessage(_g.applyid, data.user.username, sendname, '审核通过', 1, '', function () {
                                                    history.go(0)
                                                })
                                            }
                                        })
                                    })
                                }
                            })
                        })
                    })

                } else if (_user.employee.role == 12) { //科所队领导
                    if (data.estatus == 2) { //警务保障室领导
                        var option1 = { isSupportDepart: true, uid: _user.employee.companyId }
                        getAuditers(option1, 2)

                    } else if (data.estatus == 4) { //局领导
                        var option1 = { name: '局领导', uid: _user.employee.companyId }
                        getAuditers(option1, 3)
                    }
                }
            }
        })
        //驳回
        $('#reject').on('click', function () {
            var etm = ~~(new Date().getTime() / 1000)
            W.$ajax('mysql_api/update', {
                json_p: { id: _g.applyid },
                update_json: { etm: etm, estatus: 0, is_sh: 2, sp_status: 4 },
                table: 'ga_apply'
            }, function (res) {
                console.log(res)
                W.$ajax('mysql_api/update', {
                    json_p: { apply_id: _g.applyid, status: s_status },
                    update_json: { isagree: 2 },
                    table: 'ga_spstatus'
                }, function (us) {
                    console.log(us)
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid },
                        update_json: { sp_status: 0, },
                        table: 'ga_spstatus'
                    }, function (u_s) {
                        console.log(u_s)
                        wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                            console.log(veh)
                            sendmessage(_g.applyid, data.user.username, sendname, '申请驳回', 1, '', function () { //通知申请人
                                history.go(0)
                            })
                        });
                    })
                })
            })
        })


        //车队还车
        $('#vehicle_back').on('click', function () {
            debugger;
            var etm = ~~(new Date().getTime() / 1000)
            W.$ajax('mysql_api/update', {
                json_p: { id: _g.applyid },
                update_json: { estatus: 'A', etm: etm, sp_status: 6 },
                table: 'ga_apply'
            }, function (res) {
                console.log(res)
                W.$ajax('mysql_api/update', {
                    json_p: { apply_id: _g.applyid },
                    update_json: { sp_status: 6 },
                    table: 'ga_spstatus'
                }, function (us) {
                    wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                        console.log(veh)
                        sendmessage(_g.applyid, data.user.username, sendname, '车队已还车', 1, '', function () { //通知申请人还车成功
                            // sendmessage(_g.applyid, vehicleCaptain.employee.user.username, sendname, '还车成功', 3, function () {
                            history.go(0)
                            // })
                        })
                    });
                })
            })

        })
        //用于我还车
        $('#backout_car').on('click', function () {
            //update apply spstatus vehicle
            var etm = ~~(new Date().getTime() / 1000)
            W.$ajax('mysql_api/update', {
                json_p: { id: _g.applyid },
                update_json: { estatus: 'A', etm: etm, sp_status: 6 },
                table: 'ga_apply'
            }, function (res) {
                console.log(res)
                W.$ajax('mysql_api/update', {
                    json_p: { apply_id: _g.applyid },
                    update_json: { sp_status: 6 },
                    table: 'ga_spstatus'
                }, function (us) {
                    wistorm_api._update('vehicle', { name: data.car_num }, { status: 0 }, W.getCookie('auth_code'), true, function (veh) {
                        console.log(veh)
                        sendmessage(_g.applyid, data.user.username, sendname, '还车成功', 1, '', function () {
                            history.go(0)
                        })
                    });
                })
            })
        })
        //派车
        $('#other_vehicle_send').on('click', function () {
            if (!driver) {
                weui.alert('请选择司机');
                return;
            }
            if (data.role != '局领导') {
                if (!car) {
                    weui.alert('车辆');
                    return;
                }
            }

            W.$ajax('mysql_api/update', {
                json_p: { id: _g.applyid },
                update_json: { driver: driver, car_num: car, estatus: 9 },
                table: 'ga_apply'
            }, function (ga) {
                wistorm_api._update('vehicle', { name: car }, { status: 1 }, W.getCookie('auth_code'), true, function (veh) {
                    driver_tel = '\n驾驶员' + driver_tel;
                    sendmessage(_g.applyid, data.user.username, sendname, '车队已派车', 1, driver_tel, function () { //发送给申请人
                        // history.go(0)
                        name_tel = '\n' + data.role + name_tel;
                        sendmessage(_g.applyid, driver_message.username, sendname, '车队派车', 1, name_tel, function () { //发送给驾驶员
                            history.go(0)
                        })
                    })
                })
            })
        })


        //通知车队还车
        $('#call_vechicle_back').on('click', function () {
            weui.alert('已通知车队还车', function () {
                console.log(vehicleCaptain)
                vehicleCaptain.forEach(ele => {
                    sendmessage(_g.applyid, ele.user.username, sendname, '还车申请', 3, '', function () {

                    })
                })
            })
        })
    }

    function getAuditers(option1, type, isagain) {
        wistorm_api._list('department', option1, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (dep) {
            var option2 = { departId: dep.data[0].objectId }
            option2.role = (type == 2 || type == 1) ? 12 : 13;
            wistorm_api._list('employee', option2, '', '', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), true, function (emp) {
                var i = 0;
                emp.data.forEach(ele => {
                    wistorm_api.getUserList({ objectId: ele.uid }, 'objectId,username,authData,createdAt', '-createdAt', '-createdAt', 0, 0, -1, W.getCookie('auth_code'), function (json) {
                        ele.user = json.data[0]
                        wistorm_api._list('role', { objectId: ele.roleId }, '', '-createdAt', '-createdAt', 0, 0, 1, -1, W.getCookie('auth_code'), false, function (roles) {
                            ele.rolename = roles.data ? roles.data[0].name : '';
                            i++;
                            if (i == emp.data.length) {
                                selectAuditer(emp.data, type, isagain)
                            }
                        })
                    })
                })
            })
        })
    }


    function selectAuditer(data, type, isagain) {
        console.log(data, type, 'dfd')
        if(type== 1){
            data = data.filter(ele => ele.rolename && ele.rolename == '部门领导')
        }else if (type == 2) {
            data = data.filter(ele => ele.rolename && ele.rolename == '警务保障室领导')
        }
        $('#nextAuditer').empty();
        var append_spstatus = {};
        var sendid = null;
        var _index = null;
        data.forEach((ele, index) => {
            var _id = 'add' + index;
            var checked = 'checked';
            // ele.responsibility.indexOf('1') > -1 ? _index = index : index == 0 ? _index = index : ''
            var tr_content = `
                    <div class="weui-cell weui-cell_access" >
                        <input type="checkbox" value=${ele.user.username} style="margin-right:5px" name='select_auditer' id=${_id} />
                        <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                            <img src="/img/1.png" style="width: 50px;display: block">
                        </div>
                        <div class="weui-cell__bd">
                            <label for=${_id}>
                                <p>${ele.name}</p>
                                <p style="font-size: 13px;color: #888888;">${ele.rolename || role[ele.role]}</p>
                            </label>
                        </div>
                    </div>
                `
            $('#nextAuditer').append(tr_content);
        })

        append_spstatus = {
            id: 0,
            isagree: 0,
            uid: '',
            cre_tm: ~~(new Date().getTime() / 1000),
            apply_id: _g.applyid,
            sp_status: 1
        }
        // type == 1 ? append_spstatus.status = 1 : type == 2 ? append_spstatus.status = 2 : type == 3 ? append_spstatus.status = 3 : null;
        // append_spstatus.status = (type == 1 ? 1 : (type == 2 ? 2 : (type == 3 ? 3 : null)))
        // sendid = data[_index].user.username;
        append_spstatus.status = type;
        if (isagain) {
            $('.weui-dialog__title').text('请选择催办人');
        } else {
            $('.weui-dialog__title').text('同意并选择下一级审核人');
        }
        $('#androidDialog1').fadeIn(200);
        $('#audit_cancle').on('click', function () {
            $('#androidDialog1').fadeOut(200);
        })
        $('#audit_commit').on('click', function () {
            if (!isagain) {
                debugger;
                console.log(append_spstatus, 'spstatus')
                var update_json = {};
                if (type == 2) {
                    update_json.estatus = 4;
                } else if (type == 3) {
                    update_json.estatus = 6;
                }
                // console.log(update_json)
                var _addauditer = $('input[name="select_auditer"]')
                var _auditer = []; //推送人id
                for (var o in _addauditer) {
                    _addauditer[o].checked ? _auditer.push(_addauditer[o].value) : null
                }
                if (!_auditer.length) {
                    weui.alert('请选择审批人')
                }
                debugger;
                W.$ajax('mysql_api/update', {
                    json_p: { id: _g.applyid },
                    update_json: update_json,
                    table: 'ga_apply'
                }, function (res) {

                    var _status = '';
                    var now = ~~(new Date().getTime() / 1000)
                    if (type == 2) {
                        _status = 1
                    } else if (type == 3) {
                        _status = 2
                    }
                    W.$ajax('mysql_api/update', {
                        json_p: { apply_id: _g.applyid, status: _status },
                        update_json: { isagree: 1, sp_tm: now, uid: _user.user.objectId },
                        table: 'ga_spstatus'
                    }, function (res1) {
                        W.$ajax('mysql_api/create', {
                            json_p: append_spstatus,
                            table: 'ga_spstatus'
                        }, function (res2) {
                            var _i = 0;
                            _auditer.forEach(ele => {
                                sendmessage(_g.applyid, ele, sendname, '', 2, '', function () {
                                    _i++;
                                    if (_i == _auditer.length) {
                                        history.go(0)
                                    }
                                })
                            })
                        })
                    })
                })
            } else { //催办
                $('#androidDialog1').fadeOut(200);
                weui.alert('已催办', function () {

                    var _addauditer = $('input[name="select_auditer"]')
                    var _auditer = []; //推送人id
                    for (var o in _addauditer) {
                        _addauditer[o].checked ? _auditer.push(_addauditer[o].value) : null
                    }
                    if (!_auditer.length) {
                        weui.alert('请选择审批人')
                    }
                    console.log(_auditer);
                    var i = 0;
                    _auditer.forEach(ele => {
                        sendmessage(_g.applyid, ele, sendname, '', 2, '', function () {
                            i++;
                            if (i == _auditer.length) {
                                history.go(0)
                            }
                        })
                    })

                })
            }
        })
    }

   
    function sendmessage(id, userid, username, title, type, tel, callback) {
        var titles = title || '用车申请'
        var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
        if (type == 1) { //提交
            str += '&my=true'
        } else if (type == 2) { //审核
            str += '&auditing=true'
        } else if (type == 3) { //车队
            str += '&vehiclesend=true'
        }
        str += '&userid=' + userid
        var _desc = username + '的用车'
        if (tel) {
            _desc += tel
        }
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            url: 'http://h5.bibibaba.cn/send_qywx.php',
            data: _op_data,
            dataType: 'jsonp',
            crossDomain: true,
            success: function (re) {
                callback()
            },
            error: function (err) {
                // console.log(err)
                callback()

            }
        })
    }





})


