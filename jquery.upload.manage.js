;
(function($) {
    'use strict';
    // 插件实例
    var plugins = {};
    // 标识
    var gIndex = 0;
    // 前缀
    var gPreffix = 'uploader_';

    // 定义类
    function UploadManage() {
        this.$element = null;
        this.view = null;
        this.fileList = null;
        this.imageType = /(\.|\/)(gif|jpe?g|png)$/i;
        this.excelType = /(\.|\/)(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel|msexcel|x-msexcel|x-ms-excel|x-excel|x-dos_ms_excel|xls|x-xls)$/i;
        this.options = {
            view: '#rocoDndArea', //拖拽区域
            fileList: '#rocoFileList', //文件列表
            statusBar: '#rocoStatusBar', //全局状态条
            queueList: '#rocoQueueList', //总体范围
            autoUpload: true, //是否自动上传
            limitMultiFileUploadSize: 2048000, //单个文件最大上传容量，单位为byte
            limitMultiFileNumber: 5, //限制上传数量
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i, //允许上传文件类型
        };
        // 模板
        this.template = function(file, exist) {
            var fragment = '';
            fragment += '<div id="' + file.id + '" class="thumbnail ' + (exist ? '' : 'thumbnail-bg') + '">';
            fragment += '<p class="title" title="' + file.name + '">' + file.name + '</p>';
            fragment += '<p class="imgWrap ' + file.bgClass + '">';
            if (file.fullPath) {
                fragment += '<img src="' + file.fullPath + '">';
            } else {
                fragment += '<img src="" style="display:none;">';
            }
            fragment += '<input type="hidden" value="' + (file.path || '') + '"/>';
            fragment += '</p>';
            fragment += '<p class="progress"><span></span></p>';
            fragment += '<div class="file-panel"' + ( exist ? 'style="display:block;"' : '')+'>';
            fragment += '<i data-handle="remove_arrow_click" class="fa fa-times" data-toggle="tooltip" data-placement="top" title="删除" alt="删除"></i>';
            fragment += '<i data-handle="down_arrow_click" class="fa fa-arrow-down" title="下移" alt="下移"></i>';
            fragment += '<i data-handle="up_arrow_click" class="fa fa-arrow-up" title="上移" alt="上移"></i>';
            fragment += '<i data-handle="upload_click" class="fa fa-play" title="上传" alt="上传"' + (this.options.autoUpload ? 'style="display:none;"' : '') + '></i>';
            fragment += '<i data-handle="repeat_click" class="fa fa-repeat" title="重试" alt="重试" style="display:none;"></i>';
            fragment += '</div>';
            fragment += '</div>';
            return fragment;
        };
        // id索引
        this.idIndex = 0;
        this.imgNumber = 0;
    };

    // 扩展方法到prototype
    $.extend(UploadManage.prototype, {
        _init: function(target, _options) {
            this.$element = $(target);
            $.extend(this.options, _options || {});
            this._bindEvent();
        },
        // 绑定事件
        _bindEvent: function() {
            var self = this;
            var _$fileList = $(this.options.fileList, this.$element);
            // 解除掉所有click方法
            _$fileList.off('click');

            // 上移
            _$fileList.on('click', '[data-handle="up_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.insertBefore(_$item.prev());
                self._decorateItem();
                event.stopPropagation();
            });

            // 下移
            _$fileList.on('click', '[data-handle="down_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.insertAfter(_$item.next());
                self._decorateItem();
                event.stopPropagation();
            });

            // 删除
            _$fileList.on('click', '[data-handle="remove_arrow_click"]', function(event) {
                var _$item = $(this).parents('.thumbnail');
                _$item.remove();
                self._decorateItem();
                self._size();
                event.stopPropagation();
            });
        },
        _dataBindEvent: function($item, data) {
            // 开始上传
            $item.on('click', '[data-handle="upload_click"]', function(event) {
                $(this).hide();
                data.submit();
            });

            // 重试
            $item.on('click', '[data-handle="repeat_click"]', function(event) {
                $(this).hide();
                data.submit();
            });
        },
        // 装饰
        _decorateItem: function() {
            var imgItems = $(this.options.fileList, this.$element).find('.thumbnail');
            var length = imgItems.length;
            (length >= 0) && imgItems.each(function(index, element) {
                var _item = $(element);
                if ((index + 1) == 1) {
                    _item.find('[data-handle="up_arrow_click"]').hide();
                } else {
                    _item.find('[data-handle="up_arrow_click"]').show();
                }
                if ((index + 1) == length) {
                    _item.find('[data-handle="down_arrow_click"]').hide();
                } else {
                    _item.find('[data-handle="down_arrow_click"]').show();
                }
            });
        },
        // 进度条
        progress: function(data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            var file = data.files[0];
            $('#' + file.id).find('.progress span').animate({
                width: progress + '%'
            }, 500, function() {
                var _this = this;
                setTimeout(function() {
                    $(_this).hide();
                }, 2000);
            });
            return this;
        },
        // 个数
        size: function() {
            return this.imgNumber;
        },
        // 修正imgNumber
        _size: function() {
            this.imgNumber = $(this.options.fileList, this.$element).find('.thumbnail').length;
        },
        // 添加
        add: function(data, exist) {
            var file = null;
            if (!exist) {
                file = data.files[0];
            } else {
                file = data;
            }
            // 创建id
            file.id = new Date().getTime() + '_' + this.idIndex++;
            if (!exist) {
                if (this.imageType.test(file.type)) {
                    file.bgClass = 'bg-image';
                } else if (this.excelType.test(file.type)) {
                    file.bgClass = 'bg-excel';
                }
            }

            // 插入dom
            var _$imgItem = $(this.template(file, exist)).insertBefore($(this.options.view, this.$element));
            // 不自动上传的绑定手动事件
            // if (!this.options.autoUpload) {
            this._dataBindEvent(_$imgItem, data);
            // }
            this._decorateItem();
            this.imgNumber++;
            return this;
        },
        // 插入已有的
        addExist: function(files) {
            var self = this;
            $.each(files, function(index, file) {
                file.bgClass = 'bg-' + file.type;
                self.add(file, true);
            });
        },
        // 上传完成
        done: function(data) {
            var file = data.files[0];
            var res = data.result.data;
            var uploadItem = $('#' + file.id);
            uploadItem.find('.file-panel').css('display', 'block');
            // 隐藏域赋值
            uploadItem.find('input').val(res.path);
            // 是图片的，显示服务器图 去掉背景
            (file.bgClass === 'bg-image') && uploadItem.find('img').attr('src', res.fullPath).css('display', 'block') && uploadItem.removeClass('thumbnail-bg');
            return this;
        },
        // 检查
        check: function(data) {
            var self = this;
            var hasError = false; //是否有错误发生
            // 遍历文件
            $.each(data.files, function(index, file) {
                // 检查文件类型
                if (!self.options.acceptFileTypes.test(file.type)) {
                    toastr.warning(file.name + '属于不支持的文件类型');
                    hasError = true;
                }
                // 检查文件大小
                if (file.size > self.options.limitMultiFileUploadSize) {
                    toastr.warning(file.name + '容量超过', parseInt(self.options.limitMultiFileUploadSize / 1024 / 1024) + 'MB');
                    hasError = true;
                }
                // 不支持html5 api的只能检查文件名
            });

            // 检查上传个数
            hasError = self.numberCheck(hasError, data);
            return hasError;
        },
        // 数量检查
        numberCheck: function(hasError, data) {
            if ((this.imgNumber > this.options.limitMultiFileNumber) ||
                (this.imgNumber + data.files.length > this.options.limitMultiFileNumber)) {
                toastr.warning('上传文件不能超过' + this.options.limitMultiFileNumber + '个');
                hasError = true;
            }
            return hasError;
        },
        // 获得上传路径
        getUploads: function() {
            var pathArray = [];
            $(this.options.fileList, this.$element).find('input[type="hidden"]').each(function(index, element) {
                pathArray.push(element.value);
            });
            return pathArray;
        },
        // 上传重试
        retry: function(data) {
            var file = data.files[0];
            $('#' + file.id).find('[data-handle="repeat_click"]').css('display', 'block');
        }
    });

    // 定义jQuery插件名
    $.fn.uploadManage = function(_options) {
        var self = this;
        // 先取出其他参数，如果有的话
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        // string类型表示要做其他操作
        if (typeof _options === 'string') {
            if (!plugins[this.uploaderIndex][_options] || _options.charAt(0) === '_') {
                throw '未知的方法:' + _options;
            }
            // 将dom和对应剩余参数传入
            return plugins[this.uploaderIndex][_options].apply(plugins[this.uploaderIndex], otherArgs);
        } else {
            // 重新初始化对象
            self.uploaderIndex = gPreffix + gIndex++;
            plugins[self.uploaderIndex] = new UploadManage();
            // 返回jQuery链式对象
            return this.each(function(index, element) {
                // 初始化方法
                plugins[self.uploaderIndex]._init(element, _options || {});
            });
        }

    }
})(this.jQuery);