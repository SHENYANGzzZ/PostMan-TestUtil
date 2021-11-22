const MyVue = {
    data() {
        return {
            message: "Hello Vue!!",

            reqActiveName: "first",
            resActiveName: "first",


            // 请求数据
            requestData: {
                url: '',  // http://10.0.100.101:8081/manage-central/menus
                method: 'POST',
                body: '',
                type: ''
            },

            // 请求头
            dynamicValidateForm: {
                domains: [{
                    key: '',
                    value: ''
                }]
            },

            // 控制输入栏左侧 请求状态
            responseStatus: '',

            // 输入栏左侧 请求中状态
            loading: false,


            headerDisable: false,

            placeholder: '请输入',

            // 响应体 数据暂存
            resBoxData: {},
            // 响应体状态码
            statusCode: ''
        };
    },

    mounted: function () {
        // 初始化待输入样式
        $('.el-input-group__prepend').css("background", "#E3E3E3");
        $('.el-input__inner:first').css("border", "2px #E3E3E3 solid");
    },

    computed: {},
    watch: {
        responseStatus: function (val, oldVal) {
            // 控制请求不同状态下的样式
            switch (val) {
                case "success":
                    $('.el-input-group__prepend').css("background", "#28A745");
                    $('.el-input-group__prepend').css("border", "2px #28A745 solid");
                    $('.el-input__inner:first').css("border", "2px #28A745 solid");
                    break;

                case "error":
                    $('.el-input-group__prepend').css("background", "#FF4444");
                    $('.el-input-group__prepend').css("border", "2px #FF4444 solid");
                    $('.el-input__inner:first').css("border", "2px #FF4444 solid");
                    break;

                default:
                    $('.el-input-group__prepend').css("background", "#E3E3E3");
                    $('.el-input-group__prepend').css("border", "2px #E3E3E3 solid");
                    $('.el-input__inner:first').css("border", "2px #E3E3E3 solid");
            }
        }
    },

    methods: {
        changeHandle() {
        },

        reqHandleClick() {
        },

        resHandleClick() {
        },

        // 发送请求方法
        sendFunc() {
            let _this = this;

            // 头部输入框校验
            if (!this.requestData.method || !this.requestData.url) {
                ElementPlus.ElMessage.warning('请输入完整请求路径！');
                _this.responseStatus = '';
                return;
            }

            // 新的请求将样式重置一下
            _this.loading = true;
            _this.responseStatus = '';


            // 请求上下文数据
            let data = {};
            let headers = {};
            let contentType = '';

            debugger

            // 一些数据的校验
            try {
                if (this.requestData.body) {
                    data = this.requestData.body;
                }

                let arr = Vue.toRaw(this.dynamicValidateForm.domains);
                arr.forEach(item => {
                    if (item.key) {
                        headers[item.key] = item.value;
                    }
                })

                if (this.requestData.type) {
                    contentType = this.requestData.type;
                }
            } catch (e) {
                alert(e)
                _this.loading = false;
                _this.responseStatus = '';
                return
            }


            // 用阿贾克斯发送请求 >_<
            $.ajax({
                method: this.requestData.method,
                url: this.requestData.url,
                data: data,
                headers: headers,
                contentType: contentType,
                // cache: false,
                dataType: 'Json',
                success(result, status, xhr) {
                    _this.dataToView(result, status, xhr);
                },
                error(xhr, status, error) {
                    _this.dataToView(xhr.responseJSON, status, xhr);
                }
            });
        },


        // 将响应数据渲染到界面
        dataToView(result, status, xhr) {
            let _this = this;

            // el-message
            if (status === 'success') {
                ElementPlus.ElMessage({
                    message: status,
                    type: 'success',
                    showClose: true,
                    duration: 1000
                });
            } else {
                ElementPlus.ElMessage({
                    message: status,
                    type: 'error',
                    showClose: true,
                    duration: 1000
                });
            }

            // pending
            _this.loading = false;

            // 请求 成功/失败
            _this.responseStatus = status;

            // 请求响应状态码
            _this.statusCode = xhr.status;

            // 请求体，这边设置了为Json
            _this.resBoxData = result

            // 第三方或自定义的渲染样式
            _this.resBoxClick('Copy');

            // 请求头信息
            $('#resHeader').html(xhr.getAllResponseHeaders());
        },

        // 删除一条请求头
        removeDomain(item) {
            var index = this.dynamicValidateForm.domains.indexOf(item)
            if (index !== -1) {
                this.dynamicValidateForm.domains.splice(index, 1)
            }
        },

        // 添加一条请求头
        addDomain() {
            this.dynamicValidateForm.domains.push({
                key: '',
                value: ''
            });
        },

        // 请求body 格式化
        jsonCheck(json) {
            let _this = this;
            var text_value = _this.requestData.body;
            if (text_value == "") {
                ElementPlus.ElMessage.warning('不能为空');
                return false;
            } else {
                var res = "";
                for (var i = 0, j = 0, k = 0, ii, ele; i < text_value.length; i++) {//k:缩进，j:""个数
                    ele = text_value.charAt(i);
                    if (j % 2 == 0 && ele == "}") {
                        k--;
                        for (ii = 0; ii < k; ii++) ele = "    " + ele;
                        ele = "\n" + ele;
                    } else if (j % 2 == 0 && ele == "{") {
                        ele += "\n";
                        k++;
                        for (ii = 0; ii < k; ii++) ele += "    ";
                    } else if (j % 2 == 0 && ele == ",") {
                        ele += "\n";
                        for (ii = 0; ii < k; ii++) ele += "    ";
                    } else if (ele == "\"") j++;
                    res += ele;
                }
                _this.requestData.body = res;
            }
        },


        // 请求体 不同展示类型 切换
        resBoxClick(type) {
            let _this = this;

            let data = Vue.toRaw(_this.resBoxData);

            if (JSON.stringify(data) === '{}') {
                return
            }

            switch (type) {
                case 'Copy':
                    $('#resBody').html(_this.JsonFormat(data));
                    break;

                case 'Preview':
                    $("#resBody").JSONView(data, {
                        collapsed: false,  // 是否在第一次渲染时收缩所有的节点，默认值为：false。
                        nl2br: true, // 是否将一个新行转换为<br>字符串，默认值为false
                        recursive_collapser: false,  // 是否递归收缩节点，默认值为false
                        key_marks: false,
                        link_marks: false,
                    });
                    break;

                default:
            }
        },

        // 将Json格式加点颜色
        JsonFormat(jsonData) {
            var json = jsonData
            if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }


    },
};

Vue.createApp(MyVue).use(ElementPlus).mount("#root");
