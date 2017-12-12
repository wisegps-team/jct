$(document).ready(function () {
    let _g = W.getSearch();
    let pageSize = 20, pagenum = 1;
    let type = 1;
    let lc = {
        2: '科所队领导审批',
        3: '专管员审批',
        4: '警务保障室领导审批',
        6: '局领导审批',
        0: '待报销',
        A: '已结束'
    }
    let wx = {
        A: '发动机',
        B: '地盘',
        C: '电路',
        D: '轮胎',
        E: '外壳',
        Z: '其他',
    }
    let app_state = {
        0: '撤销',
        1: '审批中',
        4: '审批驳回',
        5: '待报销',
        6: '已结束'
    }
    let _HPZL = {
        '01': '大型汽车',
        '02': '小型汽车'
    }
    function getUser() {
        W.ajax('/get_user', {
            data: { userid: _g.UserId },
            success: function (res) {
                console.log(res, 'rs')
                window._user = res;
                localStorage.setItem('user', JSON.stringify(_user))
            }
        })
    }
    getUser();


    function getapply(data) {
        console.log(data)
        W.ajax('/pc/_getapply', {
            data: { depart: data.depart.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                // console.log(res, '1')
                if (res.data) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#repair_info').empty();
                    $('#page').text('无数据')
                }
            }
        })
    }

    function get_audited(data) {
        W.ajax('/pc/_getaudit', {
            data: { uid: data.user.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                console.log(res, '1')
                if (res.data) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#repair_info').empty();
                    $('#page').text('无数据')
                }

            }
        })
    }

    function get_auditing(data) {
        W.ajax('/pc/_getauditing', {
            data: { uid: data.user.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                console.log(res, '1')
                if (res.data) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#repair_info').empty();
                    $('#page').text('无数据')
                }

            }
        })
    }

    function apply_table(data) {
        $('#repair_info').empty();
        data.forEach((ele, index) => {
            if (ele.WXLX) {
                let wxlx = ''
                ele.WXLX.split('').forEach(e => {
                    wxlx += (wx[e] + '、')
                })
                wxlx = wxlx.slice(0, -1)
                let _href = "./pc_repair_detail?applyid=" + ele.XLH;
                if (type == 1) {
                    _href += '&my=' + true;
                } else if (type == 2) {
                    _href += '&audited=' + true;
                } else if (type == 3) {
                    _href += '&auditing=' + true
                }
                let tr_content = `<tr class="info">
                <td>${index}</td>
                <td>${ele.HPHM}</td>
                <td>${_HPZL[ele.HPZL]}</td>
                <td>${wxlx} </td>
                <td>${ele.YJJED}</td>
                <td>${ele.SQR}</td>
                <td>${W.dateToString(W.date(ele.SQSJ))}</td>
                <td>${app_state[ele.STATE]}</td>
                <td>${lc[ele.DQLC]}</td>
                <td>${lc[ele.XGLC]}</td>
                <td>${ele.ZJE}</td>
                <td><a href=${_href}>详情</a></td>
            </tr>`
                $('#repair_info').append(tr_content)
            }

        })
    }
    //分页
    function getPage(data) {
        $("#page").paging({
            pageNo: pagenum,
            totalPage: data.totalPage,
            totalSize: data.total,
            callback: function (num) {
                // alert(num)
                pagenum = num;
                if (type == 1) {
                    getapply(_user)
                } else if (type == 2) {
                    get_audited(_user)
                } else if (type == 3) {
                    get_auditing(_user)
                }

            }
        })
    }

    //已提交
    $('#ytj').on('click', function () {
        $('.dropdown-toggle').empty();
        $('.dropdown-toggle').append(`已提交
        <strong class="caret"></strong>`);
        type = 1;
        pagenum = 1;
        getapply(_user)
    })



    //已审核
    $('#ysh').on('click', function () {
        $('.dropdown-toggle').empty();
        $('.dropdown-toggle').append(`已审核
        <strong class="caret"></strong>`)
        pagenum = 1;
        type = 2
        get_audited(_user)
    })
    //未审核
    $('#wsh').on('click', function () {
        $('.dropdown-toggle').empty();
        $('.dropdown-toggle').append(`未审核
        <strong class="caret"></strong>`);
        pagenum = 1;
        type = 3;
        get_auditing(_user)
        // get_audited(_user)
    })




    $('#Toggle_apply').on('click', function () {
        $('#pc_fix_apply').toggle('slow', function () {
            // console.log($('#pc_fix_apply'));
            toggle_Apply();
        })
    })
    function toggle_Apply() {
        let _child = $('#pc_fix_apply')[0].children;
        if (_child.length == 0) {
            $('#pc_fix_apply').append(`<div style="height:9%;background:#4984de">
                <span style="display:inline-block;height:100%;width:20%" id="back_apply">
                    <i class="iconfont icon-fanhui apply_back"></i>
                </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="../fix_apply"></iframe>`)
            $('#back_apply').on('click', function () {
                $('#pc_fix_apply').toggle('normal', function () {
                    // console.log($('#pc_apply'), 'dd')
                    toggle_Apply()
                })
            })
        } else {
            $('#pc_fix_apply').empty()
        }
    }
})