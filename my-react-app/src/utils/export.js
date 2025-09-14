import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { parse } from "../services/group/groupApi";

var dateConv = (x) => {
    try {
        var dt = dayjs(x);
        return dt.isValid()? dt.format('YYYY-MM-DD'): ""; 
    }
    catch {
        return x;
    }
}
;
function getNo(x = ""){
    try {
        var n = parseInt(x.slice(1));
        return isNaN(n) ? "":n;
    } catch {
        return "";
    }
}

const g_dsBan = {
    BĐH: 'Ban điều hành CLB', 
    BQC: 'Ban điều hành quản chúng',
    BTS: 'Ban điều hành tri sự', 
    BNL1: 'Ban điều hành nghi lễ',
    BTC: 'Ban tài chính CLB', 
    NSH: 'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
    BLL: 'Ban Liên Lạc', 
    BAS: 'Ban an sinh', 
    BTT: 'Ban công nghệ thông tin CLB CV',
    LHL: 'Ban điều hành La Hầu La', 
    BHD1: 'Ban điều hành làm video chuyển nghiệp',
    BYT: 'Ban Y Tế',
    BNL2: 'Ban Nghi Lễ CLB'
}

const g_pairs = [
    ["id", "STT"],
    ["name", "HỌ TÊN"],
    ["phapDanh", "PHÁP DANH"],
    ["Chức danh", "CHỨC DANH", function rplcomma(val){return val.replaceAll("\n", ", ")}],
    ["phone", "SỐ ĐIỆN\n  THOẠI"],
    ["birth", "NGÀY THÁNG NĂM SINH", dateConv],
    ["tenFb", "FB ĐĂNG KÝ"],
    ["facebook", "LINK FB ĐĂNG KÝ"],
    ["ngayVaoDaoTrang", "NGÀY GIA NHẬP ĐẠO TRÀNG", dateConv],
    ["ngayLenDuThinh", "NGÀY VÀO TV DỰ THÍNH", dateConv],
    ["ngayLenChinhThuc", "NGÀY VÀO TV CHÍNH THỨC", dateConv],
    ["ngheNghiep", "NGHỀ NGHIỆP\n (Không bắt buộc)"],
    ["address", "ĐỊA CHỈ\n (Số Nhà, Đường/Phố, Quận)"],
    ["cachDTT", "Cách nhà ĐTT (km)"],
    ["Tổ", "THUỘC TỔ", getNo],
    ["kyNang", "GHI CHÚ/\n CÁC KỸ NĂNG"],
    ["BLĐ", "BLĐ"], // a: trưởng, b: phó, c: thành viên, d: tập sự
    ["BQC", "BQC"],
    ["BTS", "BTS"],
    ["BNL", "BNL"],
    ["BTT", "BTT"],
    ["BXE", "BXE"],
    ["BCN", "BCN"],
    ["BAT", "BAT"],
    ["BHD", "BHD"],
    ["BTC", "BTC"],
    ["BAS", "BAS"],
    ["BYT", "BYT"],
    ["TPT", "TPT"],
    ["BVN", "BVN"],
    ["LHL", "LHL"],
    ["Tổ", "Tổ"],
    ["thanhPhan", "Thành phần"]
    ];
function exportAll({groups,users}) {
        let l_groups = groups.map(g=>parse(g));
        let l_userViews = users;
        let l_map = new Map(); // email, user; user.acl = {<ban>:0/1}
        let l_fbs = Object.values(g_dsBan);

        var initUser = (email) => {
            var userView = l_userViews.find(user => user.email === email);
            if (!userView) {
                return false;
            }

            var copyUser = {};
            [
                'email',
                'phapDanh',
                'phone',
                'birth',
                'ngayVaoDaoTrang',
                'ngayLenDuThinh',
                'ngayLenChinhThuc',
                'address',
                'facebook',
                'name',
                'thanhPhan',
                'ngheNghiep',
                'kyNang',
                'tenFb',
                'cachDTT',
            ].forEach(field => copyUser[field] = userView[field]);

            l_map.set(email, copyUser);
            copyUser['acl'] = {};
            copyUser.chucDanhs = [];
            l_fbs.forEach(ban => copyUser.acl[ban] = 0);
            return true;
        }

        var updateAcl = (email, acl, chucDanh) => {
            if (!l_map.has(email)) {
                var bOK = initUser(email);
                if (!bOK) return;
            }
            var user = l_map.get(email);
            acl.forEach(ban => user.acl[ban] = 1);
            user.chucDanhs.push(chucDanh);
        }

        var updateRole = (email, role, group) => {
            if (!l_map.has(email)) {
                var bOK = initUser(email);
                if (!bOK) return;
            }
            var user = l_map.get(email);
            user[group] = role;
        }

        l_groups.forEach(group => {
            var m =group.name.match(/^Tổ (\d+)/i);
            if (m) {
                var n = parseInt(m[1]);
                updateRole(group.leader, "a" + n, "Tổ");
                group.subLeader.forEach(email => updateRole(email, "b" + n, "Tổ"));
                group.members.forEach(email => updateRole(email, "c" + n, "Tổ"));
            }
        });

        l_groups.forEach(group => {
            var acl = [];
            var acl2 = [];
            var ban = group.name;
            switch (group.name) {
                case 'BLĐ':
                    acl = [...l_fbs];
                    ban = 'ĐT';
                    break;
                case 'BQC':
                    acl = ['Ban điều hành CLB',
                        'Ban điều hành quản chúng',
                        'Ban điều hành tri sự',
                        'Ban Liên Lạc',
                        'Ban an sinh',
                        'Ban công nghệ thông tin CLB CV',
                        'Ban điều hành làm video chuyển nghiệp'];
                    acl2 = ['Ban điều hành quản chúng'];
                    break;
                case 'BTS':
                    acl = ['Ban điều hành CLB',
                        'Ban điều hành quản chúng',
                        'Ban điều hành tri sự',
                        'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
                        'Ban Liên Lạc',
                        'Ban an sinh',
                        'Ban điều hành làm video chuyển nghiệp'
                    ];
                    acl2 = ['Ban điều hành tri sự', 'Ban an sinh'];
                    break;
                case 'BNL':
                    acl = [
                        'Ban điều hành CLB',
                        'Ban điều hành nghi lễ',
                        'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
                        'Ban điều hành làm video chuyển nghiệp',
                        g_dsBan.BNL2
                    ];
                    acl2 = [g_dsBan.BNL1, g_dsBan.BNL2];
                    break;
                case 'BTC':
                    acl = ['Ban điều hành CLB',
                        'Ban tài chính CLB',
                        'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
                        'Ban điều hành làm video chuyển nghiệp'];
                    acl2 = ['Ban tài chính CLB'];
                    break;
                case 'BTT':
                    acl = [
                        'Ban điều hành CLB',
                        'Ban điều hành quản chúng',
                        'Ban điều hành tri sự',
                        'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
                        'Ban Liên Lạc',
                        'Ban an sinh',
                        'Ban công nghệ thông tin CLB CV',
                        'Ban điều hành làm video chuyển nghiệp'
                    ];
                    acl2 = ['Ban công nghệ thông tin CLB CV'];
                    break;
                case 'LHL':
                    acl = ['Ban điều hành La Hầu La'];
                    break;
                case 'BYT':
                    acl = [g_dsBan.BYT];
                    acl2 = [g_dsBan.BYT];
                    break;
                case "BAS":
                    acl = acl2 = [];
                    break;
                default:
                    return;
            }

            updateAcl(group.leader, acl, 'Trưởng ' + ban);
            group.subLeader.forEach(email => updateAcl(email, acl, 'Phó ' + ban));
            group.members.forEach(email => updateAcl(email, acl2, 'TV ' + ban));
        });

        l_groups.forEach(group => {
            var acl = [];
            var acl2 = [];
            var ban = group.name;
            if (group.name.match(/^Tổ \d+$/i)) {
                acl = [
                    'Ban điều hành CLB',
                    'Ban điều hành quản chúng',
                    'Ban điều hành tri sự',
                    'Ban điều hành nghi lễ',
                    'Nhóm Sám Hối Gửi Bạch Câu Lạc Bộ',
                    'Ban Liên Lạc',
                    'Ban an sinh',
                ];
                updateAcl(group.leader, acl, 'Trưởng ' + ban);
                group.subLeader.forEach(email => updateAcl(email, acl, 'Phó ' + ban));
            }
        });

        l_groups.forEach(group => {
            switch (group.name) {
                case "BLĐ":
                case "BQC":
                case "BTS":
                case "BNL":
                case "BTT":
                case "BXE":
                case "BCN":
                case "BAT":
                case "BHD":
                case "BTC":
                case "BAS":
                case "BYT":
                case "TPT":
                case "BVN":
                case "LHL":
                    updateRole(group.leader, "a", group.name);
                    group.subLeader.forEach(email => updateRole(email, "b", group.name));
                    group.members.forEach(email => updateRole(email, "c", group.name));
                    group.beginner.forEach(email => updateRole(email, "d", group.name));
                    break;
                default:
                    
            }
        });

        var rows = [];
        var i = 1;
        l_map.forEach(userView => {
            var row = {
                id: userView.email,
                'Số thứ tự thành viên': 'Thành viên ' + i,
                'Chức danh': userView.chucDanhs.join('\n'),
                'Họ và tên': userView.name,
                'Số điện thoại': userView.phone,
                'Link facebook': userView.facebook,
                ...userView.acl,
            };

            [
                'phapDanh',
                'phone',
                'birth',
                'ngayVaoDaoTrang',
                'ngayLenDuThinh',
                'ngayLenChinhThuc',
                'address',
                'facebook',
                'name',
                'thanhPhan',
                'ngheNghiep',
                'kyNang',
                'tenFb',
                'cachDTT',
            ].forEach(field => row[field] = userView[field]);

            [
                "BLĐ",
                "BQC",
                "BTS",
                "BNL",
                "BTT",
                "BXE",
                "BCN",
                "BAT",
                "BHD",
                "BTC",
                "BAS",
                "BYT",
                "TPT",
                "BVN",
                "LHL",
                "Tổ",
            ].forEach(field => row[field] = userView[field]);


            rows.push(row);

            i++;
        })

        // sort by
        rows.sort((a,b)=>{
            var n1 = 9;
            var n2 = 9;
            try{
                n1 = parseInt(a["Tổ"].slice(1));
            }catch{
            }
            try{
                n2 = parseInt(b["Tổ"].slice(1));
            }catch{
            }
            return n1- n2;
        });
        rows.sort((a,b)=>{
            return ('' + a["thanhPhan"]).localeCompare(b["thanhPhan"]);
        });


        return rows;
    }

    /**
     * 
     * @param {input params} dt {groups, users}
     * @param {*} isPreview 
     */
export function exportAllToXlsx(dt, isPreview=false) {
    var rows = exportAll(dt);
    var i = 1;
    var tbl = rows.map(row=>{
        var a = g_pairs.map(pair=>{
            return !pair[0] ? "" : 
            pair.length === 3 ? pair[2](row[pair[0]]) : 
            row[pair[0]];
        });
        return a;
    }); 
    tbl.unshift(g_pairs.map(pair=>pair[1]));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(tbl);
    XLSX.utils.book_append_sheet(workbook, worksheet, dt.name);
    if (isPreview) {
        var a = window.open('', '', 'height=500, width=1000');
        a.document.write('<style>@page {size: auto;  margin: 0mm; }</style>');
        a.document.write('<style>table, th, td {border: 1px solid black;}</style>');
        a.document.close();
        a.document.title = dt.name;

        var container = a.document.body.appendChild(a.document.createElement('div'));
        container.innerHTML = XLSX.utils.sheet_to_html(worksheet);
    } else {
        XLSX.writeFile(workbook, dt.name + ".xlsx");
    }
}

