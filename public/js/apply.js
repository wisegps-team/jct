$(document).ready(function () {


















    var all_depart;
    var form_option = {};
    function getJson(url, callback, option, type) {
        var types = type ? type : 'get';
        var option = Object.assign({}, option ? option : {})
        $.ajax({
            url: url,
            dataType: 'json',
            data: option,
            timeout: 10000,
            type: types,
            success: callback,
            error: function (err) { },
        })
    }

    getJson('./get_depart', my_depart)
    getJson('./address', address)

    function address(res) {
        console.log(res, 'res')
        let addr_data = [];
        let provi = [];
        let city = [];
        let addr = [];

        res.forEach((ele, index) => {
            let op = {}
            if (ele.level == 1) {
                op.label = ele.areaName;
                op.value = ele.id;
                provi.push(op);
                addr_data.push(op);
            } else if (ele.level == 2) {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId
                city.push(op);
            } else {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId;
                addr.push(op);
            }
        })

        city.forEach((ele, index) => {
            ele.children = [];
            addr.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }

            })
        })
        provi.forEach((ele, index) => {
            ele.children = [];
            city.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }
            })
        })
        console.log(provi, city, addr)
        // console.log(addr_data,'addr')
        $('#address').on('click', function () {
            weui.picker(provi, {
                    depth: 3,
                    defaultValue: [11, 177, 2164],
                    onChange: function onChange(result) {
                        console.log(result);
                    },
                    onConfirm: function onConfirm(result) {
                        // console.log(result);
                        var text = result.reduce(function (pre, current) {
                            return pre.label ? pre.label + current.label : pre + current.label
                        })
                        // console.log(text)
                        $('#address .weui-cell__ft').text(text);
                        $('#address .weui-cell__ft').css({ color: '#000' })
                    },
                    id: 'address'
                });
        });

    }
    // 本部门
    function my_depart(res) {
        // console.log(res)
        all_depart = res;
        var depart_data = [];
        res.forEach((ele, index) => {
            var op = {};
            op.label = ele.name;
            op.value = ele.id;
            depart_data.push(op)
        });
        $('#depart').on('click', function () {
            weui.picker(depart_data, {
                defaultValue: ['1'],
                onChange: function (result) {
                    // console.log(result, '1');
                },
                onConfirm: function (result) {
                    // console.log(result, '2');
                    form_option.depart = result[0];
                    $('#depart .weui-cell__ft').text(result[0].label);
                    $('#depart .weui-cell__ft').css({ color: '#000' });
                    form_option.borrow ? form_option.borrow.value == 2 ? $('#borrow_depart1').show() : $('#borrow_depart1').hide() : null;
                },
                id: 'depart'
            });
        });
    }


    $('#borrow').on('click', function () {
        weui.picker([
            {
                label: '本单位车辆',
                value: '1'
            }, {
                label: '向其他单位借车',
                value: '2'
            }, {
                label: '向车队申请派车',
                value: '3'
            }
        ], {
                defaultValue: ['1'],
                onChange: function (result) {
                    // console.log(result);
                },
                onConfirm: function (result) {
                    // console.log(result);
                    form_option.borrow = result[0];
                    var _v = result[0].value;
                    if (_v == 3) {
                        $('#car_driver').hide();
                        $('#borrow_depart1').hide()
                    } else {
                        $('#car_driver').show();
                        _v == 2 ? $('#borrow_depart1').show() : $('#borrow_depart1').hide();

                    }
                    $('#borrow .weui-cell__ft').text(result[0].label);
                    $('#borrow .weui-cell__ft').css({ color: '#000' });
                    _v == 2 ? b_depart() : null;
                },
                id: 'borrow'
            });
    });
    //借车单位
    function b_depart() {
        $('#borrow_depart').on('click', function () {
            let depart_data = [];
            let _index = null;
            all_depart.forEach((ele, index) => {
                var op = {};
                if (ele.id != 1) {
                    op.label = ele.name;
                    op.value = ele.id;
                    depart_data.push(op)
                }
            })
            _index = depart_data[0].value
            weui.picker(depart_data, {
                defaultValue: [_index],
                onChange: function (result) {

                },
                onConfirm: function (result) {
                    $('#borrow_depart .weui-cell__ft').text(result[0].label);
                    $('#borrow_depart .weui-cell__ft').css({ color: '#000' });
                },
                id: 'borrow_depart'
            });
        });
    }





    // localStorage.setItem('user', JSON.stringify({ df: 1 }))
    $('#audit_user').on('click', function () {

        $('#container').hide();
        $('#audit_list').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '选择审核人';
        var url = 'book';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#audit_list').hide();
        });




    })

    var $submit_success = $('#submit_success');
    $('#toastBtn').on('click', function () {
        if ($submit_success.css('display') != 'none') return;
        $submit_success.fadeIn(100);
        setTimeout(function () {
            $submit_success.fadeOut(100);
        }, 3000);
    });
    // var $submit_unsuccess = $('#submit_unsuccess');
    // $('#toastBtn').on('click', function () {
    //     if ($submit_unsuccess.css('display') != 'none') return;
    //     $submit_unsuccess.fadeIn(100);
    //     setTimeout(function () {
    //         $submit_unsuccess.fadeOut(100);
    //     }, 3000);
    // });
    // console.log(1)


    // $('#address').on('click', function () {
    //     weui.picker([{
    //         label: '广东',
    //         value: 0,
    //         children: [{
    //             label: '广州',
    //             value: 0,
    //             children: [{
    //                 label: '海珠',
    //                 value: 0
    //             }, {
    //                 label: '番禺',
    //                 value: 1
    //             }]
    //         }, {
    //             label: '佛山',
    //             value: 1,
    //             children: [{
    //                 label: '禅城',
    //                 value: 0
    //             }, {
    //                 label: '南海',
    //                 value: 1
    //             }]
    //         }]
    //     }, {
    //         label: '广西',
    //         value: 1,
    //         children: [{
    //             label: '南宁',
    //             value: 0,
    //             children: [{
    //                 label: '青秀',
    //                 value: 0
    //             }, {
    //                 label: '兴宁',
    //                 value: 1
    //             }]
    //         }, {
    //             label: '桂林',
    //             value: 1,
    //             children: [{
    //                 label: '象山',
    //                 value: 0
    //             }, {
    //                 label: '秀峰',
    //                 value: 1
    //             }]
    //         }]
    //     }], {
    //             depth: 3,
    //             defaultValue: [0, 1, 1],
    //             onChange: function onChange(result) {
    //                 console.log(result);
    //             },
    //             onConfirm: function onConfirm(result) {
    //                 // console.log(result);
    //                 var text = result.reduce(function (pre, current) {
    //                     return pre.label ? pre.label + current.label : pre + current.label
    //                 })
    //                 // console.log(text)
    //                 $('#address .weui-cell__ft').text(text);
    //                 $('#address .weui-cell__ft').css({ color: '#000' })
    //             },
    //             id: 'address'
    //         });
    // });

    var use_reason = ['执法办案', '社会面管理', '重大勤务', '督察检查', '指挥通信', '现场勘查', '押解', '勤务保障', '其他执法执勤']
    // use_reason.forEach((ele,index) => {

    // })
    var op_arr = [];
    for (var i = 0; i < use_reason.length; i++) {
        var op_i = {};
        op_i.label = use_reason[i];
        op_i.value = i + 1;
        op_arr.push(op_i);
    }
    console.log(op_arr)
    $('#reason').on('click', function () {
        weui.picker(op_arr, {
            defaultValue: ['1'],
            onChange: function (result) {
                console.log(result);
            },
            onConfirm: function (result) {
                // console.log(result);
                var text = result[0].label;
                $('#reason .weui-cell__ft').text(text);
                $('#reason .weui-cell__ft').css({ color: '#000' })
            },
            id: 'reason'
        });
    });
    $('#select_car').on('click', function () {
        weui.picker([
            {
                label: '浙C9A228',
                value: '1'
            }, {
                label: '浙C9A228(李某某 18325263654)',
                value: '2'
            }, {
                label: '浙C9A228',
                value: '3'
            }
        ], {
                defaultValue: ['1'],
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    console.log(result);
                },
                id: 'select_car'
            });
    });
    // $('#select_driver').on('click', function () {
    //     weui.picker([
    //         {
    //             label: '李某某',
    //             value: '1'
    //         }, {
    //             label: '张某某',
    //             value: '2'
    //         }, {
    //             label: '林某某',
    //             value: '3'
    //         }
    //     ], {
    //             defaultValue: ['1'],
    //             onChange: function (result) {
    //                 console.log(result);
    //             },
    //             onConfirm: function (result) {
    //                 console.log(result);
    //             },
    //             id: 'select_driver'
    //         });
    // });
});